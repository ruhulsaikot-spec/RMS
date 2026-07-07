from fastapi import APIRouter
from app.modules.department.routers.department_router import (
    router as department_router,
)
from app.modules.designation.routers.designation_router import (
    router as designation_router,
)
from app.modules.location.routers.location_router import (
    router as location_router,
)
from app.modules.company.routers.company_router import (
    router as company_router,
)
from app.modules.cost_center.routers.cost_center_router import (
    router as cost_center_router,
)
from app.modules.employee.routers.employee_router import (
    router as employee_router,
)
from app.modules.project.routers.project_router import (
    router as project_router,
)
from app.modules.expense_type.routers.expense_type_router import (
    router as expense_type_router,
)
from app.modules.user.routers.user_router import (
    router as user_router,
)
from app.auth.routers.permission_router import (
    router as permission_router,
)
from app.modules.role.routers.role_router import (
    router as role_router,
)
from app.api.v1.endpoints.health import (
    router as health_router,
)
from app.modules.workflow.routers.workflow_router import (
    router as workflow_router,
)
from app.modules.workflow.routers.approval_group_router import (
    router as approval_group_router,
)
from app.modules.reimbursement.routers.reimbursement_router import (
    router as reimbursement_router,
)
from app.modules.payment_method.routers.payment_method_router import (
    router as payment_method_router,
)
from app.modules.file.routers.file_router import (
    router as file_router,
)

from app.auth.routers import auth_router


api_v1_router = APIRouter()

api_v1_router.include_router(department_router)
api_v1_router.include_router(designation_router)
api_v1_router.include_router(location_router)
api_v1_router.include_router(company_router)
api_v1_router.include_router(cost_center_router)
api_v1_router.include_router(employee_router)
api_v1_router.include_router(project_router)
api_v1_router.include_router(expense_type_router)
api_v1_router.include_router(user_router)
api_v1_router.include_router(role_router)
api_v1_router.include_router(workflow_router)
api_v1_router.include_router(
    approval_group_router
)

api_v1_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)
api_v1_router.include_router(
    permission_router,
)
api_v1_router.include_router(
    health_router,
    prefix="/v1/health",
    tags=["Health"],
)
api_v1_router.include_router(
    reimbursement_router,
)
api_v1_router.include_router(
    payment_method_router,
)
api_v1_router.include_router(
    file_router,
)

# from app.modules.uploaded_file.routers.uploaded_file_router import (
#     router as uploaded_file_router,
# )
#api_v1_router.include_router(
#    uploaded_file_router,
#)