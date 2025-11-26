from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        # Trigger Firebase initialization when the Django app is ready
        try:
            from config.firebase_config import initialize_firebase
            initialize_firebase()
        except ImportError as e:
            # Handle case where config might not be accessible during some early startup phases
            print(f"Warning: Could not import firebase_config during ready(): {e}")