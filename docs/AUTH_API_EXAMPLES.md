# RMS Authentication & RBAC Module - API Examples & Setup Guide

## Setup Instructions

### Prerequisites
- Python 3.12+, PostgreSQL 16+, Redis 7+, Docker & Docker Compose (optional)

### Step 1: Clone and Configure
```bash
cd rms-backend
cp .env.example .env
# Edit .env with your configuration
```

### Step 2: Start Infrastructure
```bash
docker compose up -d postgres redis
```

### Step 3: Install Dependencies
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Run Database Migration
```bash
alembic upgrade head
```

### Step 5: Seed Auth Data
```bash
python -m scripts.seed_auth
```

### Step 6: Start Application
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Examples (Base URL: http://localhost:8000/api/v1/auth)

### 1. Login
```http
POST /api/v1/auth/login
Content-Type: application/json
{ "email": "admin@rms-enterprise.com", "password": "Admin@2024!" }
```

### 2. Use Access Token
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json
{ "refresh_token": "<refresh_token>" }
```

### 4. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json
{ "refresh_token": "<refresh_token>" }
```

### 5. Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <access_token>
```

### 6. Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json
{ "current_password": "...", "new_password": "...", "confirm_password": "..." }
```

### 7. Request Password Reset
```http
POST /api/v1/auth/password-reset/request
Content-Type: application/json
{ "email": "user@example.com" }
```

### 8. Confirm Password Reset
```http
POST /api/v1/auth/password-reset/confirm
Content-Type: application/json
{ "token": "...", "new_password": "...", "confirm_password": "..." }
```

### 9. List Active Sessions
```http
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
```

### 10. Revoke a Session
```http
DELETE /api/v1/auth/sessions/{session_id}
Authorization: Bearer <access_token>
```

### 11. Admin: Unlock Account
```http
POST /api/v1/auth/admin/unlock/{user_id}
Authorization: Bearer <admin_access_token>
```

---

## Integration Guide

### Role-based protection
```python
from app.auth import require_roles
@router.delete("/users/{id}", dependencies=[Depends(require_roles("admin"))])
async def delete_user(id: str): ...
```

### Permission-based protection
```python
from app.auth import require_permission
@router.post("/reimbursements", dependencies=[Depends(require_permission("reimbursement:create"))])
async def create_reimbursement(): ...
```

### Convenience decorators
```python
from app.auth.permissions import admin_only, can_approve, can_process_payment

@router.post("/admin/config", dependencies=[admin_only()])
async def update_config(): ...

@router.post("/approvals/{id}/approve", dependencies=[can_approve()])
async def approve_request(id: str): ...
```

### Resource ownership
```python
from app.auth import require_owner_or_roles
@router.get("/users/{user_id}/reimbursements",
             dependencies=[Depends(require_owner_or_roles("user_id", "admin"))])
async def get_user_reimbursements(user_id: str): ...
```
