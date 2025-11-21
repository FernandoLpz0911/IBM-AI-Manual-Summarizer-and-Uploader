from django.urls import path
from . import views # <-- Import views from the local directory

# Define the URL patterns for the 'api' app
urlpatterns = [
    path('library/', views.get_user_library, name='user_library'),
    path('upload/', views.upload_document, name='upload_document'),
    path('chat/', views.chat_with_document, name='chat_with_document'),
    path('doc-content/', views.get_document_content, name='get_doc_content'),
    path('', views.home_view, name='home'),
    path('doc-content/', views.get_document_content, name='get_doc_content'),
    path('protected-destination/', views.protected_destination_view, name='protected_destination'),
]