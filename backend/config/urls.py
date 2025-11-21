from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Delegate all 'api/' requests to your app's urls.py
    path('api/', include('api.urls')), 
]