from django.urls import path
from . import views # <-- Import views from the local directory

# Define the URL patterns for the 'api' app
urlpatterns = [
    # Example: Home page view defined in api/views.py
    path('', views.home_view, name='home'),
    # Example: The protected view the button links to
    path('protected-destination/', views.protected_destination_view, name='protected_destination'),
]