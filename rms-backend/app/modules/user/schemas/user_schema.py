from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field


class UserBase(BaseModel):
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    employee_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    email: EmailStr

    phone: str | None = Field(
        default=None,
        max_length=20,
    )

    department_id: str = Field(
        ...,
        min_length=1,
    )

    designation_id: str = Field(
        ...,
        min_length=1,
    )

    manager_id: str | None = None

    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    department_id: str | None = None
    designation_id: str | None = None
    manager_id: str | None = None
    is_active: bool | None = None

class UserRoleResponse(BaseModel):
    id: str
    name: str
    display_name: str

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserResponse(UserBase):
    id: str

    roles: list[UserRoleResponse] = []

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserDetailResponse(UserResponse):
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )

class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    size: int

class AssignRoleRequest(BaseModel):
    role_ids: list[str]

class ResetPasswordRequest(BaseModel):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )     