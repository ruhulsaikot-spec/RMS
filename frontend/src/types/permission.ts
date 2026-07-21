export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  is_active: boolean;
}