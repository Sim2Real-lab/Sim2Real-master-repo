from django.contrib import admin
from .models import UserProfile

# Register your models here.
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'contact', 'branch', 'college', 'year', 'dob', 'event_year', 'user_state')
    search_fields = ('user__username', 'first_name', 'last_name', 'college')
    list_filter = ('branch', 'college', 'year', 'user_state', 'event_year')

    fieldsets = (
        (None, {'fields': ('user', 'first_name', 'last_name', 'contact', 'branch', 'college', 'year', 'dob', 'event_year', 'user_state')}),
    )
