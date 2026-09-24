from django.shortcuts import render,redirect,get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.http import HttpResponseForbidden,FileResponse, Http404
from .decorator import user_view,organiser_only,profile_updated
from user_profile.models import UserProfile
from team_profile.models import Team
from staff_home.models import Announcments,ProblemStatementConfig,Resource,Brochure,SubmissionWindow,Submission
from itertools import chain
from django.contrib import messages
from operator import attrgetter
from django.utils.timezone import now


@login_required
@user_view
@profile_updated
def home_view(request):
    team = request.user.team.first()
    registered = team.is_registered() if team else False
    paid = team.is_paid if team else False

    if registered:
        queryset1 = Announcments.objects.filter(category="GENERAL")
        queryset2 = Announcments.objects.filter(category="REGISTERED")
    else:
        queryset1 = Announcments.objects.filter(category="GENERAL")
        queryset2 = Announcments.objects.filter(category="NOT_REGISTERED")

    # Combine and sort in Python
    combined = sorted(
        chain(queryset1, queryset2),
        key=attrgetter('created_at'),
        reverse=True
    )[:3]  # Limit to the latest 3
    show_welcome = not request.session.get('welcome_shown', False)
    request.session['welcome_shown'] = True  # Set flag to avoid showing again
    context = {
    'registered': registered,
    'announcements': combined,
    'show_welcome': show_welcome,
    'paid':paid,
}
    return render(request, 'home/index.html', context)


@login_required
@user_view
def schedule_view(request):
    return render(request,'home/schedule.html')

@login_required
@user_view
def registration_view(request):
    return render(request,'home/register.html')


@login_required
@user_view
def announce_view(request):
    announcments = Announcments.objects.order_by('-created_at')
    team = request.user.team.first()  # Gets the team user is a member of
    registered = team.is_registered() if team else False
    if registered:
        announcments = Announcments.objects.filter(category='REGISTERED').order_by('-created_at')|Announcments.objects.filter(category='GENERAL').order_by('-created_at')
        return render(request,'home/announcements.html',{'Announcments':announcments})
    if not registered:
        announcments = Announcments.objects.filter(category='NOT_REGISTERED').order_by('-created_at')|Announcments.objects.filter(category='GENERAL').order_by('-created_at')
        return render(request,'home/announcements.html',{'Announcments':announcments})
    return redirect('home')
@login_required
@user_view
def faq_view(request):
    return render(request,'home/faq_pre_registration.html')

from staff_home.models import ProblemStatementConfig, Resource, Brochure, SubmissionWindow, Submission, Track

@login_required
@user_view
def problem_statement_view(request):
    team = request.user.team.first()
    registered = team.is_registered() if team else False

    if not registered:
        return render(request, "home/problem_statement.html", {
            "visible": False,
            "message": "Your team registration is pending verification or payment."
        })

    all_tracks = Track.objects.all()

    # Handle track selection by team
    if request.method == "POST" and "select_track_id" in request.POST and team:
        track_id = request.POST.get("select_track_id")
        selected_track_obj = Track.objects.filter(id=track_id).first()
        if selected_track_obj:
            team.track = selected_track_obj
            team.save()
            messages.success(request, f"Selected track '{selected_track_obj.name}'.")
            return redirect("problem_statement")

    track = team.track if (team and team.track) else None

    # Auto-assign first track if team has no track set
    if not track and all_tracks.exists():
        track = all_tracks.first()
        if team:
            team.track = track
            team.save()

    if not track or not track.enabled:
        return render(request, "home/problem_statement.html", {
            "visible": False,
            "team": team,
            "track": track,
            "all_tracks": all_tracks,
            "message": f"Problem Statement for '{track.name}' is currently disabled." if track else "No Problem Statement available."
        })

    sections = track.sections.all().order_by("order")
    materials = track.resources.all()

    return render(request, "home/problem_statement.html", {
        "visible": True,
        "team": team,
        "track": track,
        "all_tracks": all_tracks,
        "file": track.file,
        "qualifying_status": track.qualifying_status,
        "sections": sections,
        "materials": materials,
    })

@login_required
@user_view
def resources_view(request):
    resources = Resource.objects.all()
    return render(request, "home/resources.html", {"resources": resources})





@login_required
@user_view
def download_brochure(request):
    brochure = Brochure.objects.first()
    if not brochure or not brochure.file:
        # Show a side toast message instead of 404
        messages.error(request, "Brochure download failed. File not available.")
        return redirect("problem_statement")  # Redirect to a participant page

    # Return the file as a download
    response = FileResponse(
        brochure.file.open('rb'),
        as_attachment=True,
        filename=brochure.file.name
    )
    return response
@login_required
def user_submission_windows(request):
    team = request.user.team.first()
    windows = SubmissionWindow.objects.filter(is_visible=True, end_date__gte=now())
    submissions = {}
    if team:
        team_subs = Submission.objects.filter(team=team)
        submissions = {s.window.id: s for s in team_subs}
    return render(request, "home/user_windows.html", {
        "windows": windows,
        "submissions": submissions,
        "team": team
    })

@login_required
def submit_to_window(request, window_id):
    window = get_object_or_404(SubmissionWindow, id=window_id, is_visible=True)
    team = request.user.team.first()
    if not team:
        messages.error(request, "You are not in any team.")
        return redirect("user_submissions")


    if request.method == "POST":
        link = request.POST.get("link")
        sub, created = Submission.objects.update_or_create(
            window=window, team=team,
            defaults={"link": link}
        )
        messages.success(request, "Submission saved successfully!")
        return redirect("user_submission_windows")

    return render(request, "home/submit_form.html", {"window": window})
