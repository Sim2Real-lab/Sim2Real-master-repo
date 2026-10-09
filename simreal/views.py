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
    if "/" in cleaned_path:
        path_first_component = cleaned_path.split("/")[0]

    if path_first_component in protected_folders:
        if not request.user.is_authenticated:
            return redirect(f"/accounts/login/?next=/media/{path}")

    file_path = os.path.join(settings.MEDIA_ROOT, cleaned_path)
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404("File not found")

    # Ensure public files are readable by web server / app process
    try:
        os.chmod(file_path, 0o644)
    except Exception:
        pass

    return FileResponse(open(file_path, "rb"))
