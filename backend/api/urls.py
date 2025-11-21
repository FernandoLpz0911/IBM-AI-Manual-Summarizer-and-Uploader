# backend/api/urls.py

# 1. IMPORT PATH AND VIEWS
from django.urls import path
from . import views # Import the views from the current directory (api/views.py)

urlpatterns = [
    # This path is now relative to '/api/'
    # Full URL: http://127.0.0.1:8000/api/library/
    path('library/', views.get_user_library, name='user_library'),
]