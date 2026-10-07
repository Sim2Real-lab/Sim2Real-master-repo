def sidebar_context(request):
    user = getattr(request, 'user', None)
    context = {'registered': False, 'user_in_team': False}
    
    if user and user.is_authenticated:
        team = user.team.first()
        if team:
            context['user_in_team'] = True
            if team.is_registered():
                context['registered'] = True
                
    return context