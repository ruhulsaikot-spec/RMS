export const MODULES = [
  "Dashboard",

  "Claims",
  "Approvals",
  "Reports",

  "Companies",
  "Departments",
  "Designations",
  "Locations",
  "Employees",

  "Cost Centers",
  "Expense Types",
  "Projects",

  "Workflow Configuration",
  "Approval Groups",

  "Roles",
  "Role Permissions",
  "Users",
] as const;

export type ModuleName =
  (typeof MODULES)[number];