from django.urls import path
from . import views

urlpatterns = [
    # 1. Library & Content
    path('library/', views.get_user_library, name='user_library'),
    path('doc-content/', views.get_document_content, name='get_doc_content'),
    
    # 2. Uploads
    path('upload/', views.upload_document, name='upload_document'),
    
    # 3. AI Chat
    path('chat/', views.chat_with_document, name='chat_with_document'),
]