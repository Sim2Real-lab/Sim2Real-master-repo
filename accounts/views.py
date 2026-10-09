from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .tokens import account_activation_token
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib import messages
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.cache import never_cache
from django.utils import timezone
from .models import PasswordResetOTP
from .forms import OTPRequestForm, OTPVerifyForm
from django.db import transaction
import random
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

import sys
from .models import EmailVerificationToken, PasswordResetOTP
from .decorators import is_2fa_verified_for_session, mark_2fa_verified_in_session, clear_2fa_session

def send_rich_verification_email(user, verify_link, email_title, email_heading, email_body_text, action_button_text, subject):
    recipient_email = user.email or f"{user.username}@example.com"
    context = {
        'username': user.username,
        'verify_link': verify_link,
        'email_title': email_title,
        'email_heading': email_heading,
        'email_body_text': email_body_text,
        'action_button_text': action_button_text,
    }
    html_content = render_to_string('accounts/email_verification.html', context)
    text_content = f"Hello {user.username},\n\n{email_body_text}\n\nPlease click the link below to proceed:\n{verify_link}\n\nSim2Real 2026 Team"

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email]
    )
    msg.attach_alternative(html_content, "text/html")
    try:
        msg.send(fail_silently=True)
    except Exception as e:
        print(f"Error sending email: {e}", flush=True)


def _print_terminal_link(title: str, user: User, link: str, email: str = None):
    user_email = email or user.email or f"{user.username}@example.com"
    msg = (
        "\n=======================================================\n"
        f"[{title}]\n"
        f"User: {user.username}\n"
        f"Email: {user_email}\n"
        f"Verification Link:\n"
        f"{link}\n"
        "=======================================================\n\n"
    )
    print(msg, flush=True)
    sys.stdout.write(msg)
    sys.stdout.flush()
    sys.stderr.write(msg)
    sys.stderr.flush()



@never_cache
def login_view(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'userrole') and request.user.userrole.is_organiser:
            return redirect('staff_dashboard')
        return redirect('home')

    if request.method == 'POST':
        user_input = (request.POST.get('email') or request.POST.get('username') or '').strip()
        password = request.POST.get('password')

        user_obj = User.objects.filter(username=user_input).first() or User.objects.filter(email=user_input).first()
        auth_username = user_obj.username if user_obj else user_input
        user = authenticate(request, username=auth_username, password=password)

        if user is None:
            return render(request, 'accounts/login.html', {
                'login_error': 'Invalid username or password'
            })

        # Password is correct. Check if account is active (verified email)
        if not user.is_active:
            # Generate signup verification link
            token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='signup')
            verify_link = request.build_absolute_uri(
                reverse('verify_email_token', kwargs={'raw_token': raw_token})
            )
            _print_terminal_link("EMAIL VERIFICATION", user, verify_link)
            send_rich_verification_email(
                user=user,
                verify_link=verify_link,
                email_title="Verify Your Sim2Real Account",
                email_heading="Email Verification Required",
                email_body_text="Please click the button below to verify your email address and automatically log in to your account.",
                action_button_text="Verify & Log In",
                subject="Verify your SIM2REAL account"
            )
            
            return render(request, 'accounts/login.html', {
                'login_error': 'Your account requires email verification. A verification link has been sent to your email (and terminal log).'
            })

        # Check if 2FA has already been verified in this session
        if is_2fa_verified_for_session(request, user):
            auth_login(request, user)
            messages.success(request, "Logged in successfully")
            redirect_url = 'staff_dashboard' if (hasattr(user, 'userrole') and user.userrole.is_organiser) else 'home'
            response = redirect(redirect_url)
            mark_2fa_verified_in_session(request, response, user)
            return response

        # Check if a 2FA link was already sent in this session and is still active
        active_token = EmailVerificationToken.objects.filter(
            user=user, token_type='login_2fa', is_used=False
        ).order_by('-created_at').first()

        if active_token and active_token.is_valid() and request.session.get('twofa_sent_for_user') == user.pk:
            return render(request, 'accounts/login.html', {
                'login_info': 'A 2FA login verification link has been sent to your email (and terminal log). Please click the link to complete your login.'
            })

        # User is active -> Trigger Email-Based 2FA Login for the first time in this session
        token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='login_2fa')
        twofa_link = request.build_absolute_uri(
            reverse('verify_2fa_token', kwargs={'raw_token': raw_token})
        )

        _print_terminal_link("EMAIL 2FA LOGIN VERIFICATION LINK", user, twofa_link)

        # Send rich 2FA email
        send_rich_verification_email(
            user=user,
            verify_link=twofa_link,
            email_title="Sim2Real 2FA Login Verification",
            email_heading="Confirm Your Login",
            email_body_text="A login request was initiated for your account. Click the button below to authorize this sign-in and log into your dashboard.",
            action_button_text="Authorize & Log In",
            subject="SIM2REAL 2FA Login Verification Link"
        )

        request.session['twofa_sent_for_user'] = user.pk

        return render(request, 'accounts/login.html', {
            'login_info': 'A 2FA login verification link has been sent to your email (and terminal log). Please click the link to complete your login.'
        })

    return render(request, 'accounts/login.html')


@never_cache
def signup_view(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'userrole') and request.user.userrole.is_organiser:
            return redirect('staff_dashboard')
        return redirect('home')

    generic_msg = "If an account exists with this information, an email has been sent. Please check your email."

    if request.method == 'POST':
        username = (request.POST.get('username') or request.POST.get('email') or '').strip()
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if not username:
            return render(request, 'accounts/signup.html', {'signup_error': 'Username is required'})

        if password1 != password2:
            return render(request, 'accounts/signup.html', {'signup_error': 'Passwords do not match'})

        try:
            validate_password(password1)
        except ValidationError as e:
            return render(request, 'accounts/signup.html', {'signup_error': " ".join(e.messages)})

        # Check if user already exists
        existing_user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
        if existing_user:
            # DO NOT reveal existence with error message. Create verification token & print link.
            token_obj, raw_token = EmailVerificationToken.create_token(existing_user, token_type='signup')
            verify_link = request.build_absolute_uri(
                reverse('verify_email_token', kwargs={'raw_token': raw_token})
            )
            _print_terminal_link("EMAIL VERIFICATION", existing_user, verify_link)
            send_rich_verification_email(
                user=existing_user,
                verify_link=verify_link,
                email_title="Verify Your Sim2Real Account",
                email_heading="Email Verification Required",
                email_body_text="Please click the button below to verify your email address and automatically log in to your account.",
                action_button_text="Verify & Log In",
                subject="Verify your SIM2REAL account"
            )
            return render(request, 'accounts/signup.html', {'signup_info': generic_msg})

        email_address = username if '@' in username else f"{username}@example.com"

        try:
            with transaction.atomic():
                user = User.objects.create_user(username=username, email=email_address, password=password1)
                user.is_active = False
                user.save()

                token_obj, raw_token = EmailVerificationToken.create_token(user, token_type='signup')
                verify_link = request.build_absolute_uri(
                    reverse('verify_email_token', kwargs={'raw_token': raw_token})
                )
                _print_terminal_link("EMAIL VERIFICATION", user, verify_link, email=email_address)

                # Send rich verification email
                send_rich_verification_email(
                    user=user,
                    verify_link=verify_link,
                    email_title="Verify Your Sim2Real Account",
                    email_heading="Welcome to Sim2Real 2026!",
                    email_body_text="Thank you for creating an account. Please click the button below to verify your email address and automatically log in.",
                    action_button_text="Verify & Log In",
                    subject="Verify your SIM2REAL account"
                )

        except Exception as e:
            return render(request, 'accounts/signup.html', {'signup_error': f"Error creating user: {str(e)}"})

        return render(request, 'accounts/signup.html', {'signup_info': generic_msg})

    return render(request, 'accounts/signup.html')


def verify_email_view(request, raw_token):
    token_obj = EmailVerificationToken.verify_and_use_token(raw_token, token_type='signup')
    if token_obj:
        user = token_obj.user
        user.is_active = True
        user.save(update_fields=['is_active'])
        auth_login(request, user)
        messages.success(request, "Account verified & logged in successfully! Welcome to Sim2Real.")
        redirect_url = 'staff_dashboard' if (hasattr(user, 'userrole') and user.userrole.is_organiser) else 'home'
        response = redirect(redirect_url)
        mark_2fa_verified_in_session(request, response, user)
        return response
    else:
        messages.error(request, "Verification link is invalid, expired, or has already been used.")
        return redirect('login')


def verify_2fa_view(request, raw_token):
    token_obj = EmailVerificationToken.verify_and_use_token(raw_token, token_type='login_2fa')
    if token_obj:
        user = token_obj.user
        auth_login(request, user)
        messages.success(request, "Logged in successfully")
        redirect_url = 'staff_dashboard' if (hasattr(user, 'userrole') and user.userrole.is_organiser) else 'home'
        response = redirect(redirect_url)
        mark_2fa_verified_in_session(request, response, user)
        return response
    else:
        messages.error(request, "2FA login link is invalid, expired, or has already been used.")
        return redirect('login')


from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        auth_login(request, user)
        messages.success(request, 'Your account has been activated & logged in successfully! Welcome to Sim2Real.')
        redirect_url = 'staff_dashboard' if (hasattr(user, 'userrole') and user.userrole.is_organiser) else 'home'
        response = redirect(redirect_url)
        mark_2fa_verified_in_session(request, response, user)
        return response
    else:
        messages.error(request, 'Activation link is invalid or has expired.')
        return redirect('login')

def resend_verification_view(request):
    email = request.GET.get('email') or request.POST.get('email')
    user_model = get_user_model()

    if not email:
        messages.error(request, "No email provided.")
        return redirect('login')

    try:
        user = user_model.objects.get(email=email)
        if user.is_active:
            messages.info(request, 'Your account is already active. You can log in.')
            return redirect('login')

        # Resend verification email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        verification_link = request.build_absolute_uri(
            reverse('activate', kwargs={'uidb64': uid, 'token': token})
        )

        send_rich_verification_email(
            user=user,
            verify_link=verification_link,
            email_title="Verify Your Sim2Real Account",
            email_heading="Account Verification Request",
            email_body_text="You requested a new verification link. Please click below to verify your email address and automatically log in.",
            action_button_text="Verify & Log In",
            subject="Resend - Verify your SIM2REAL account"
        )

        messages.success(request, 'Verification email resent. Please check your inbox.')
        return redirect('login')

    except user_model.DoesNotExist:
        messages.error(request, 'No account found with that email.')
        return render(request, 'accounts/signup.html')

def request_otp_view(request):
    if request.method == "POST":
        form = OTPRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                messages.error(request, "No user with this email exists.")
                return render(request, 'accounts/request_otp.html', {'form': form})

            # Generate OTP
            otp = f"{random.randint(100000, 999999)}"
            PasswordResetOTP.objects.create(user=user, otp=otp)

            # Send Email
            subject = "Your SIM2REAL Password Reset OTP"
            message = f"Use this OTP to reset your password. It expires in 10 minutes.\n\nOTP: {otp}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            send_mail(subject, message, from_email, recipient_list)

            messages.success(request, "OTP sent to your email.")
            from django.urls import reverse
            return redirect(f"{reverse('verify_otp')}?email={email}")

    else:
        form = OTPRequestForm()
    return render(request, 'accounts/request_otp.html', {'form': form})


def verify_otp_view(request):
    initial_email = request.GET.get('email', '')
    if request.method == "POST":
        form = OTPVerifyForm(request.POST)
        initial_email = request.GET.get('email', '')
        if form.is_valid():
            email = form.cleaned_data['email']
            otp = form.cleaned_data['otp']
            new_password = form.cleaned_data['new_password1']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                messages.error(request, "Invalid email.")
                return render(request, 'accounts/verify_otp.html', {'form': form})

            # Get latest OTP for user
            otp_records = PasswordResetOTP.objects.filter(user=user, otp=otp).order_by('-created_at')
            if not otp_records.exists():
                messages.error(request, "Invalid OTP.")
                return render(request, 'accounts/verify_otp.html', {'form': form})

            otp_record = otp_records.first()
            if otp_record.is_expired():
                messages.error(request, "OTP has expired. Please request a new one.")
                return redirect('request_otp')

            # Reset password
            user.set_password(new_password)
            user.save()

            # Delete all OTPs for this user to invalidate old ones
            PasswordResetOTP.objects.filter(user=user).delete()

            messages.success(request, "Password reset successful. You can now log in.")
            return redirect('login')

    else:
        
        form = OTPVerifyForm(initial={'email': initial_email})

    return render(request, 'accounts/verify_otp.html', {'form': form})


def logout_view(request):
    storage = messages.get_messages(request)
    for _ in storage:
        pass
    auth_logout(request)
    messages.success(request, "Logged out successfully.")
    return redirect('login')

