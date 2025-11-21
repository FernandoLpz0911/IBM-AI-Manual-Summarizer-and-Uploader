# backend/api/views.py

# --- 1. Import necessary components ---
from django.http import JsonResponse
from firebase_admin import firestore
# Assuming you want to use the pre-initialized db client from your config
# If you kept the structure from the last step, you should be importing 'db'
# from config.firebase_config import db 
# Since you're using firestore.client() here, we'll keep it simple for now, 
# but remember the best practice is to import the initialized client.

# Create the client object here, assuming the Firebase app is initialized elsewhere
# (e.g., in firebase_config.py, which you should ensure is imported by Django)
try:
    DB_CLIENT = firestore.client()
except Exception:
    # Fallback/Error handling if global app init failed
    DB_CLIENT = None


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
    
    
def get_user_library(request):
    """Django view to retrieve all documents for a user and return them as JSON."""
    
    # 1. Get the user ID from the query parameters (e.g., /api/library?user_id=123)
    user_id = request.GET.get('user_id', 'hackathon_demo_user')

    if DB_CLIENT is None:
        return JsonResponse(
            {'error': 'Database connection failed.', 'documents': []}, 
            status=500
        )

    # 2. Query Firestore
    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream()

    library_data = []

    # 3. Process results
    for doc in docs_stream:
        doc_data = doc.to_dict()

        library_data.append({
            'id': doc.id,              # The Firestore ID (e.g., "Ab72ks9")
            'title': doc_data.get('title', 'No Title'), # Use .get() with fallback
            'summary': doc_data.get('summary', 'No Summary'),
        })

    # 4. Return the response
    return JsonResponse({'documents': library_data})