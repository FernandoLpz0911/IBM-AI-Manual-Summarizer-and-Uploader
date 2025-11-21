import firebase_admin
from firebase_admin import credentials, firestore
import os

# 1. Construct the absolute path to the Service Account Key
# We look for 'serviceAccountKey.json' in the same directory as this file (backend/config/)
current_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(current_dir, 'serviceAccountKey.json')

db = None

try:
    # 2. Initialize the Firebase App (only if it hasn't been initialized yet)
    if not firebase_admin._apps:
        if os.path.exists(key_path):
            # Load the Admin Credentials
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase Admin initialized successfully using: {key_path}")
        else:
            # Warn the user if the key is missing (helps with debugging logs)
            print(f"⚠️ WARNING: serviceAccountKey.json NOT FOUND at: {key_path}")
            print("   -> Authentication and Database features will NOT work.")
            print("   -> Please download the key from Firebase Console -> Project Settings -> Service Accounts.")

    # 3. Create the Firestore Client
    # This 'db' variable is what views.py imports as 'DB_CLIENT'
    if firebase_admin._apps:
        db = firestore.client()

except Exception as e:
    print(f"❌ Firebase Initialization Critical Error: {e}")