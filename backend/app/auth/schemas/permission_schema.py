from datetime import datetime

from pydantic import BaseModel


class PermissionCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    resource: str
    action: str


class PermissionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    resource: str | None = None
    action: str | None = None
    is_active: bool | None = None


class PermissionResponse(BaseModel):
    id: str
    code: str
    name: str
    description: str | None
    resource: str
    action: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True