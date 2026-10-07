def sidebar_context(request):
    user = getattr(request, 'user', None)
    context = {'registered': False, 'user_in_team': False, 'user_team': None}
    
    if user and user.is_authenticated:
        team = user.team.first()
        if team:
            context['user_in_team'] = True
            context['user_team'] = team
            if team.is_registered():
                context['registered'] = True
                
    return context