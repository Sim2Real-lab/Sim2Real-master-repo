from .models import Query
from .forms import UserQueryForm


def sidebar_queries(request):
    """
    Makes the current user's queries (for the sidebar) and a pre-filled
    'Ask a Query' form (for the sidebar's modal) available in every
    template, on every page - not just the dashboard.

    This is what lets the query sidebar show real, up-to-date data
    (or the empty state) no matter which page the user is on.
    """
    user = getattr(request, 'user', None)
    queries = Query.objects.none()
    ask_query_form = None

    if user and user.is_authenticated:
        queries = Query.objects.filter(sender=user).order_by('-created_at')
        try:
            # UserQueryForm needs a completed UserProfile to prefill
            # name/email/contact. If the profile isn't set up yet,
            # just skip the form instead of crashing every page.
            ask_query_form = UserQueryForm(user=user)
        except Exception:
            ask_query_form = None

    return {
        'queries': queries,
        'ask_query_form': ask_query_form,
    }
