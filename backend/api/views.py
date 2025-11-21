# backend/api/views.py (Final Code)

from firebase_admin import firestore
from django.shortcuts import render
import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from config.firebase_config import db as DB_CLIENT
from .auth import firebase_auth_required
from .watsonx import ask_watsonx
from pypdf import PdfReader


# --- Unprotected Template Views (Unnecessary in a React API, but kept for context) ---
def protected_destination_view(request):
    # This view is unprotected and serves a simple HttpResponse
    return HttpResponse("This is the protected destination page. Welcome, authenticated user!")

def home_view(request):
    # This view is unprotected and serves a template (if one exists)
    return render(request, 'api/home.html') 

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

def save_summary_to_db(user_id, file_title, ai_summary_text, full_text):
    """Saves a single AI summary document to the Firestore 'documents' collection."""
    if DB_CLIENT is None:
        print("ERROR: Firestore client is not initialized.")
        return False
    
    DB_CLIENT.collection('documents').add({
        'user_id': user_id,
        'title': file_title,
        'summary': ai_summary_text,
        'text': full_text,
        'created_at': firestore.SERVER_TIMESTAMP
    }) 
    return True
    
@firebase_auth_required 
def get_user_library(request):
    """
    FETCH METADATA ONLY.
    Loads the list of documents (Title, Summary) but NOT the full text.
    This keeps the library page fast even with huge manuals.
    """
    user_id = request.user_id 

    if DB_CLIENT is None:
        return JsonResponse({'error': 'DB not connected'}, status=500)

    # Get all documents for this user
    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream() 

    library_data = []
    for doc in docs_stream:
        doc_data = doc.to_dict()
        
        library_data.append({
            'id': doc.id,              
            'title': doc_data.get('title', 'Untitled'), 
            'summary': doc_data.get('summary', 'No Summary'),
            'uploadDate': doc_data.get('created_at', ''), # You might need to format this date
            'page_count': doc_data.get('page_count', 0),
            # We return an empty content array here to keep the frontend happy.
            # We will fetch the real content only when they click the doc.
            'content': [] 
        })

    return JsonResponse({'documents': library_data})


@csrf_exempt
@firebase_auth_required
def get_document_content(request):
    """
    FETCH FULL CONTENT.
    Called when a user clicks a specific document.
    Reconstructs the full text from the 'pages' sub-collection.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        doc_id = data.get('doc_id')
        
        if not doc_id:
            return JsonResponse({'error': 'Missing doc_id'}, status=400)
            
        # 1. Get the 'pages' sub-collection, ordered by page number
        pages_ref = DB_CLIENT.collection('documents').document(doc_id).collection('pages')
        
        # Note: 'order_by' ensures pages are in the correct order (1, 2, 3...)
        pages_stream = pages_ref.order_by('page_number').stream()
        
        full_content = []
        for page in pages_stream:
            page_data = page.to_dict()
            full_content.append(page_data.get('text', ''))
            
        return JsonResponse({'content': full_content})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@firebase_auth_required
def upload_document(request):
    """
    Handles Large PDF Uploads by chunking.
    Saves metadata to 'documents' collection.
    Saves actual text pages to a 'pages' sub-collection.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        uploaded_file = request.FILES['file']
        user_id = request.user_id 

        # 1. Read the PDF
        reader = PdfReader(uploaded_file)
        
        # 2. Prepare Firestore Batch (For efficiency)
        # We create a reference for the new parent document
        doc_ref = DB_CLIENT.collection('documents').document()
        
        batch = DB_CLIENT.batch()
        all_pages_text = []
        
        # 3. Iterate through pages and create "Page Chunks"
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            all_pages_text.append(text)
            
            # Reference to a new document inside the 'pages' sub-collection
            # path: documents/{doc_id}/pages/{page_number}
            page_ref = doc_ref.collection('pages').document(str(i))
            
            batch.set(page_ref, {
                'page_number': i,
                'text': text
            })
            
            # Firestore batches allow max 500 operations. 
            # Commit and restart batch if the PDF is huge.
            if (i + 1) % 450 == 0:
                batch.commit()
                batch = DB_CLIENT.batch()
        
        # Commit remaining pages
        batch.commit()

        # 4. Save the Parent Metadata (Lightweight)
        # We DO NOT save the full text here to avoid the 1MB limit.
        doc_ref.set({
            'user_id': user_id,
            'title': uploaded_file.name,
            'summary': all_pages_text[0][:300].replace('\n', ' ') + "...", # Preview from page 1
            'page_count': len(reader.pages),
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # 5. Return data to Frontend
        # We send the text back NOW so the user can see it immediately 
        # without needing to re-fetch it from the DB.
        return JsonResponse({
            'message': 'Upload successful', 
            'id': doc_ref.id, 
            'title': uploaded_file.name,
            # We return the array of strings so your App.tsx can display it
            'content': all_pages_text 
        })

    except Exception as e:
        print(f"Upload Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def chat_with_document(request):
    """POST: Chat with AI"""
    # No Auth required for demo speed
    if request.method != 'POST': return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        question = data.get('question')
        context = data.get('full_document_text')

        # Call WatsonX
        ai_response = ask_watsonx(context, question)
        
        return JsonResponse(ai_response)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)