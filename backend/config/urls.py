# api/urls.py (App Level)

from django.urls import path
from django.contrib import admin
from django.urls import path, include
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'),
    path('protected-destination/', views.protected_destination_view, name='protected_destination'),
]