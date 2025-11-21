# backend/config/urls.py

# 1. IMPORT PATH AND INCLUDE
from django.contrib import admin
from django.urls import path, include 


urlpatterns = [
    # 2. ADMIN ROUTE (Standard Django)
    path('admin/', admin.site.urls),
    
    # 3. API ROUTE (Directs traffic to the api application's urls.py)
    # Any URL starting with 'api/' will now be handled by the 'api' app.
    path('api/', include('api.urls')),
    
    # 4. OPTIONAL: Root Path (To fix the 404 on the base URL)
    # You might want a base page, perhaps a redirect or a simple status view.
    # For now, we'll leave it out, but this is why you saw the 404 on '/'
]