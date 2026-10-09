import os
from django.shortcuts import redirect
from django.http import FileResponse, Http404, HttpResponse
from django.conf import settings

def protected_media_view(request, path):
    """
    Serves media files with strict access control:
    - PUBLIC: Brochures and general event rulebooks (e.g. brochures/).
    - PROTECTED (Requires Login): User profile photos (profile_photos/), problem statements (problem_statements/), payment proofs (payments/).
    """
    # Security check: Prevent directory traversal attempts
    cleaned_path = os.path.normpath(path)
    if cleaned_path.startswith("..") or cleaned_path.startswith("/") or "\\" in path:
        raise Http404("Invalid file path")

    # Folders that strictly REQUIRE authentication
    protected_folders = ("profile_photos", "payments", "payment_qr", "problem_statements")
    path_first_component = cleaned_path.split(os.sep)[0] if os.sep in cleaned_path else cleaned_path

    if path_first_component in protected_folders:
        if not request.user.is_authenticated:
            return redirect(f"/accounts/login/?next=/media/{path}")

    file_path = os.path.join(settings.MEDIA_ROOT, cleaned_path)
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404("File not found")

    # Serve using Nginx X-Accel-Redirect in production if available, else FileResponse
    if not settings.DEBUG and request.META.get("HTTP_X_ACCEL") == "true":
        response = HttpResponse()
        response["X-Accel-Redirect"] = f"/protected_media_internal/{cleaned_path}"
        return response

    return FileResponse(open(file_path, "rb"))
