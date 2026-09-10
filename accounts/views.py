from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .tokens import account_activation_token
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.cache import never_cache
from django.utils import timezone
import secrets
from .models import PasswordResetOTP, SignupOTP
from .forms import OTPRequestForm, OTPVerifyForm, SignupOTPVerifyForm
from django.db import transaction
import random
from django.core.mail import EmailMultiAlternatives

@never_cache
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            user_obj = User.objects.get(username=email)
        except User.DoesNotExist:
            user_obj = None
        if user_obj and not user_obj.is_active:
            verify_url = reverse('verify_signup_otp') + f'?email={email}'
            login_error = f'Your account is not active. Please <a href="{verify_url}" class="resend-link">Click here</a> to verify your account with OTP.'
            return render(request, 'accounts/login.html', {
                'login_error': login_error
            })
        user = authenticate(request, username=email, password=password)
        if user is not None:
            auth_login(request, user)
            if hasattr(user, 'userrole') and user.userrole.is_organiser:
                return redirect('staff_dashboard')
            else:
                return redirect('home')
        else:
            return render(request, 'accounts/login.html', {
                'login_error': 'Invalid email or password'
            })

    return render(request, 'accounts/login.html')

def generate_and_send_otp(user):
    # 1. Generate secure 6-digit code
    otp_code = f"{secrets.randbelow(900000) + 100000}"

    # 2. Save/update OTP in database with a 5-minute validity window
    SignupOTP.objects.update_or_create(
        user=user,
        defaults={
            'otp': otp_code,
            'created_at': timezone.now()
        }
    )

    # 3. Send email (Outputs to terminal in local, sends real email in production)
    subject = "Your Sim2Real Verification Code"
    message = f"Hello,\n\nYour OTP code is: {otp_code}\n\nThis code will expire in 5 minutes."

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return otp_code

@never_cache
def signup_view(request):
    if request.method == 'POST':
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.POST.get('ajax') == 'true'
        email = request.POST.get('email', '').strip()
        password1 = request.POST.get('password1', '')
        password2 = request.POST.get('password2', '')

        if not email or not password1 or not password2:
            msg = 'Please fill in all fields'
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            return render(request, 'accounts/signup.html', {'signup_error': msg})

        if password1 != password2:
            msg = 'Passwords do not match'
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            return render(request, 'accounts/signup.html', {'signup_error': msg})

        try:
            validate_password(password1)
        except ValidationError as e:
            msg = ' '.join(e.messages) if isinstance(e.messages, list) else str(e)
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            return render(request, 'accounts/signup.html', {'signup_error': msg})

        # Delete any previous inactive users with this email
        existing_user = User.objects.filter(username=email).first()
        if existing_user:
            if existing_user.is_active:
                msg = 'Email already registered and verified'
                if is_ajax:
                    return JsonResponse({'success': False, 'message': msg}, status=400)
                return render(request, 'accounts/signup.html', {
                    'signup_error': msg
                })
            else:
                # Remove stale inactive user
                existing_user.delete()

        try:
            with transaction.atomic():
                user = User.objects.create_user(username=email, email=email, password=password1)
                user.is_active = False
                user.save()

                generate_and_send_otp(user)

        except Exception as e:
            msg = "Error sending OTP email: Please check your email or contact organisers."
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=500)
            return render(request, 'accounts/signup.html', {'signup_error': msg})

        if is_ajax:
            return JsonResponse({'success': True, 'email': email, 'message': 'Signup successful! OTP has been sent.'})

        messages.success(request, "Signup successful! We sent a 6-digit OTP to your email. Enter it below to activate your account.")
        return redirect(f"{reverse('verify_signup_otp')}?email={email}")

    return render(request, 'accounts/signup.html')

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str  # for Django 3.1+, use force_text for older versions
from django.http import HttpResponse

def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, 'Your account has been activated successfully! You can now login.')
        return redirect('login')
    else:
        return HttpResponse('Activation link is invalid or has expired.')

@never_cache
def verify_signup_otp_view(request):
    is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.POST.get('ajax') == 'true'
    initial_email = request.GET.get('email', '') or request.POST.get('email', '')
    if request.method == "POST":
        email = request.POST.get('email', '').strip()
        otp = request.POST.get('otp', '').strip()

        if not email or not otp:
            msg = "Please provide both email and OTP."
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            messages.error(request, msg)
            return render(request, 'accounts/verify_signup_otp.html', {'form': SignupOTPVerifyForm(), 'email': email})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            msg = "Invalid email or user does not exist."
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            messages.error(request, msg)
            return render(request, 'accounts/verify_signup_otp.html', {'form': SignupOTPVerifyForm(), 'email': email})

        if user.is_active:
            msg = "Account is already active. You can log in."
            if is_ajax:
                return JsonResponse({'success': True, 'message': msg, 'redirect': reverse('login')})
            messages.info(request, msg)
            return redirect('login')

        otp_records = SignupOTP.objects.filter(user=user, otp=otp).order_by('-created_at')
        if not otp_records.exists():
            msg = "Invalid OTP. Please check and try again."
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg}, status=400)
            messages.error(request, msg)
            return render(request, 'accounts/verify_signup_otp.html', {'form': SignupOTPVerifyForm(), 'email': email})

        otp_record = otp_records.first()
        if otp_record.is_expired():
            msg = "OTP has expired. Please request a new OTP."
            if is_ajax:
                return JsonResponse({'success': False, 'message': msg, 'expired': True}, status=400)
            messages.error(request, msg)
            return render(request, 'accounts/verify_signup_otp.html', {'form': SignupOTPVerifyForm(), 'email': email})

        # Activate user
        user.is_active = True
        user.save()

        # Delete used OTP
        SignupOTP.objects.filter(user=user).delete()

        msg = "Your email has been verified successfully! You can now log in."
        if is_ajax:
            return JsonResponse({'success': True, 'message': msg, 'redirect': reverse('login')})

        messages.success(request, msg)
        return redirect('login')
    else:
        form = SignupOTPVerifyForm(initial={'email': initial_email})

    return render(request, 'accounts/verify_signup_otp.html', {'form': form, 'email': initial_email})

def resend_signup_otp_view(request):
    is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.POST.get('ajax') == 'true'
    email = request.GET.get('email') or request.POST.get('email')
    if not email:
        msg = "No email provided."
        if is_ajax:
            return JsonResponse({'success': False, 'message': msg}, status=400)
        messages.error(request, msg)
        return redirect('signup')

    user_model = get_user_model()
    try:
        user = user_model.objects.get(email=email)
        if user.is_active:
            msg = "Your account is already active. You can log in."
            if is_ajax:
                return JsonResponse({'success': True, 'message': msg, 'redirect': reverse('login')})
            messages.info(request, msg)
            return redirect('login')

        generate_and_send_otp(user)
        msg = "A new OTP has been sent. Please check your email (or terminal in local environment)."
        if is_ajax:
            return JsonResponse({'success': True, 'message': msg})
        messages.success(request, msg)
        return redirect(f"{reverse('verify_signup_otp')}?email={email}")

    except user_model.DoesNotExist:
        msg = "No account found with that email."
        if is_ajax:
            return JsonResponse({'success': False, 'message': msg}, status=404)
        messages.error(request, msg)
        return redirect('signup')

def resend_verification_view(request):
    return resend_signup_otp_view(request)

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
            otp = f"{secrets.randbelow(900000) + 100000}"
            PasswordResetOTP.objects.update_or_create(
                user=user,
                defaults={
                    'otp': otp,
                    'created_at': timezone.now()
                }
            )

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