from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from functools import wraps
from user_profile.models import UserProfile
from accounts.models import UserRole
from django.contrib import messages

def user_view(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            user_role = UserRole.objects.filter(user=request.user).first()
            if not user_role:
                user_role, _ = UserRole.objects.get_or_create(user=request.user)
        except Exception:
            return HttpResponseForbidden("Access Denied")
        if user_role.is_organiser:
            return redirect("staff_dashboard")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def organiser_only(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            user_role = UserRole.objects.filter(user=request.user).first()
            if not user_role:
                return redirect("home")
        except Exception:
            return redirect("home")
        if not user_role.is_organiser:
            return redirect("home") 
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def profile_updated(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            profile = UserProfile.objects.filter(user=request.user).first()
        except Exception:
            messages.warning(request, "Please update your profile to continue.")
            return redirect('profile')
        
        if not profile or not profile.is_complete():
            messages.warning(request, "Please update your profile to continue.")
            return redirect('profile')

        return view_func(request, *args, **kwargs)
    return _wrapped_view