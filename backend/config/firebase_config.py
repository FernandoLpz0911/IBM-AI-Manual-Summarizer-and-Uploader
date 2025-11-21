# backend/config/firebase_config.py

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from django.conf import settings
import os

KEY_FILENAME = 'michigan-devfest-firebase-adminsdk-fbsvc-99b6994a55.json'

SERVICE_ACCOUNT_KEY_PATH = os.environ.get(
    'FIREBASE_KEY_PATH', 
    os.path.join(settings.BASE_DIR, '..', KEY_FILENAME)
)


def initialize_firebase():
    """Initializes the Firebase app if it hasn't been initialized already."""
    
    # Check if the Firebase app is already initialized
    if not firebase_admin._apps:
        try:
            # 1. Load Credentials
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            
            # 2. Initialize the App
            firebase_admin.initialize_app(cred)
            print("INFO: Firebase Admin SDK initialized successfully.")
            
        except Exception as e:
            print(f"ERROR: Failed to initialize Firebase Admin SDK. Check service account path and file: {e}")
            return None

    # 3. Get Firestore Client and Return It
    # Even if initialized before, we return the client object
    return firestore.client()

# Initialize Firebase and get the client object immediately
db = initialize_firebase()