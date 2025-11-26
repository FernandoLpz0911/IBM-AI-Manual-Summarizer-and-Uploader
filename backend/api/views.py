import json
import re
from pypdf import PdfReader
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import firestore

# Custom Imports
from config.firebase_config import db as DB_CLIENT
from .auth import firebase_auth_required
from .watsonx import ask_watsonx

# --- HELPER FUNCTIONS ---

def clean_text(text):
    """
    Fixes common PDF extraction artifacts (e.g., 'W arr anty' -> 'Warranty').
    """
    if not text: return ""
    
    # 1. Replace multiple spaces/tabs/newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # 2. Aggressive Fix: Merge single letters separated by spaces 
    # Example: "N o t i c e" -> "Notice"
    # Regex explanation: Look behind for (WordBoundary+Letter), match Space, Look ahead for (Letter+WordBoundary)
    text = re.sub(r'(?<=\b[a-zA-Z]) (?=[a-zA-Z]\b)', '', text)
    
    return text.strip()

# --- VIEW FUNCTIONS ---

@csrf_exempt
@firebase_auth_required
def upload_document(request):
    """
    Handles PDF Uploads.
    1. Parses PDF.
    2. Cleans text.
    3. Saves pages to 'pages' sub-collection (Chunking).
    4. Saves metadata to 'documents' collection.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        uploaded_file = request.FILES['file']
        user_id = request.user_id # From @firebase_auth_required decorator

        # 1. Read PDF
        reader = PdfReader(uploaded_file)
        
        # 2. Prepare Firestore Batch
        doc_ref = DB_CLIENT.collection('documents').document()
        batch = DB_CLIENT.batch()
        all_pages_text = []
        
        # 3. Iterate Pages
        for i, page in enumerate(reader.pages):
            raw_text = page.extract_text() or ""
            cleaned_text = clean_text(raw_text)
            all_pages_text.append(cleaned_text)
            
            # Create sub-collection document: documents/{doc_id}/pages/{page_num}
            page_ref = doc_ref.collection('pages').document(str(i))
            
            batch.set(page_ref, {
                'page_number': i,
                'text': cleaned_text
            })
            
            # Commit batch every 450 operations (Firestore limit is 500)
            if (i + 1) % 450 == 0:
                batch.commit()
                batch = DB_CLIENT.batch()
        
        # Commit remaining pages
        batch.commit()

        # 4. Save Metadata (Parent Document)
        doc_ref.set({
            'user_id': user_id,
            'title': uploaded_file.name,
            'summary': all_pages_text[0][:300] + "..." if all_pages_text else "No content found.",
            'page_count': len(reader.pages),
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        return JsonResponse({
            'message': 'Upload successful', 
            'id': doc_ref.id, 
            'title': uploaded_file.name,
            'content': all_pages_text # Return text so frontend works immediately
        })

    except Exception as e:
        print(f"Upload Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@firebase_auth_required 
def get_user_library(request):
    """
    Returns the list of documents (Metadata only) for the library view.
    Does NOT return full content to keep load times fast.
    """
    user_id = request.user_id 

    if DB_CLIENT is None:
        return JsonResponse({'error': 'DB not connected'}, status=500)

    docs_stream = DB_CLIENT.collection('documents').where('user_id', '==', user_id).stream() 

    library_data = []
    for doc in docs_stream:
        doc_data = doc.to_dict()
        library_data.append({
            'id': doc.id,              
            'title': doc_data.get('title', 'Untitled'), 
            'summary': doc_data.get('summary', 'No Summary'),
            # Convert Firestore timestamp to string if needed, or let frontend handle it
            'uploadDate': str(doc_data.get('created_at', '')), 
            'page_count': doc_data.get('page_count', 0),
            'content': [] # Empty content for lazy loading
        })

    return JsonResponse({'documents': library_data})


@csrf_exempt
@firebase_auth_required
def get_document_content(request):
    """
    Called when a user clicks a specific document.
    Fetches the full text from the 'pages' sub-collection.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        doc_id = data.get('doc_id')
        
        if not doc_id:
            return JsonResponse({'error': 'Missing doc_id'}, status=400)
            
        # Fetch pages ordered by page_number
        pages_ref = DB_CLIENT.collection('documents').document(doc_id).collection('pages')
        pages_stream = pages_ref.order_by('page_number').stream()
        
        full_content = []
        for page in pages_stream:
            page_data = page.to_dict()
            full_content.append(page_data.get('text', ''))
            
        return JsonResponse({'content': full_content})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def chat_with_document(request):
    """
    RAG CHAT:
    1. Receive Question + Doc ID.
    2. Fetch all pages.
    3. Score pages based on keyword matches.
    4. Send top 3 pages to Watsonx.
    """
    if request.method != 'POST': 
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        question = data.get('question', '')
        doc_id = data.get('doc_id')

        if not question or not doc_id:
            return JsonResponse({'error': 'Missing question or doc_id'}, status=400)

        # 1. Fetch Pages
        pages_ref = DB_CLIENT.collection('documents').document(doc_id).collection('pages')
        pages_stream = pages_ref.stream()

        # 2. RAG Keyword Scoring
        query_words = set(question.lower().split())
        scored_pages = []

        for page in pages_stream:
            page_data = page.to_dict()
            text = page_data.get('text', '').lower()
            page_num = page_data.get('page_number', 0)
            
            score = 0
            for word in query_words:
                score += text.count(word)
            
            if score > 0:
                scored_pages.append({
                    'text': page_data.get('text', ''), 
                    'score': score, 
                    'index': page_num
                })

        # 3. Sort & Pick Top 3
        top_pages = sorted(scored_pages, key=lambda x: x['score'], reverse=True)[:3]
        
        # Fallback: If no keywords match, use the first page (Introduction) 
        # so the AI has *something* to work with.
        if not top_pages:
            print("RAG: No keywords found. Using page 0 context.")
            first_page = pages_ref.document('0').get()
            if first_page.exists:
                top_pages = [{'text': first_page.to_dict().get('text', ''), 'index': 0}]

        # 4. Construct Context
        rag_context = ""
        for p in top_pages:
            rag_context += f"--- Page {p['index']} ---\n{p['text']}\n\n"

        # 5. Send to AI
        ai_response = ask_watsonx(rag_context, question)
        
        return JsonResponse(ai_response)

    except Exception as e:
        print(f"Chat Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)