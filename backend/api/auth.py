# backend/api/auth.py (Final Code)

from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
from django.http import JsonResponse
from functools import wraps

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
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # 1. Check for Authorization Header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Missing or invalid Authorization header'}, status=401)

        token = auth_header.split(' ')[1]

        try:
            # 2. Verify the Token with Firebase Admin
            decoded_token = auth.verify_id_token(token)
            
            # 3. Attach User ID to the request object
            # This allows views.py to access 'request.user_id'
            request.user_id = decoded_token['uid']
            
            return view_func(request, *args, **kwargs)
            
        except auth.ExpiredIdTokenError:
            return JsonResponse({'error': 'Token expired'}, status=401)
        except auth.InvalidIdTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except Exception as e:
            print(f"Auth Error: {e}")
            return JsonResponse({'error': 'Authentication failed'}, status=401)

    return _wrapped_view