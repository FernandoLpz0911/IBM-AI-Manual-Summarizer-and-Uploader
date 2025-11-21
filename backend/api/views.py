# backend/api/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import firestore
from config.firebase_config import db as DB_CLIENT
from .auth import firebase_auth_required
from .watsonx import ask_watsonx  # Ensure you have this file from previous steps!

# --- HELPER FUNCTION ---
def save_summary_to_db(user_id, file_title, ai_summary_text):
    if DB_CLIENT is None:
        return False
    
    DB_CLIENT.collection('documents').add({
        'user_id': user_id,
        'title': file_title,
        'summary': ai_summary_text,
        'created_at': firestore.SERVER_TIMESTAMP
    })
    return True

# --- VIEWS ---

@csrf_exempt
@firebase_auth_required
def get_user_library(request):
    """GET: Retrieve all documents for the user"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user_id = request.user_id
    
    if DB_CLIENT is None:
        return JsonResponse({'error': 'Database unavailable'}, status=500)

    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream()
    
    library_data = []
    for doc in docs_stream:
        data = doc.to_dict()
        library_data.append({
            'id': doc.id,
            'title': data.get('title', 'Untitled'),
            'summary': data.get('summary', ''),
            # We don't send full text to list view to save bandwidth
        })

    return JsonResponse({'documents': library_data})

@csrf_exempt
@firebase_auth_required
def upload_document(request):
    """POST: Accept text/file, (optional) summarize, and save to DB"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        # Parse JSON data from React
        data = json.loads(request.body)
        title = data.get('title', 'Untitled Doc')
        text = data.get('text', '')
        
        # Hackathon Shortcut: We use the first 100 chars as the "Summary" 
        # to save AI tokens/time. You can use watsonx here if you want.
        summary = text[:150] + "..."
        
        # Save to Firestore
        save_summary_to_db(request.user_id, title, summary)
        
        return JsonResponse({'message': 'Upload successful', 'summary': summary})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def chat_with_document(request):
    """POST: Send context + question to WatsonX"""
    # Note: We usually don't require auth for the chat demo to make it faster,
    # but you can add @firebase_auth_required if you want.
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        question = data.get('question')
        context = data.get('full_document_text')

        # Call your AI file
        ai_response = ask_watsonx(context, question)
        
        return JsonResponse(ai_response)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)