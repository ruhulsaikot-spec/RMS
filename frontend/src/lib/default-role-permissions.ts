import { MODULES } from "./modules";

const fullAccess = MODULES.map((module) => ({
  module,
  view: true,
  create: true,
  edit: true,
  delete: true,
  approve: true,
  export: true,
}));

const financeManagerAccess = MODULES.map(
  (module) => ({
    module,
    view: [
      "Dashboard",
      "Claims",
      "Approvals",
      "Reports",
      "Projects",
      "Cost Centers",
      "Expense Types",
    ].includes(module),

    create: [
      "Claims",
      "Projects",
      "Cost Centers",
      "Expense Types",
    ].includes(module),

    edit: [
      "Claims",
      "Projects",
      "Cost Centers",
      "Expense Types",
    ].includes(module),

    delete: false,

    approve: [
      "Claims",
      "Approvals",
    ].includes(module),

    export: [
      "Reports",
      "Claims",
    ].includes(module),
  })
);

const employeeAccess = MODULES.map(
  (module) => ({
    module,

    view: [
      "Dashboard",
      "Claims",
    ].includes(module),

    create:
      module === "Claims",

    edit:
      module === "Claims",

    delete: false,

    approve: false,

    export: false,
  })
);

export const DEFAULT_ROLE_PERMISSIONS = {
  "System Administrator":
    fullAccess,

  "Finance Manager":
    financeManagerAccess,

  Employee:
    employeeAccess,
};