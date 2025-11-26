import firebase_admin
from firebase_admin import credentials, firestore
import os

# --- PATH LOGIC START ---
# 1. Define the paths
render_secret_path = "/etc/secrets/serviceAccountKey.json"
local_key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'serviceAccountKey.json')

# 2. Determine which path to use
if os.path.exists(render_secret_path):
    key_path = render_secret_path
    print(f"✅ Found Render Secret Key at: {key_path}")
else:
    key_path = local_key_path
    print(f"ℹ️ Checking local path for key: {key_path}")
# --- PATH LOGIC END ---

db = None

try:
    # 3. Initialize the Firebase App
    if not firebase_admin._apps:
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase Admin initialized successfully.")
        else:
            print(f"⚠️ WARNING: serviceAccountKey.json NOT FOUND at: {key_path}")
            print("   -> Authentication and Database features will NOT work.")
            print("   -> If on Render: Did you add the Secret File as 'serviceAccountKey.json' (no folder)?")
            print("   -> If Local: Is the file in the config/ folder?")

    # 4. Create the Firestore Client
    if firebase_admin._apps:
        db = firestore.client()

except Exception as e:
    print(f"❌ Firebase Initialization Critical Error: {e}")