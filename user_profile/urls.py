from django.urls import path
from .views import userprofile_view

urlpatterns = [
    path('user/', userprofile_view, name="profile"),
]