from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from landing_page.views import robots_txt
from landing_page.sitemaps import LandingPageSitemap
from django.conf import settings
from django.conf.urls.static import static
from simreal.views import protected_media_view

sitemaps = {
    "landing": LandingPageSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('user/', include('home.urls')),
    path('', include('landing_page.urls')),
    path('user/team/', include('team_profile.urls')),
    path('user/query/', include('queries.urls')),
    path('staff/', include('staff_home.urls')),
    
    # Protected Media Serving Route (Enforces auth for profile_photos, payments)
    path('media/<path:path>', protected_media_view, name='protected_media'),

    # SEO
    path("robots.txt", robots_txt),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
