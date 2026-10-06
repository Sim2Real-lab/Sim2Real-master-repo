from django.contrib.auth import admin,views
from django.urls import path, include
from .views import (
    login_view, logout_view, signup_view, activate, resend_verification_view,
    request_otp_view, verify_otp_view, verify_email_view, verify_2fa_view
)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='accounts_logout'),
    path('signup/', signup_view, name='signup'),
    path('activate/<uidb64>/<token>/', activate, name='activate'),
    path('verify-email/<str:raw_token>/', verify_email_view, name='verify_email_token'),
    path('verify-2fa/<str:raw_token>/', verify_2fa_view, name='verify_2fa_token'),
    path('resend-verification/', resend_verification_view, name='resend_verification'),
    path('request-otp/', request_otp_view, name='request_otp'),
    path('verify-otp/', verify_otp_view, name='verify_otp'),
]

