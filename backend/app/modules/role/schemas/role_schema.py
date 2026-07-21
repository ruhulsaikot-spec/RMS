from pydantic import BaseModel
from typing import Optional


class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: Optional[str]

    class Config:
        from_attributes = True

class AssignPermissionRequest(BaseModel):
    permission_ids: list[str]        