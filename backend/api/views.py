# backend/api/views.py (Final Code)

from django.views.decorators.csrf import csrf_exempt
from config.firebase_config import db as DB_CLIENT
from .auth import firebase_auth_required
from django.http import JsonResponse
from firebase_admin import firestore
from django.shortcuts import render
from django.http import HttpResponse
import json


# --- Unprotected Template Views (Unnecessary in a React API, but kept for context) ---
def protected_destination_view(request):
    # This view is unprotected and serves a simple HttpResponse
    return HttpResponse("This is the protected destination page. Welcome, authenticated user!")

def home_view(request):
    # This view is unprotected and serves a template (if one exists)
    return render(request, 'api/home.html') 


# --- API Endpoints Protected by Firebase Token ---

@csrf_exempt 
@firebase_auth_required 
def submit_document(request):
    """
    Handles POST request to receive user text, run AI, and save to DB.
    Requires a valid Firebase ID token.
    """
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        # 1. Get the authenticated user ID (Set by the decorator)
        user_id = request.user_id 
        
        # 2. Parse the JSON body
        data = json.loads(request.body)
        file_title = data.get('title')
        raw_content = data.get('content') 

        if not file_title or not raw_content:
            return JsonResponse({'error': 'Missing title or content'}, status=400)

        # 3. --- AI/Summarization Logic Placeholder ---
        ai_summary_text = f"AI Summary for '{file_title}': The document contains {len(raw_content)} characters."
        
        # 4. Save the data to Firestore
        success = save_summary_to_db(user_id, file_title, ai_summary_text)

        if success:
            return JsonResponse({'status': 'success', 'message': 'Document submitted and summarized.'}, status=201)
        else:
            return JsonResponse({'error': 'Database save failed.'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        print(f"Submission Error: {e}")
        return JsonResponse({'error': 'Internal server error during processing.'}, status=500)


def save_summary_to_db(user_id, file_title, ai_summary_text):
    """Saves a single AI summary document to the Firestore 'documents' collection."""
    if DB_CLIENT is None:
        print("ERROR: Firestore client is not initialized.")
        return False
    
    DB_CLIENT.collection('documents').add({
        'user_id': user_id,
        'title': file_title,
        'summary': ai_summary_text,
        'created_at': firestore.SERVER_TIMESTAMP
    }) 
    return True
    
    
@firebase_auth_required 
def get_user_library(request):
    """
    Retrieves all documents for the authenticated user (UID).
    Requires a valid Firebase ID token.
    """
    
    # CRITICAL: Get the user ID from the request object set by the decorator
    user_id = request.user_id 

    if DB_CLIENT is None:
        return JsonResponse(
            {'error': 'Database connection failed.', 'documents': []}, 
            status=500
        )

    # 2. Query Firestore using the actual authenticated user_id
    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream() 

    library_data = []

    # 3. Process results
    for doc in docs_stream:
        doc_data = doc.to_dict()

        library_data.append({
            'id': doc.id,              
            'title': doc_data.get('title', 'No Title'), 
            'summary': doc_data.get('summary', 'No Summary'),
        })

    # 4. Return the response
    return JsonResponse({'documents': library_data})