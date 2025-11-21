# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Simple view for the root path
def api_root(request):
    return JsonResponse({'status': 'online', 'message': 'DocuMind Backend is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root), # <--- ADDED: Fixes the 404 on "/"
]