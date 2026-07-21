export const DEFAULT_ROLES = [
  {
    id: 1,
    code: "SYSADM",
    name: "System Administrator",
    description: "Full system access",
  },
  {
    id: 2,
    code: "FINMGR",
    name: "Finance Manager",
    description: "Finance approval access",
  },
  {
    id: 3,
    code: "EMP",
    name: "Employee",
    description: "Basic employee access",
  },
];

export type DefaultRole =
  (typeof DEFAULT_ROLES)[number];