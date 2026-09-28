from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserRole(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE,related_name='userrole')
    is_organiser=models.BooleanField(default=False)
    is_staff_member = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username}"


import random
from django.utils import timezone
from datetime import timedelta

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)

    def __str__(self):
        return f'OTP for {self.user.email} - {self.otp}'


import secrets
import hashlib
from datetime import timedelta
from django.utils import timezone

class EmailVerificationToken(models.Model):
    TOKEN_TYPE_CHOICES = (
        ('signup', 'Signup Verification'),
        ('login_2fa', 'Login 2FA'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token_hash = models.CharField(max_length=64, unique=True)
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPE_CHOICES, default='signup')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def create_token(cls, user, token_type='signup', expiration_minutes=15):
        # Invalidate any existing unused tokens of same type for this user
        cls.objects.filter(user=user, token_type=token_type, is_used=False).update(is_used=True)
        
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=expiration_minutes)
        token_obj = cls.objects.create(
            user=user,
            token_hash=token_hash,
            token_type=token_type,
            expires_at=expires_at
        )
        return token_obj, raw_token

    def is_valid(self):
        return (not self.is_used) and (timezone.now() <= self.expires_at)

    @classmethod
    def verify_and_use_token(cls, raw_token, token_type=None):
        if not raw_token:
            return None
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        try:
            token_obj = cls.objects.get(token_hash=token_hash)
        except cls.DoesNotExist:
            return None

        if token_type and token_obj.token_type != token_type:
            return None

        if token_obj.is_valid():
            token_obj.is_used = True
            token_obj.save(update_fields=['is_used'])
            return token_obj

        return None

    def __str__(self):
        return f"{self.get_token_type_display()} token for {self.user.username}"

