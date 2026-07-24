"""
Firebase Push Notification Service
"""
import firebase_admin
from firebase_admin import credentials, messaging
from app.core.logging import get_logger

logger = get_logger(__name__)

# Initialize Firebase
try:
    cred = credentials.Certificate("/app/firebase-service-account.json")
    firebase_admin.initialize_app(cred)
    logger.info("firebase_initialized")
except Exception as e:
    logger.warning("firebase_init_failed", error=str(e))


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: dict = None,
) -> bool:
    """Send push notification to a device token."""
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        logger.info("push_notification_sent", response=response)
        return True
    except Exception as e:
        logger.warning("push_notification_failed", error=str(e))
        return False


async def send_push_notification_multicast(
    tokens: list[str],
    title: str,
    body: str,
    data: dict = None,
) -> bool:
    """Send push notification to multiple device tokens."""
    if not tokens:
        return False
    try:
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=tokens,
        )
        response = messaging.send_each_for_multicast(message)
        logger.info("push_notification_multicast_sent", 
                   success_count=response.success_count,
                   failure_count=response.failure_count)
        return True
    except Exception as e:
        logger.warning("push_notification_multicast_failed", error=str(e))
        return False