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

    def test_email_verification_link_activates_and_logs_in_user(self):
        user = User.objects.create_user(username='verifyuser', password='Password123!', is_active=False)
        token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='signup')

        verify_url = reverse('verify_email_token', kwargs={'raw_token': raw_token})
        response = self.client.get(verify_url, follow=True)

        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertEqual(int(self.client.session['_auth_user_id']), user.pk)

    def test_inactive_account_login_sends_verification_email(self):
        user = User.objects.create_user(username='inactiveuser', password='Password123!', is_active=False)

        captured_output = io.StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_output
        try:
            response = self.client.post(reverse('login'), {
                'email': 'inactiveuser',
                'password': 'Password123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        self.assertContains(response, "Your account is inactive. Email verification is required to log in")
        self.assertIn("[EMAIL VERIFICATION]", captured_output.getvalue())

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

        # 4. Visiting login page while logged in redirects (does not show form or send 2FA)
        login_page_response = self.client.get(reverse('login'))
        self.assertEqual(login_page_response.status_code, 302)

        # 5. Log out
        self.client.post(reverse('logout'))
        self.assertNotIn('_auth_user_id', self.client.session)

        # 6. Log back in within the same session - 2FA should NOT be sent again
        captured_output_2 = io.StringIO()
        sys.stdout = captured_output_2
        sys.stderr = captured_output_2
        try:
            relogin_response = self.client.post(reverse('login'), {
                'email': 'login2fauser',
                'password': 'Password123!'
            }, follow=True)
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        # User is logged in directly without 2FA
        self.assertEqual(relogin_response.status_code, 200)
        self.assertEqual(int(self.client.session['_auth_user_id']), user.pk)
        output_str_2 = captured_output_2.getvalue()
        self.assertNotIn("[EMAIL 2FA LOGIN VERIFICATION LINK]", output_str_2)

    def test_2fa_sent_only_once_while_pending_in_session(self):
        user = User.objects.create_user(username='pending2fauser', password='Password123!', is_active=True)

        captured_output_1 = io.StringIO()
        sys.stdout = captured_output_1
        sys.stderr = captured_output_1
        try:
            res1 = self.client.post(reverse('login'), {
                'email': 'pending2fauser',
                'password': 'Password123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        self.assertContains(res1, "A 2FA login verification link has been sent to your email")
        self.assertIn("[EMAIL 2FA LOGIN VERIFICATION LINK]", captured_output_1.getvalue())

        # Second POST in the same session without verifying yet
        captured_output_2 = io.StringIO()
        sys.stdout = captured_output_2
        sys.stderr = captured_output_2
        try:
            res2 = self.client.post(reverse('login'), {
                'email': 'pending2fauser',
                'password': 'Password123!'
            })
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        self.assertContains(res2, "A 2FA login verification link has been sent to your email")
        # Ensure it was not sent again
        self.assertNotIn("[EMAIL 2FA LOGIN VERIFICATION LINK]", captured_output_2.getvalue())

    def test_password_change_invalidates_2fa_session(self):
        user = User.objects.create_user(username='pwdchangeuser', password='OldPassword123!', is_active=True)

        # 1. First login with 2FA
        captured_output = io.StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_output
        try:
            self.client.post(reverse('login'), {'email': 'pwdchangeuser', 'password': 'OldPassword123!'})
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        # Extract 2FA token url and verify
        lines = captured_output.getvalue().splitlines()
        twofa_url = next(line.strip() for line in lines if "/accounts/verify-2fa/" in line)
        self.client.get(twofa_url, follow=True)

        # 2. Change password
        user.set_password('NewPassword456!')
        user.save()

        # 3. Log out and log back in with new password
        self.client.post(reverse('logout'))

        captured_output_after = io.StringIO()
        sys.stdout = captured_output_after
        sys.stderr = captured_output_after
        try:
            res = self.client.post(reverse('login'), {'email': 'pwdchangeuser', 'password': 'NewPassword456!'})
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

        # Since password changed, 2FA must be required again
        self.assertContains(res, "A 2FA login verification link has been sent to your email")
        self.assertIn("[EMAIL 2FA LOGIN VERIFICATION LINK]", captured_output_after.getvalue())









