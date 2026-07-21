"""
RMS Backend - Permission Definitions & Dependency Decorators

Centralized permission constants, role definitions, and reusable
dependency decorators for enterprise authorization control.
"""

from __future__ import annotations

from functools import wraps
from typing import Any, Callable

from fastapi import Depends

from app.auth.dependencies import (
    CurrentUser,
    require_all_permissions,
    require_all_roles,
    require_any_permission,
    require_permission,
    require_roles,
)


# ══════════════════════════════════════════════════════════════
# ROLE DEFINITIONS
# ══════════════════════════════════════════════════════════════
class Roles:
    """System role name constants."""

    ADMIN = "admin"
    EMPLOYEE = "employee"
    APPROVER = "approver"
    FINANCE = "finance"

    ALL = [ADMIN, EMPLOYEE, APPROVER, FINANCE]


# ══════════════════════════════════════════════════════════════
# PERMISSION DEFINITIONS
# ══════════════════════════════════════════════════════════════
class Permissions:
    """
    Permission code constants following resource:action convention.

    Each permission is composed of a resource name and an action,
    separated by a colon. This provides a consistent and extensible
    naming convention for fine-grained access control.
    """

    # ── User Management ────────────────────────────────────────
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_LIST = "user:list"
    USER_MANAGE_ROLES = "user:manage_roles"

    # ── Department Management ──────────────────────────────────
    DEPARTMENT_CREATE = "department:create"
    DEPARTMENT_READ = "department:read"
    DEPARTMENT_UPDATE = "department:update"
    DEPARTMENT_DELETE = "department:delete"

    # ── Employee Management ────────────────────────────────────
    EMPLOYEE_CREATE = "employee:create"
    EMPLOYEE_READ = "employee:read"
    EMPLOYEE_UPDATE = "employee:update"
    EMPLOYEE_DELETE = "employee:delete"

    # ── Reimbursement Management ───────────────────────────────
    REIMBURSEMENT_CREATE = "reimbursement:create"
    REIMBURSEMENT_READ = "reimbursement:read"
    REIMBURSEMENT_UPDATE = "reimbursement:update"
    REIMBURSEMENT_DELETE = "reimbursement:delete"
    REIMBURSEMENT_SUBMIT = "reimbursement:submit"
    REIMBURSEMENT_CANCEL = "reimbursement:cancel"
    REIMBURSEMENT_VIEW_ALL = "reimbursement:view_all"

    # ── Approval Management ────────────────────────────────────
    APPROVAL_READ = "approval:read"
    APPROVAL_APPROVE = "approval:approve"
    APPROVAL_REJECT = "approval:reject"
    APPROVAL_DELEGATE = "approval:delegate"

    # ── Workflow Management ────────────────────────────────────
    WORKFLOW_CREATE = "workflow:create"
    WORKFLOW_READ = "workflow:read"
    WORKFLOW_UPDATE = "workflow:update"
    WORKFLOW_DELETE = "workflow:delete"

    # ── Payment Management ─────────────────────────────────────
    PAYMENT_CREATE = "payment:create"
    PAYMENT_READ = "payment:read"
    PAYMENT_UPDATE = "payment:update"
    PAYMENT_PROCESS = "payment:process"
    PAYMENT_APPROVE = "payment:approve"
    PAYMENT_REJECT = "payment:reject"

    # ── Report Management ──────────────────────────────────────
    REPORT_READ = "report:read"
    REPORT_EXPORT = "report:export"
    REPORT_ADMIN = "report:admin"

    # ── Notification Management ────────────────────────────────
    NOTIFICATION_READ = "notification:read"
    NOTIFICATION_UPDATE = "notification:update"
    NOTIFICATION_SEND = "notification:send"

    # ── Audit Log Management ───────────────────────────────────
    AUDIT_READ = "audit:read"
    AUDIT_EXPORT = "audit:export"

    # ── System Administration ──────────────────────────────────
    SYSTEM_CONFIG = "system:config"
    SYSTEM_MAINTAIN = "system:maintain"


# ══════════════════════════════════════════════════════════════
# ROLE-PERMISSION MAPPING (Seed Data Reference)
# ══════════════════════════════════════════════════════════════
ROLE_PERMISSIONS: dict[str, list[str]] = {
    Roles.ADMIN: [
        # Full system access
        Permissions.USER_CREATE,
        Permissions.USER_READ,
        Permissions.USER_UPDATE,
        Permissions.USER_DELETE,
        Permissions.USER_LIST,
        Permissions.USER_MANAGE_ROLES,
        Permissions.DEPARTMENT_CREATE,
        Permissions.DEPARTMENT_READ,
        Permissions.DEPARTMENT_UPDATE,
        Permissions.DEPARTMENT_DELETE,
        Permissions.EMPLOYEE_CREATE,
        Permissions.EMPLOYEE_READ,
        Permissions.EMPLOYEE_UPDATE,
        Permissions.EMPLOYEE_DELETE,
        Permissions.REIMBURSEMENT_CREATE,
        Permissions.REIMBURSEMENT_READ,
        Permissions.REIMBURSEMENT_UPDATE,
        Permissions.REIMBURSEMENT_DELETE,
        Permissions.REIMBURSEMENT_SUBMIT,
        Permissions.REIMBURSEMENT_CANCEL,
        Permissions.REIMBURSEMENT_VIEW_ALL,
        Permissions.APPROVAL_READ,
        Permissions.APPROVAL_APPROVE,
        Permissions.APPROVAL_REJECT,
        Permissions.APPROVAL_DELEGATE,
        Permissions.WORKFLOW_CREATE,
        Permissions.WORKFLOW_READ,
        Permissions.WORKFLOW_UPDATE,
        Permissions.WORKFLOW_DELETE,
        Permissions.PAYMENT_CREATE,
        Permissions.PAYMENT_READ,
        Permissions.PAYMENT_UPDATE,
        Permissions.PAYMENT_PROCESS,
        Permissions.PAYMENT_APPROVE,
        Permissions.PAYMENT_REJECT,
        Permissions.REPORT_READ,
        Permissions.REPORT_EXPORT,
        Permissions.REPORT_ADMIN,
        Permissions.NOTIFICATION_READ,
        Permissions.NOTIFICATION_UPDATE,
        Permissions.NOTIFICATION_SEND,
        Permissions.AUDIT_READ,
        Permissions.AUDIT_EXPORT,
        Permissions.SYSTEM_CONFIG,
        Permissions.SYSTEM_MAINTAIN,
    ],
    Roles.EMPLOYEE: [
        # Self-service reimbursement access
        Permissions.USER_READ,
        Permissions.DEPARTMENT_READ,
        Permissions.EMPLOYEE_READ,
        Permissions.REIMBURSEMENT_CREATE,
        Permissions.REIMBURSEMENT_READ,
        Permissions.REIMBURSEMENT_UPDATE,
        Permissions.REIMBURSEMENT_SUBMIT,
        Permissions.REIMBURSEMENT_CANCEL,
        Permissions.NOTIFICATION_READ,
        Permissions.NOTIFICATION_UPDATE,
    ],
    Roles.APPROVER: [
        # Approval and review access
        Permissions.USER_READ,
        Permissions.DEPARTMENT_READ,
        Permissions.EMPLOYEE_READ,
        Permissions.REIMBURSEMENT_CREATE,
        Permissions.REIMBURSEMENT_READ,
        Permissions.REIMBURSEMENT_UPDATE,
        Permissions.REIMBURSEMENT_SUBMIT,
        Permissions.REIMBURSEMENT_CANCEL,
        Permissions.REIMBURSEMENT_VIEW_ALL,
        Permissions.APPROVAL_READ,
        Permissions.APPROVAL_APPROVE,
        Permissions.APPROVAL_REJECT,
        Permissions.APPROVAL_DELEGATE,
        Permissions.NOTIFICATION_READ,
        Permissions.NOTIFICATION_UPDATE,
    ],
    Roles.FINANCE: [
        # Financial processing access
        Permissions.USER_READ,
        Permissions.DEPARTMENT_READ,
        Permissions.EMPLOYEE_READ,
        Permissions.REIMBURSEMENT_READ,
        Permissions.REIMBURSEMENT_VIEW_ALL,
        Permissions.APPROVAL_READ,
        Permissions.PAYMENT_CREATE,
        Permissions.PAYMENT_READ,
        Permissions.PAYMENT_UPDATE,
        Permissions.PAYMENT_PROCESS,
        Permissions.PAYMENT_APPROVE,
        Permissions.PAYMENT_REJECT,
        Permissions.REPORT_READ,
        Permissions.REPORT_EXPORT,
        Permissions.NOTIFICATION_READ,
        Permissions.NOTIFICATION_UPDATE,
    ],
}


# ══════════════════════════════════════════════════════════════
# CONVENIENCE DEPENDENCY FACTORIES
# ══════════════════════════════════════════════════════════════

def admin_only():
    """Dependency that restricts access to admin role only."""
    return Depends(require_roles(Roles.ADMIN))


def approver_or_above():
    """Dependency that allows approver or admin roles."""
    return Depends(require_roles(Roles.APPROVER, Roles.ADMIN))


def finance_or_above():
    """Dependency that allows finance or admin roles."""
    return Depends(require_roles(Roles.FINANCE, Roles.ADMIN))


def can_create_reimbursement():
    """Dependency for reimbursement creation permission."""
    return Depends(require_permission(Permissions.REIMBURSEMENT_CREATE))


def can_approve():
    """Dependency for approval permission."""
    return Depends(require_permission(Permissions.APPROVAL_APPROVE))


def can_process_payment():
    """Dependency for payment processing permission."""
    return Depends(require_permission(Permissions.PAYMENT_PROCESS))


def can_view_all_reimbursements():
    """Dependency for viewing all reimbursements (not just own)."""
    return Depends(require_permission(Permissions.REIMBURSEMENT_VIEW_ALL))


def can_export_reports():
    """Dependency for report export permission."""
    return Depends(require_permission(Permissions.REPORT_EXPORT))


def can_manage_users():
    """Dependency for user management permission."""
    return Depends(require_permission(Permissions.USER_MANAGE_ROLES))


def can_manage_workflows():
    """Dependency for workflow management permission."""
    return Depends(require_any_permission(
        Permissions.WORKFLOW_CREATE,
        Permissions.WORKFLOW_UPDATE,
        Permissions.WORKFLOW_DELETE,
    ))


def can_admin_system():
    """Dependency for system administration permission."""
    return Depends(require_all_permissions(
        Permissions.SYSTEM_CONFIG,
        Permissions.SYSTEM_MAINTAIN,
    ))
