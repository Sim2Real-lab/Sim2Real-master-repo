from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .forms import UserQueryForm
from .models import Query
from .decorator import user_view, profile_updated


def _is_ajax(request):
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'


@login_required
@user_view
@profile_updated
def user_query_view(request):
    if request.method == 'POST':
        form = UserQueryForm(request.POST, user=request.user)

        if form.is_valid():
            query = form.save(commit=False)
            query.sender = request.user
            query.query_type = 'user'
            query.email = request.user.email

            try:
                profile = request.user.userprofile
                full_name = f"{profile.first_name} {profile.last_name}".strip()
                query.name = full_name or request.user.username
                query.contact = profile.contact
            except Exception:
                query.name = request.user.username
                query.contact = ''

            query.save()

            if _is_ajax(request):
                return JsonResponse({'success': True, 'ticket': str(query.ticket)})

            messages.success(request, "Your query has been submitted. We'll get back to you soon!")
            return redirect('query_response')

        # Invalid form: fall through and re-render with the errors attached,
        # instead of crashing (previously this referenced an undefined
        # 'query' variable when validation failed).
        if _is_ajax(request):
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    else:
        form = UserQueryForm(user=request.user)

    return render(request, 'queries/query_hub.html', {'form': form, 'show_query_page': True})


@login_required
@user_view
@profile_updated
def query_response(request):
    queries = Query.objects.filter(sender=request.user).order_by('-created_at')
    return render(request, 'queries/query_response.html', {'queries': queries})


@login_required
@user_view
@profile_updated
def fetch_response(request, ticket):
    try:
        query = Query.objects.get(ticket=ticket, email=request.user.email)
    except Query.DoesNotExist:
        return JsonResponse({'error': 'Query not found or not authorized'}, status=404)

    if not query.resolved:
        return JsonResponse({'error': 'Query not resolved yet'}, status=400)

    return JsonResponse({
        'response': query.response,
    })
