# landing_page/views.py

from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from .models import Sponsor, Query, GeneralQuery
from staff_home.models import Brochure
from django.http import HttpResponseForbidden, FileResponse, Http404, HttpResponse, JsonResponse
import os
from django.http import FileResponse, Http404
from django.conf import settings
import requests

def main_landing_page_view(request):
    """
    Renders the new main landing page (index.html).
    """
    is_registered = False
    profile_completed = False
    
    if request.user.is_authenticated:
        try:
            from user_profile.models import UserProfile
            profile = UserProfile.objects.get(user=request.user)
            if profile.is_complete():
                profile_completed = True
        except:
            pass
        
        team = request.user.team.first()
        if team and team.is_registered():
            is_registered = True

    return render(request, 'landing_page/index.html', {
        'is_registered': is_registered,
        'profile_completed': profile_completed
    })

def landing_page_sponsor_view(request):
    """
    Renders the dedicated sponsor page (sponsor.html), fetching sponsors.
    """
    sponsors = Sponsor.objects.all().order_by('tier')
    
    # Organize sponsors by tier for easier rendering in the template
    sponsors_by_tier = {
        'Gold': [],
        'Platinum': [],
        'Silver': [],
        'Bronze': []
    }
    for sponsor in sponsors:
        sponsors_by_tier[sponsor.tier].append(sponsor)

    past_sponsors = Sponsor.objects.all() # Or filter by a field like `is_past_sponsor=True`

    context = {
        'sponsors_by_tier': sponsors_by_tier,
        'past_sponsors': past_sponsors,
    }
    return render(request, 'landing_page/sponsor.html', context)

def general_query_submit_view(request):
    """
    Handles submissions from the general query form on the main landing page.
    Uses the GeneralQuery model and verifies Google reCAPTCHA.
    """
    if request.method == 'POST':
        # Must be signed in to submit a query
        if not request.user.is_authenticated:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'requires_login': True, 'message': 'Please sign in to submit a query.'})
            return redirect(f"/accounts/login/?next={reverse('landing_page:main_landing_page')}#queries")

        name = request.POST.get('name')
        contact_email = request.POST.get('contact_email')
        institution_name = request.POST.get('institution_name')
        message_text = request.POST.get('message')
        recaptcha_response = request.POST.get('g-recaptcha-response')

        # Check required fields
        if not all([name, contact_email, message_text]):
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'message': "Please fill in all required fields (Name, Email, Message)."})
            messages.error(request, "Please fill in all required fields (Name, Email, Message).")
            return redirect(reverse('landing_page:main_landing_page') + '#queries')

        # Verify reCAPTCHA
        recaptcha_secret = settings.RECAPTCHA_SECRET_KEY
        recaptcha_verify_url = 'https://www.google.com/recaptcha/api/siteverify'
        data = {
            'secret': recaptcha_secret,
            'response': recaptcha_response
        }
        r = requests.post(recaptcha_verify_url, data=data)
        result = r.json()

        if not result.get('success'):
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'message': "Invalid reCAPTCHA. Please try again."})
            messages.error(request, "Invalid reCAPTCHA. Please try again.")
            return redirect(reverse('landing_page:main_landing_page') + '#queries')

        # If CAPTCHA passed, save the query
        try:
            general_query = GeneralQuery.objects.create(
                name=name,
                contact_email=contact_email,
                institution_name=institution_name,
                message=message_text
            )

            # Notify organizer using the existing email utility
            from staff_home.email_utils import send_query_received_email
            import types
            query_proxy = types.SimpleNamespace(
                query_type='general',
                ticket=general_query.pk,
                contact=institution_name or '',
                email=contact_email,
                message=message_text,
                name=name,
            )
            send_query_received_email(query_proxy)

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'message': "Your query has been sent successfully! We'll get back to you soon."})
            messages.success(request, "Your query has been sent successfully! We'll get back to you soon.")
            return redirect(reverse('landing_page:main_landing_page') + '#queries')
        except Exception as e:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'message': f"An error occurred: {e}. Please try again later."})
            messages.error(request, f"An error occurred: {e}. Please try again later.")
            return redirect(reverse('landing_page:main_landing_page') + '#queries')

    return redirect('landing_page:main_landing_page')

def sponsor_contact_submit_view(request):
    """
    Handles submissions from the sponsor contact form on the dedicated sponsor page.
    Uses the Query model (for sponsor inquiries).
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        organisation = request.POST.get('organisation')
        contact_email = request.POST.get('contact_email')
        mobile_number = request.POST.get('mobile_number')
        message_text = request.POST.get('message')

        if not all([name, contact_email, message_text]):
            messages.error(request, "Please fill in all required fields for sponsor inquiry.")
            return redirect(reverse('landing_page:sponsor_page') + '#contact')

        try:
            Query.objects.create( # Using the 'Query' model for sponsor inquiries
                name=name,
                organisation=organisation,
                contact_email=contact_email,
                mobile_number=mobile_number,
                message=message_text
            )
            messages.success(request, "Your sponsor inquiry has been sent successfully! We'll get back to you soon.")
            return redirect(reverse('landing_page:sponsor_page') + '#contact')
        except Exception as e:
            messages.error(request, f"An error occurred with your sponsor inquiry: {e}. Please try again later.")
            return redirect(reverse('landing_page:sponsor_page') + '#contact')

    return redirect('landing_page:sponsor_page') # Redirect to sponsor page if not a POST request

def robots_txt(request):
    content = """User-agent: *
Allow: /
Sitemap: https://sim2real.nitk.ac.in/sitemap.xml
"""
    return HttpResponse(content, content_type="text/plain")



