from pydantic import BaseModel
from typing import Optional


class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True


class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool

    model_config = {
        "from_attributes": True
    }