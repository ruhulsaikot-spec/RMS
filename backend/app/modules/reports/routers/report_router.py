from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.modules.reimbursement.models.reimbursement import ReimbursementApplication
from datetime import date

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/claims")
async def get_claims_report(
    department_id: str | None = Query(None),
    designation_id: str | None = Query(None),
    expense_type_id: str | None = Query(None),
    employee_id: str | None = Query(None),
    status: str | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    query = select(ReimbursementApplication).options(
        selectinload(ReimbursementApplication.employee).selectinload(__import__('app.modules.user.models.user', fromlist=['User']).User.department),
        selectinload(ReimbursementApplication.employee).selectinload(__import__('app.modules.user.models.user', fromlist=['User']).User.designation),
        selectinload(ReimbursementApplication.expense_type),
        selectinload(ReimbursementApplication.expense_items),
    ).where(ReimbursementApplication.is_deleted == False)

    if status:
        query = query.where(ReimbursementApplication.status == status.upper())
    if date_from:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at <= datetime.combine(date_to, datetime.max.time()))

    result = await db.execute(query)
    applications = result.scalars().all()

    rows = []
    for app in applications:
        emp = app.employee
        if not emp:
            continue
        if department_id and str(emp.department_id) != department_id:
            continue
        if designation_id and str(emp.designation_id) != designation_id:
            continue
        if employee_id and str(app.employee_id) != employee_id:
            continue
        if expense_type_id:
            item_type_ids = [str(ei.claim_type) for ei in (app.expense_items or []) if ei.claim_type]
            if expense_type_id not in item_type_ids:
                continue

        dept_name = emp.department.name if hasattr(emp, 'department') and emp.department else ""
        desig_name = emp.designation.name if hasattr(emp, 'designation') and emp.designation else ""
        # Get expense types from expense items
        if app.expense_items:
            from app.modules.expense_type.models.expense_type import ExpenseType as _ET
            from sqlalchemy import select as _sel
            _et_ids = list(set(ei.claim_type for ei in app.expense_items if ei.claim_type))
            if _et_ids:
                _et_res = await db.execute(_sel(_ET).where(_ET.id.in_(_et_ids)))
                _et_names = [et.name for et in _et_res.scalars().all()]
                claim_type = ", ".join(_et_names)
            else:
                claim_type = app.expense_type.name if app.expense_type else ""
        else:
            claim_type = app.expense_type.name if app.expense_type else ""

        rows.append({
            "application_no": app.application_no,
            "submitted_at": app.submitted_at.strftime("%d %b %Y") if app.submitted_at else "-",
            "employee_name": emp.full_name,
            "department": dept_name,
            "designation": desig_name,
            "expense_type": claim_type,
            "requested_amount": float(app.requested_amount or 0),
            "paid_amount": float(app.paid_amount or 0),
            "status": app.status,
        })

    return rows

@router.get("/employees")
async def get_report_employees(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    from app.modules.user.models.user import User
    result = await db.execute(
        select(User).where(User.is_active == True).order_by(User.full_name)
    )
    users = result.scalars().all()
    return [{"id": str(u.id), "name": u.full_name} for u in users]

@router.get("/reimbursement-types")
async def get_reimbursement_types(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text
    result = await db.execute(text("SELECT id, name FROM reimbursement_types WHERE is_deleted = false ORDER BY name"))
    rows = result.fetchall()
    return [{"id": str(r[0]), "name": r[1]} for r in rows]

@router.get("/executive")
async def get_executive_report(
    department_id: str | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    from app.modules.user.models.user import User
    from app.modules.department.models.department import Department

    query = select(ReimbursementApplication).options(
        selectinload(ReimbursementApplication.employee),
        selectinload(ReimbursementApplication.expense_items),
    ).where(ReimbursementApplication.is_deleted == False)

    if date_from:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at <= datetime.combine(date_to, datetime.max.time()))

    result = await db.execute(query)
    applications = result.scalars().all()

    # Get all departments
    dept_result = await db.execute(select(Department).where(Department.is_deleted == False))
    departments = {str(d.id): d.name for d in dept_result.scalars().all()}

    # Group by department
    dept_data: dict = {}
    for app in applications:
        emp = app.employee
        if not emp:
            continue
        dept_id = str(emp.department_id) if emp.department_id else "unknown"
        if department_id and dept_id != department_id:
            continue

        if dept_id not in dept_data:
            dept_data[dept_id] = {
                "department": departments.get(dept_id, "Unknown"),

                "total_claims": 0,
                "total_requested": 0.0,
                "total_verified": 0.0,
                "total_paid": 0.0,
                "total_rejected": 0.0,
                "pending_amount": 0.0,
            }
        d = dept_data[dept_id]
        d["total_claims"] += 1
        d["total_requested"] += float(app.requested_amount or 0)
        status = app.status
        if status == "PAID":
            d["total_paid"] += float(app.paid_amount or 0)
            d["total_verified"] += float(app.verified_amount or 0)
        elif status == "VERIFIED":
            d["total_verified"] += float(app.verified_amount or 0)
        elif status == "REJECTED":
            d["total_rejected"] += float(app.requested_amount or 0)
        elif status in ["SUBMITTED", "IN_APPROVAL"]:
            d["pending_amount"] += float(app.requested_amount or 0)
    return list(dept_data.values())

@router.get("/status-summary")
async def get_status_summary_report(
    status: str | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    query = select(ReimbursementApplication).options(
        selectinload(ReimbursementApplication.employee),
    ).where(ReimbursementApplication.is_deleted == False)

    if date_from:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at <= datetime.combine(date_to, datetime.max.time()))

    result = await db.execute(query)
    applications = result.scalars().all()

    status_map = {
        "DRAFT": {"label": "Draft", "count": 0, "total_amount": 0.0},
        "SUBMITTED": {"label": "Submitted", "count": 0, "total_amount": 0.0},
        "IN_APPROVAL": {"label": "Manager Review", "count": 0, "total_amount": 0.0},
        "VERIFIED": {"label": "Finance Review", "count": 0, "total_amount": 0.0},
        "REJECTED": {"label": "Rejected", "count": 0, "total_amount": 0.0},
        "RETURNED": {"label": "Returned", "count": 0, "total_amount": 0.0},
        "PAID": {"label": "Paid", "count": 0, "total_amount": 0.0},
    }

    for app in applications:
        app_status = app.status
        if status and app_status != status.upper():
            continue
        if app_status in status_map:
            status_map[app_status]["count"] += 1
            status_map[app_status]["total_amount"] += float(app.paid_amount or app.verified_amount or app.requested_amount or 0)

    return [
        {
            "status": k,
            "label": v["label"],
            "count": v["count"],
            "total_amount": v["total_amount"],
        }
        for k, v in status_map.items()
    ]

@router.get("/monthly-trend")
async def get_monthly_trend_report(
    year: int | None = Query(None),
    month: int | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import extract
    query = select(ReimbursementApplication).where(
        ReimbursementApplication.is_deleted == False,
        ReimbursementApplication.submitted_at != None,
    )
    if year:
        query = query.where(extract('year', ReimbursementApplication.submitted_at) == year)
    if month:
        query = query.where(extract('month', ReimbursementApplication.submitted_at) == month)

    result = await db.execute(query)
    applications = result.scalars().all()

    # Group by year-month
    from collections import defaultdict
    monthly: dict = defaultdict(lambda: {
        "total_claims": 0,
        "requested_amount": 0.0,
        "rejected_amount": 0.0,
        "verified_amount": 0.0,
        "paid_amount": 0.0,
    })

    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for app in applications:
        if not app.submitted_at:
            continue
        key = f"{app.submitted_at.year}-{app.submitted_at.month:02d}"
        d = monthly[key]
        d["year"] = app.submitted_at.year
        d["month"] = app.submitted_at.month
        d["month_name"] = month_names[app.submitted_at.month]
        d["total_claims"] += 1
        d["requested_amount"] += float(app.requested_amount or 0)
        if app.status == "REJECTED":
            d["rejected_amount"] += float(app.requested_amount or 0)
        if app.status in ["VERIFIED", "PAID"]:
            d["verified_amount"] += float(app.verified_amount or 0)
        if app.status == "PAID":
            d["paid_amount"] += float(app.paid_amount or 0)

    return sorted(monthly.values(), key=lambda x: (x.get("year", 0), x.get("month", 0)))

@router.get("/department-expense")
async def get_department_expense_report(
    department_id: str | None = Query(None),
    expense_type_id: str | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    from app.modules.department.models.department import Department
    from app.modules.expense_type.models.expense_type import ExpenseType

    query = select(ReimbursementApplication).options(
        selectinload(ReimbursementApplication.employee),
        selectinload(ReimbursementApplication.expense_type),
        selectinload(ReimbursementApplication.expense_items),
    ).where(ReimbursementApplication.is_deleted == False)

    if date_from:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        from datetime import datetime
        query = query.where(ReimbursementApplication.submitted_at <= datetime.combine(date_to, datetime.max.time()))

    result = await db.execute(query)
    applications = result.scalars().all()

    # Get departments
    dept_result = await db.execute(select(Department).where(Department.is_deleted == False))
    departments = {str(d.id): d.name for d in dept_result.scalars().all()}

    # Get expense types
    et_result = await db.execute(select(ExpenseType).where(ExpenseType.is_deleted == False))
    expense_types = {str(et.id): et.name for et in et_result.scalars().all()}

    # Group by department + expense type
    from collections import defaultdict
    data: dict = defaultdict(lambda: {
        "total_claims": 0,
        "total_requested": 0.0,
        "total_verified": 0.0,
        "total_paid": 0.0,
    })

    for app in applications:
        emp = app.employee
        if not emp:
            continue
        dept_id = str(emp.department_id) if emp.department_id else "unknown"
        if department_id and dept_id != department_id:
            continue

        # Get expense type names from expense items
        et_ids = list(set(ei.claim_type for ei in (app.expense_items or []) if ei.claim_type))
        et_names = [expense_types.get(et_id, et_id) for et_id in et_ids] if et_ids else ["Unknown"]
        et_name = ", ".join(et_names) if et_names else "Unknown"

        if expense_type_id and expense_type_id not in et_ids:
            continue

        key = f"{dept_id}||{et_name}"
        d = data[key]
        d["department"] = departments.get(dept_id, "Unknown")
        d["expense_type"] = et_name
        d["total_claims"] += 1
        d["total_requested"] += float(app.requested_amount or 0)
        if app.status in ["VERIFIED", "PAID"]:
            d["total_verified"] += float(app.verified_amount or 0)
        if app.status == "PAID":
            d["total_paid"] += float(app.paid_amount or 0)

    return sorted(data.values(), key=lambda x: (x.get("department", ""), x.get("expense_type", "")))