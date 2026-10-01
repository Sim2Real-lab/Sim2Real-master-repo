import base64
from datetime import date
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import UserProfile
from .forms import UserProfileForm, NITK_COLLEGE_NAME


@login_required
def userprofile_view(request):
    user = request.user
    user_role = getattr(user, 'userrole', None)
    is_organiser = bool(user_role and user_role.is_organiser)
    profile = UserProfile.objects.filter(user=user).first()

    # NITK email check
    user_email = (user.email or "").lower()
    is_nitk = user_email.endswith("@nitk.edu.in") or user_email.endswith(".nitk.edu.in")

    # Photo Base64 stream encoding for live preview modal
    photo_base64 = None
    if profile and profile.photo:
        try:
            with profile.photo.open('rb') as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                photo_base64 = f"data:image/jpeg;base64,{encoded}"
        except Exception:
            photo_base64 = None

    # Age limit: 18 to 30 years for HTML attributes
    today = date.today()
    try:
        max_dob = today.replace(year=today.year - 18)
    except ValueError:
        max_dob = today.replace(month=2, day=28, year=today.year - 18)

    try:
        min_dob = today.replace(year=today.year - 30)
    except ValueError:
        min_dob = today.replace(month=2, day=28, year=today.year - 30)

    college_value = NITK_COLLEGE_NAME if is_nitk else (profile.college if profile else "")

    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile, is_nitk=is_nitk)
        if form.is_valid():
            is_new = profile is None
            profile_obj = form.save(commit=False)
            profile_obj.user = user
            if is_nitk:
                profile_obj.college = NITK_COLLEGE_NAME
            profile_obj.save()

            if is_new:
                messages.success(request, 'Profile saved successfully.')
                if not is_organiser:
                    return redirect('home')
                return redirect('profile')
            else:
                messages.success(request, 'Profile updated successfully.')
                if not is_organiser:
                    messages.success(request, 'Visit Team Profile to Create or Join a Team')
                return redirect('profile')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    field_label = field.replace('_', ' ').capitalize() if field != '__all__' else ''
                    if field_label:
                        messages.error(request, f"{field_label}: {error}")
                    else:
                        messages.error(request, error)
            return redirect('profile')

    return render(request, 'user_profile/profile.html', {
        'user_email': user.email,
        'profile': profile,
        'user_role': user_role,
        'is_organiser': is_organiser,
        'is_nitk': is_nitk,
        'college_value': college_value,
        'min_dob': min_dob,
        'max_dob': max_dob,
        'photo_base64': photo_base64,
    })
