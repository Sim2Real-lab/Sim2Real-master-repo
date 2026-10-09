from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from django.utils import timezone
from .models import JoinRequest, Team
from .forms import TeamCreationForm, JoinCodeForm, PaymentProofForm
from staff_home.models import PaymentConfig, Track
from .decorator import user_view, profile_updated

@login_required
@user_view
@profile_updated
@transaction.atomic
def team_profile_views(request):
    """
    Unified Team Management View:
    - If user belongs to a team (Leader or Member): renders full team dashboard (join code, members, pending requests, track selection, registration status).
    - If user is not in a team: renders Create Team form & Join Team form in one place.
    - Handles POST actions: create team, join with code, cancel join request, accept/decline member requests, update track, accept policies.
    """
    user = request.user
    
    # 1. Determine user's current team state
    team = None
    try:
        team = user.led_team
    except Exception:
        team = user.team.first() if user.team.exists() else None

    is_leader = bool(team and team.leader == user)

    # 2. Handle POST Actions
    if request.method == 'POST':
        action = request.POST.get('action')

        # Create Team POST
        if action == 'create_team':
            if team:
                messages.error(request, "You are already in a team.")
                return redirect('teamprofile')
            form = TeamCreationForm(request.POST)
            if form.is_valid():
                new_team = form.save(commit=False)
                new_team.leader = user
                new_team.track = form.cleaned_data.get('track')
                new_team.policy_accepted_at = timezone.now()
                new_team.save()
                new_team.members.add(user)
                messages.success(request, f"Team '{new_team.name}' created successfully with Join Code '{new_team.join_code}'!")
                return redirect('teamprofile')
            else:
                for error in form.non_field_errors():
                    messages.error(request, error)
                for field in form:
                    for error in field.errors:
                        messages.error(request, f"{field.label}: {error}")

        # Join Team POST
        elif action == 'join_team':
            if team:
                messages.error(request, "You are already in a team.")
                return redirect('teamprofile')
            form = JoinCodeForm(request.POST)
            if form.is_valid():
                code = form.cleaned_data['join_code']
                try:
                    target_team = Team.objects.get(join_code=code)
                    if target_team.is_full():
                        messages.error(request, "This team is already full (max 3 members).")
                    elif JoinRequest.objects.filter(user=user, team=target_team).exists():
                        messages.info(request, "You have already sent a request to join this team.")
                    else:
                        JoinRequest.objects.create(user=user, team=target_team)
                        messages.success(request, f"Join request sent to team '{target_team.name}'.")
                except (Team.DoesNotExist, ValueError):
                    messages.error(request, "Invalid Join Code. Please double check and try again.")
                return redirect('teamprofile')

        # Cancel Join Request POST
        elif action == 'cancel_request':
            existing_req = JoinRequest.objects.filter(user=user, status='pending').first()
            if existing_req:
                existing_req.delete()
                messages.info(request, "Your join request was cancelled.")
            return redirect('teamprofile')

        # Manage Join Requests POST (for Leaders)
        elif action in ['accept_request', 'decline_request']:
            if not is_leader:
                messages.error(request, "Only team leaders can manage join requests.")
                return redirect('teamprofile')
            req_id = request.POST.get('request_id')
            join_req = get_object_or_404(JoinRequest, id=req_id, team=team)
            if action == 'accept_request':
                if team.is_full():
                    messages.error(request, "Cannot accept: Team is already full.")
                else:
                    join_req.status = 'accepted'
                    join_req.save()
                    team.members.add(join_req.user)
                    join_req.delete()
                    messages.success(request, f"{join_req.user.username} was added to the team.")
            elif action == 'decline_request':
                join_req.status = 'declined'
                join_req.save()
                join_req.delete()
                messages.info(request, f"{join_req.user.username}'s request was declined.")
            return redirect('teamprofile')

        # Update Competition Track POST (for Leaders)
        elif action == 'update_track':
            if not is_leader:
                messages.error(request, "Only team leaders can update the track.")
                return redirect('teamprofile')
            if team.is_paid:
                messages.error(request, "Team is locked after registration/payment.")
                return redirect('teamprofile')
            track_id = request.POST.get('track_id')
            if track_id:
                try:
                    selected_track = Track.objects.get(id=track_id)
                    team.track = selected_track
                    team.save()
                    messages.success(request, f"Track updated to '{selected_track.name}'.")
                except Track.DoesNotExist:
                    messages.error(request, "Selected track does not exist.")
            return redirect('teamprofile')

        # Accept Compliance Policy POST
        elif action == 'accept_policy':
            if not team:
                messages.error(request, "You are not in a team.")
                return redirect('teamprofile')
            team.policy_accepted_at = timezone.now()
            team.save()
            messages.success(request, "Compliance policy & Code of Conduct accepted.")
            return redirect('teamprofile')

    # 3. Handle GET Logic
    if not team:
        accepted_req = JoinRequest.objects.filter(user=user, status='accepted').first()
        if accepted_req:
            accepted_req.team.members.add(user)
            team = accepted_req.team
            accepted_req.delete()
            messages.success(request, f"Your request was accepted! You are now a member of '{team.name}'.")
            is_leader = bool(team and team.leader == user)

    tracks = Track.objects.exclude(name='Default Track').order_by('order', 'name')
    if not tracks.exists():
        tracks = Track.objects.all()

    existing_request = JoinRequest.objects.filter(user=user, status='pending').order_by('-id').first() if not team else None

    context = {
        'team': team,
        'is_leader': is_leader,
        'members': team.members.all() if team else [],
        'pending_requests': team.requests.filter(status='pending') if (team and is_leader) else [],
        'existing_request': existing_request,
        'create_form': TeamCreationForm(),
        'join_form': JoinCodeForm(),
        'tracks': tracks,
        'registered': team.is_registered() if team else False,
        'is_pending': (team.is_paid and not team.is_verified) if team else False,
        'team_locked': team.is_paid if team else False,
        'policy_accepted_at': team.policy_accepted_at if team else None,
    }
    return render(request, 'team_profile/team.html', context)


@login_required
@user_view
@profile_updated
def create_team(request):
    """Legacy route compatibility - redirects to main unified team profile page."""
    return redirect('teamprofile')

@login_required
@user_view
@profile_updated
def create_team_with_code(request):
    """Legacy route compatibility - redirects to main unified team profile page."""
    return redirect('teamprofile')

@login_required
@user_view
@profile_updated
def join_team_with_code(request):
    """Legacy route compatibility - redirects to main unified team profile page."""
    return redirect('teamprofile')

@login_required
@user_view
@profile_updated
def join_team(request):
    """Legacy route compatibility - redirects to main unified team profile page."""
    return redirect('teamprofile')

@login_required
@user_view
@profile_updated
def manage_requests(request):
    """Legacy route compatibility - redirects to main unified team profile page."""
    return redirect('teamprofile')


@login_required
@user_view
@profile_updated
def register_for_event(request):
    """
    Redirect all team leaders to the payment page after checking requirements:
    - Must be team leader
    - Must have at least 2 members
    - Must have accepted Code of Conduct & Policies
    """
    team = None
    try:
        team = request.user.led_team
    except Exception:
        team = None

    if not team:
        messages.error(request, "Only team leaders can register.")
        return redirect('teamprofile')

    if team.members.count() < 2:
        messages.error(request, "You need at least 2 members in your team to register.")
        return redirect('teamprofile')

    if request.method == 'POST' and request.POST.get('agree_terms'):
        team.policy_accepted_at = timezone.now()
        team.save()

    if not team.policy_accepted_at:
        messages.error(request, "You must accept the Code of Conduct, Privacy Policy, and Terms & Conditions before registering.")
        return redirect('teamprofile')

    return redirect('payment_page')


@login_required
@user_view
@profile_updated
def payment_view(request):
    """
    Payment Portal for Participant Team Leaders:
    - Upload Transaction ID & Screenshot
    - View status: Pending Approval, Approved/Verified, or Rejected with reason
    - Compliance Checkbox enforcement
    """
    team = None
    try:
        team = request.user.led_team
    except Exception:
        team = None

    if not team:
        messages.error(request, "You don't lead any team. Form or join a team first.")
        return redirect('teamprofile')

    team = request.user.led_team
    is_nitk_team = not team.is_outsider()

    if request.method == 'POST':
        # Verify compliance checkbox if not set yet
        agree_terms = request.POST.get('agree_terms') or request.POST.get('complianceCheckbox')
        if agree_terms or not team.policy_accepted_at:
            team.policy_accepted_at = timezone.now()

        form = PaymentProofForm(request.POST, request.FILES, instance=team)
        if form.is_valid():
            team = form.save(commit=False)
            team.is_paid = True
            team.is_verified = False
            team.rejection_reason = None
            if not team.policy_accepted_at:
                team.policy_accepted_at = timezone.now()

            import os
            screenshot = form.cleaned_data.get("payment_screenshot") or team.payment_screenshot

            if is_nitk_team:
                pay_ref = request.POST.get('roll_number') or request.POST.get('payment_ref') or getattr(team, 'payment_ref', '')
                if not pay_ref or not screenshot:
                    messages.error(request, "Please provide your Roll Number / Reference ID and upload ID card / screenshot.")
                    return redirect('payment_page')
                team.payment_ref = pay_ref
                ext = os.path.splitext(screenshot.name)[1].lower()
                screenshot.name = f"{team.payment_ref}{ext}"
                team.payment_screenshot = screenshot
            else:
                if not team.payment_ref or not screenshot:
                    messages.error(request, "Please provide your Transaction ID and upload the payment screenshot.")
                    return redirect('payment_page')
                ext = os.path.splitext(screenshot.name)[1].lower()
                screenshot.name = f"{team.payment_ref}{ext}"
                team.payment_screenshot = screenshot

            team.save()
            messages.success(request, "Payment proof & details submitted successfully! Waiting for organizer approval.")
            return redirect('payment_page')
        else:
            error_msgs = []
            for field, errors in form.errors.items():
                for error in errors:
                    error_msgs.append(f"{error}")
            messages.error(request, "Invalid input: " + " | ".join(error_msgs))
    else:
        form = PaymentProofForm(instance=team)

    payment_config, _ = PaymentConfig.objects.get_or_create(id=1)

    return render(request, 'team_profile/register_pay.html', {
        'team': team,
        'form': form,
        'is_nitk_team': is_nitk_team,
        'payment_config': payment_config
    })
