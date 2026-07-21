export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;

  employee_id: string;

  email: string;

  full_name: string;

  roles: string[];

  permissions: string[];

  department_id?: string;

  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;

  user: AuthUser;
}