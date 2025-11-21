# backend/api/views.py

# --- 1. Import necessary components ---
from django.http import JsonResponse
from firebase_admin import firestore
from config.firebase_config import db as DB_CLIENT
from .auth import firebase_auth_required


def save_summary_to_db(user_id, file_title, ai_summary_text):
    """Saves a single AI summary document to the Firestore 'documents' collection."""
    
    if DB_CLIENT is None:
        # Handle case where connection is not ready
        print("ERROR: Firestore client is not initialized.")
        return False # Return failure status

    # No need to use .add() if you want a specific ID, but .add() generates one.
    DB_CLIENT.collection('documents').add({
        'user_id': user_id,          # String: to know who owns it
        'title': file_title,         # String: to show in the UI list
        'summary': ai_summary_text,  # String: the actual AI output
        'created_at': firestore.SERVER_TIMESTAMP
    }) 
    
    return True # Return success status
    
    
@firebase_auth_required 
def get_user_library(request):
    """
    Retrieves all documents for the authenticated user (UID).
    """
    
    # CRITICAL: Get the user ID from the request object set by the decorator
    user_id = request.user_id 

    if DB_CLIENT is None:
        return JsonResponse(
            {'error': 'Database connection failed.', 'documents': []}, 
            status=500
        )

    # 2. Query Firestore using the actual authenticated user_id
    # Ensure 'user_id' in Firestore is a string type (UIDs are strings)
    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream() 

    library_data = []

    # 3. Process results
    for doc in docs_stream:
        # ... (rest of the processing logic)
        doc_data = doc.to_dict()

        library_data.append({
            'id': doc.id,              
            'title': doc_data.get('title', 'No Title'), 
            'summary': doc_data.get('summary', 'No Summary'),
        })

    # 4. Return the response
    return JsonResponse({'documents': library_data})