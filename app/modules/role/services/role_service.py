from fastapi import HTTPException
from fastapi import status

from app.auth.models.auth import Role

from app.modules.role.repositories.role_repository import (
    RoleRepository,
)

from app.modules.role.schemas.role_schema import (
    RoleCreate,
    RoleUpdate,
)


class RoleService:

    def __init__(self, repo: RoleRepository):
        self.repo = repo

    async def get_roles(self):
        return await self.repo.get_all()

    async def create_role(
        self,
        data: RoleCreate,
    ):
        role = Role(
            name=data.name,
            display_name=data.display_name,
            description=data.description,
        )

        return await self.repo.create(role)

    async def update_role(
        self,
        role_id: str,
        data: RoleUpdate,
    ):
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        if data.display_name is not None:
            role.display_name = data.display_name

        if data.description is not None:
            role.description = data.description

        return await self.repo.update(role)

    async def delete_role(
        self,
        role_id: str,
    ):
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        if role.is_system_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System role cannot be deleted",
            )

        # Check if role is assigned to any user
        from sqlalchemy import text as _text_role
        linked = await self.repo.db.execute(
            _text_role("SELECT COUNT(*) FROM user_roles WHERE role_id = :role_id"),
            {"role_id": role_id}
        )
        if linked.scalar() > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete role. It is assigned to existing users.",
            )

        # Check if role is used in any workflow step
        wf_linked = await self.repo.db.execute(
            _text_role("SELECT COUNT(*) FROM workflow_steps WHERE role_id = :role_id"),
            {"role_id": role_id}
        )
        if wf_linked.scalar() > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete role. It is assigned to existing workflow steps.",
            )

        await self.repo.delete(role)

        return {
            "message": "Role deleted successfully"
        }
    
    async def replace_permissions(
        self,
        role_id: str,
        permission_ids: list[str],
    ):
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise Exception("Role not found")

        return await self.repo.replace_permissions(
            role_id,
            permission_ids,
        )

    async def assign_permissions(
        self,
        role_id: str,
        permission_ids: list[str],
    ):
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise Exception("Role not found")

        result = await self.repo.assign_permissions(
            role_id,
            permission_ids,
        )

        return result