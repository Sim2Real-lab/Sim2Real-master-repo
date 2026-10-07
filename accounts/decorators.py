from django.http import HttpResponseForbidden
from functools import wraps
from django.shortcuts import redirect

def organiser_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user_role=getattr(request.user,'userrole',None)
        if not user_role or not user_role.is_organiser:
            return HttpResponseForbidden("Access Denied: Organiser only.")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def participant_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user_role = getattr(request.user, 'userrole', None)
        if not user_role:
            return HttpResponseForbidden("Access Denied: Participants only.")
        if user_role.is_organiser:
            return redirect('staff_dashboard')
        return view_func(request, *args, **kwargs)
    return _wrapped_view


SESSION_2FA_MAX_AGE = 10*24 * 3600  # 12 hours


def _get_user_auth_fingerprint(user):
    """
    Returns a SHA-256 fingerprint of the user's password string.
    Changes whenever the password is changed or reset.
    """
    import hashlib
    pwd = user.password or ''
    return hashlib.sha256(pwd.encode('utf-8')).hexdigest()[:16]


def is_2fa_verified_for_session(request, user):
    """
    Check whether 2FA has already been verified for this user in the current browser session.
    Verifies:
      1. Django session state.
      2. Signed session cookie with max_age (12-hour limit).
      3. Password fingerprint (invalidates if password was reset/changed).
    """
    if not user or not user.pk:
        return False

    fingerprint = _get_user_auth_fingerprint(user)

    # 1. Check Django session
    if (
        request.session.get('is_2fa_verified')
        and request.session.get('twofa_verified_user_id') == user.pk
        and request.session.get('twofa_verified_pwd_hash') == fingerprint
    ):
        return True

    # 2. Check signed cookie (with max_age enforcement)
    cookie_name = f'twofa_verified_user_{user.pk}'
    try:
        cookie_val = request.get_signed_cookie(
            cookie_name,
            max_age=SESSION_2FA_MAX_AGE,
            default=None
        )
        if cookie_val:
            parts = str(cookie_val).split(':', 1)
            if len(parts) == 2:
                cookie_uid, cookie_fingerprint = parts
                if str(cookie_uid) == str(user.pk) and cookie_fingerprint == fingerprint:
                    return True
    except Exception:
        pass

    return False


def mark_2fa_verified_in_session(request, response, user):
    """
    Mark 2FA as verified for this user in both the Django session and a signed browser cookie.
    Tied to the user's password fingerprint so password resets invalidate it.
    """
    fingerprint = _get_user_auth_fingerprint(user)
    request.session['is_2fa_verified'] = True
    request.session['twofa_verified_user_id'] = user.pk
    request.session['twofa_verified_pwd_hash'] = fingerprint
    request.session.pop('twofa_sent_for_user', None)
    request.session.modified = True

    payload = f"{user.pk}:{fingerprint}"
    cookie_name = f'twofa_verified_user_{user.pk}'
    response.set_signed_cookie(
        cookie_name,
        payload,
        max_age=SESSION_2FA_MAX_AGE,
        httponly=True,
        samesite='Lax'
    )
    return response



def clear_2fa_session(response, user=None):
    """
    Remove the 2FA session cookie from the response.
    """
    response.delete_cookie('twofa_verified_user')  # Clear legacy cookie
    if user and user.pk:
        cookie_name = f'twofa_verified_user_{user.pk}'
        response.delete_cookie(cookie_name)
    return response


def twofa_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not is_2fa_verified_for_session(request, request.user):
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view
