# backend/api/auth.py (Final Code)

from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
from django.http import JsonResponse
from functools import wraps

# CRITICAL: We don't import 'db' here, as it's not used in authentication logic, 
# preventing circular imports if 'db' uses 'auth' or 'views'.
# from config.firebase_config import db 

def get_uid_from_request(request):
    """
    Attempts to extract and verify the Firebase ID Token from the Authorization header.
    Returns the User ID (UID) if successful, otherwise None.
    """
    # The frontend must send 'Authorization: Bearer <id_token>'
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, "Authorization header missing."

    try:
        # Splits 'Bearer <token>' and takes the token part
        id_token = auth_header.split(' ')[1]
    except IndexError:
        return None, "Invalid Authorization header format. Expected 'Bearer <token>'."

    try:
        # This function verifies the token's signature, expiry, and issuer
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')
        
        return uid, None # Success
        
    except FirebaseError as e:
        # Catches token expiration, invalid signatures, etc.
        return None, f"Firebase Token Error: {str(e)}"
    except Exception as e:
        # Catches unexpected errors
        return None, f"Unexpected Error: {str(e)}"
    
def firebase_auth_required(view_func):
    """Decorator to require Firebase authentication for a view."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # 1. Get UID from request
        uid, error = get_uid_from_request(request)
        
        if not uid:
            # 2. Return 401 Unauthorized if verification fails
            return JsonResponse(
                {'error': 'Unauthorized', 'detail': error}, 
                status=401
            )
        
        # 3. Attach UID to the request object and call the original view
        # The view can now access the verified user ID via request.user_id
        request.user_id = uid 
        return view_func(request, *args, **kwargs)

    return _wrapped_view