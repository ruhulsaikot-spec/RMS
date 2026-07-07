from pydantic import BaseModel
from pydantic import ConfigDict


class ApprovalGroupCreate(BaseModel):
    group_code: str
    group_name: str
    approval_method: str
    description: str | None = None
    is_active: bool = True


class ApprovalGroupMemberUpdateItem(BaseModel):
    id: str | None = None

    employee_id: str

    sequence: int

    is_primary: bool = False


class ApprovalGroupUpdate(BaseModel):
    group_code: str | None = None

    group_name: str | None = None

    approval_method: str | None = None

    description: str | None = None

    is_active: bool | None = None

    members: list[ApprovalGroupMemberUpdateItem] = []

class ApprovalGroupMemberSummary(BaseModel):
    id: str
    user_id: str
    is_primary: bool

    user: dict | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ApprovalGroupResponse(BaseModel):
    id: str

    group_code: str

    group_name: str

    approval_method: str

    description: str | None = None

    is_active: bool

    members: list[ApprovalGroupMemberSummary] = []

    model_config = ConfigDict(
        from_attributes=True,
    )


class ApprovalGroupMemberCreate(BaseModel):
    approval_group_id: str

    employee_id: str

    is_primary: bool = False

    backup_employee_id: str | None = None


class ApprovalGroupMemberUpdate(BaseModel):
    user_id: str | None = None

    is_primary: bool | None = None

    backup_user_id: str | None = None


class ApprovalGroupMemberResponse(BaseModel):
    id: str

    approval_group_id: str

    user_id: str

    is_primary: bool

    backup_user_id: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )