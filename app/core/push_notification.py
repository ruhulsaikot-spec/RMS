"""
Firebase Push Notification Service
"""
import firebase_admin
from firebase_admin import credentials, messaging
import os

# Initialize Firebase
_initialized = False

def _init_firebase():
    global _initialized
    if not _initialized:
        try:
            cred_path = "/app/firebase-service-account.json"
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                _initialized = True
        except Exception as e:
            print(f"Firebase init failed: {e}")


async def send_push_notification_multicast(
    tokens: list,
    title: str,
    body: str,
    data: dict = None,
) -> bool:
    """Send push notification to multiple device tokens."""
    _init_firebase()
    if not tokens or not _initialized:
        return False
    try:
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
        )
        response = messaging.send_each_for_multicast(message)
        return True
    except Exception as e:
        print(f"Push notification failed: {e}")
        return False