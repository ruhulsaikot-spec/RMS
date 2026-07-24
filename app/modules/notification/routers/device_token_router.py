"""
Device Token Router - Store FCM device tokens for push notifications
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.auth.dependencies import CurrentUser
from app.core.database import get_db_session
from pydantic import BaseModel

router = APIRouter(prefix="/device-tokens", tags=["Device Tokens"])


class DeviceTokenRequest(BaseModel):
    token: str
    platform: str = "android"


@router.post("/register")
async def register_device_token(
    payload: DeviceTokenRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db_session),
):
    try:
        await db.execute(
            text("""
                INSERT INTO device_tokens (user_id, token, platform)
                VALUES (:user_id, :token, :platform)
                ON CONFLICT (user_id, token) DO UPDATE
                SET updated_at = now(), platform = :platform
            """),
            {
                "user_id": current_user["id"],
                "token": payload.token,
                "platform": payload.platform,
            }
        )
        await db.commit()
        return {"message": "Device token registered successfully"}
    except Exception as e:
        return {"message": "Failed to register device token"}


@router.delete("/unregister")
async def unregister_device_token(
    payload: DeviceTokenRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db_session),
):
    try:
        await db.execute(
            text("""
                DELETE FROM device_tokens
                WHERE user_id = :user_id AND token = :token
            """),
            {"user_id": current_user["id"], "token": payload.token}
        )
        await db.commit()
        return {"message": "Device token removed successfully"}
    except Exception as e:
        return {"message": "Failed to remove device token"}