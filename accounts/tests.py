from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from accounts.models import EmailVerificationToken
import io
import sys

class EmailBased2FATest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_email_verification_token_creation_and_single_use(self):
        user = User.objects.create_user(username='testtokenuser', password='Password123!')
        token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='signup')
        
        self.assertIsNotNone(token_obj)
        self.assertTrue(token_obj.is_valid())
        
        # Verify and consume token
        used_token = EmailVerificationToken.verify_and_use_token(raw_token, token_type='signup')
        self.assertIsNotNone(used_token)
        self.assertEqual(used_token.user, user)
        self.assertTrue(used_token.is_used)

        # Single-use test: re-using raw_token must fail
        reuse_token = EmailVerificationToken.verify_and_use_token(raw_token, token_type='signup')
        self.assertIsNone(reuse_token)

    def test_signup_creates_inactive_user_prints_terminal_verification_link_and_returns_generic_message(self):
        captured_output = io.StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_output

        try:
            response = self.client.post(reverse('signup'), {
                'username': 'newuser1',
                'password1': 'StrongP@ssw0rd123!',
                'password2': 'StrongP@ssw0rd123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        output_str = captured_output.getvalue()

        # 1. Verify user created as inactive
        user = User.objects.filter(username='newuser1').first()
        self.assertIsNotNone(user)
        self.assertFalse(user.is_active)

        # 2. Verify terminal link output
        self.assertIn("[EMAIL VERIFICATION]", output_str)
        self.assertIn("User: newuser1", output_str)
        self.assertIn("/accounts/verify-email/", output_str)

        # 3. Verify generic response message shown without revealing account details
        self.assertContains(response, "If an account exists with this information, an email has been sent")

    def test_existing_user_signup_does_not_reveal_existence_and_prints_verification_link(self):
        # Pre-create user
        existing = User.objects.create_user(username='existinguser', password='Password123!', is_active=True)

        captured_output = io.StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_output

        try:
            response = self.client.post(reverse('signup'), {
                'username': 'existinguser',
                'password1': 'StrongP@ssw0rd123!',
                'password2': 'StrongP@ssw0rd123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        output_str = captured_output.getvalue()

        # Should show exact same generic message
        self.assertContains(response, "If an account exists with this information, an email has been sent")
        self.assertIn("[EMAIL VERIFICATION]", output_str)
        self.assertIn("User: existinguser", output_str)

    def test_email_verification_link_activates_user(self):
        user = User.objects.create_user(username='verifyuser', password='Password123!', is_active=False)
        token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='signup')

        verify_url = reverse('verify_email_token', kwargs={'raw_token': raw_token})
        response = self.client.get(verify_url, follow=True)

        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertRedirects(response, reverse('login'))

    def test_email_based_2fa_login_flow(self):
        user = User.objects.create_user(username='login2fauser', password='Password123!', is_active=True)

        captured_output = io.StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_output

        try:
            # 1. Post valid username + password
            response = self.client.post(reverse('login'), {
                'email': 'login2fauser',
                'password': 'Password123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        output_str = captured_output.getvalue()

        # Check info message & terminal output
        self.assertContains(response, "A 2FA login verification link has been sent to your email")
        self.assertIn("[EMAIL 2FA LOGIN VERIFICATION LINK]", output_str)
        self.assertIn("/accounts/verify-2fa/", output_str)

        # Extract raw_token from stdout
        lines = output_str.splitlines()
        twofa_url = None
        for line in lines:
            if "/accounts/verify-2fa/" in line:
                twofa_url = line.strip()
                break

        self.assertIsNotNone(twofa_url)

        # 2. Click 2FA login link
        login_response = self.client.get(twofa_url, follow=True)
        self.assertEqual(login_response.status_code, 200)

        # 3. Verify user is logged in
        self.assertEqual(int(self.client.session['_auth_user_id']), user.pk)




