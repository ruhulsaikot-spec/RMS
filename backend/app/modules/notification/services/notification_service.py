from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.modules.notification.models.notification import Notification


class NotificationService:

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: str,
        title: str,
        message: str,
        type: str = "info",
        application_id: str = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            application_id=application_id,
        )
        db.add(notification)
        await db.flush()
        return notification

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
    ) -> list:
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def get_unread_count(db: AsyncSession, user_id: str) -> int:
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        return len(result.scalars().all())

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification_id: str, user_id: str):
        await db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        await db.commit()

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: str):
        await db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        await db.commit()

    @staticmethod
    async def notify_claim_event(
        db: AsyncSession,
        user_id: str,
        event: str,
        application_no: str,
        application_id: str = None,
        applicant_name: str = "",
        approver_name: str = "",
    ):
        messages = {
            "submitted": {
                "title": f"New Claim for Approval",
                "message": f"{applicant_name} has submitted a claim ({application_no}) awaiting your approval.",
                "type": "info",
            },
            "next_stage": {
                "title": f"Claim Forwarded to You",
                "message": f"Claim {application_no} by {applicant_name} has been forwarded to you for approval.",
                "type": "info",
            },
            "backed": {
                "title": f"Claim Returned to Your Stage",
                "message": f"Claim {application_no} has been sent back to your stage for re-review.",
                "type": "warning",
            },
            "approved": {
                "title": f"Claim Approved",
                "message": f"Your claim {application_no} has been approved.",
                "type": "success",
            },
            "rejected": {
                "title": f"Claim Rejected",
                "message": f"Your claim {application_no} has been rejected.",
                "type": "error",
            },
            "returned": {
                "title": f"Claim Returned",
                "message": f"Your claim {application_no} has been returned for revision.",
                "type": "warning",
            },
            "verified": {
                "title": f"Amount Verified",
                "message": f"Your claim {application_no} amount has been verified.",
                "type": "success",
            },
            "paid": {
                "title": f"Payment Processed",
                "message": f"Your claim {application_no} payment has been processed.",
                "type": "success",
            },
        }
        cfg = messages.get(event)
        if cfg:
            await NotificationService.create_notification(
                db=db,
                user_id=user_id,
                title=cfg["title"],
                message=cfg["message"],
                type=cfg["type"],
                application_id=application_id,
            )