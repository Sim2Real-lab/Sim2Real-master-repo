import base64
from datetime import date
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import UserProfile as up

# Create your views here.
@login_required
def userprofile_view(request):
    user = request.user
    user_role = getattr(request.user, 'userrole', None)
    try:
        profile = up.objects.get(user=user)
    except up.DoesNotExist:
        profile = None

    photo_base64 = None
    if profile and profile.photo:
        try:
            with profile.photo.open('rb') as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                photo_base64 = f"data:image/jpeg;base64,{encoded}"
        except Exception:
            photo_base64 = None

    # NITK check
    is_nitk = user.email.endswith("@nitk.edu.in")

    # Age limit: 18 to 30 years
    today = date.today()
    max_dob = today.replace(year=today.year - 18)
    min_dob = today.replace(year=today.year - 30)

    if is_nitk:
        college_value = "National Institute of Technology Karnataka"
    else:
        college_value = profile.college if profile else ""
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        contact = (request.POST.get('contact') or '').strip()
        branch = request.POST.get('branch')
        college = request.POST.get('college')
        year = request.POST.get('year')
        dob = request.POST.get('dob')
        photo = request.FILES.get('photo')

        # Contact Number backend validation (Positive 10-digit integer)
        if not contact or not contact.isdigit() or int(contact) <= 0 or len(contact) != 10:
            messages.error(request, 'Please provide a valid 10-digit positive contact number.')
            return redirect('profile')

        if photo and not photo.name.lower().endswith(('.jpg', '.jpeg')):
            messages.error(request, 'Only JPG and JPEG photo uploads are allowed.')
            return redirect('profile')

        if profile:
            # Update existing profile
            profile.first_name = first_name
            profile.last_name = last_name
            profile.contact = contact
            profile.branch = branch
            profile.college = college
            profile.year = year
            if dob:
                profile.dob = dob
            if photo:
                profile.photo = photo
            profile.save()
            
            # After saving:
            messages.success(request, 'Profile updated successfully.')
            if not user_role or not user_role.is_organiser:
                messages.success(request, 'Visit Team Profile to Create or Join a Team')
            return redirect('profile')
        else:
            # Create new profile
            up.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                contact=contact,
                branch=branch,
                college=college,
                year=year,
                dob=dob,
                photo=photo
            )
            messages.success(request, 'Profile Saved Successfully')
            if not user_role or not user_role.is_organiser:
                return redirect('home')
            return redirect('profile')

    return render(request, 'user_profile/profile.html', {
    'user_email': user.email,
    'profile': profile,
    'user_role': user_role,
    'is_nitk': is_nitk,
    'college_value': college_value,
    'min_dob': min_dob,
    'max_dob': max_dob,
    'photo_base64': photo_base64,
})