# backend/config/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Use a global variable for the DB client
db = None

try:
    # Check if already initialized
    if not firebase_admin._apps:
        # Look for the key file in the parent directory (backend/)
        cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'michigan-devfest-firebase-adminsdk-fbsvc-99b6994a55.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("FIREBASE INITIALIZED SUCCESSFULLY")
        else:
            print(f"WARNING: serviceAccountKey.json not found at {cred_path}")
    else:
        db = firestore.client()
except Exception as e:
    print(f"FIREBASE ERROR: {e}")