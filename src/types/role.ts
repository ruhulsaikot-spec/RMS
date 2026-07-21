import { Permission } from "./permission";

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
}

export interface RolePermission {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
}