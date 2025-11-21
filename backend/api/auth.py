from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
from django.http import JsonResponse
from functools import wraps
from config.firebase_config import db

def get_uid_from_request(request):
    """
    Attempts to extract and verify the Firebase ID Token.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, "Authorization header missing."

    try:
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')
        return uid, None 
    except IndexError:
        return None, "Invalid Authorization header format."
    except Exception as e:
        return None, f"Error: {str(e)}"
    
def firebase_auth_required(view_func):
    """Decorator that allows a Dev Bypass if auth fails."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        uid, error = get_uid_from_request(request)
        
        if not uid:
            # --- DEV MODE BYPASS ---
            # If no valid token is found, we assign a "dev" user ID 
            # so the app works without full Firebase setup on the frontend.
            print(f"Auth failed ({error}). Using Dev Bypass: 'user-1'")
            uid = 'user-1' 
            # -----------------------
        
        request.user_id = uid 
        return view_func(request, *args, **kwargs)

    return _wrapped_view