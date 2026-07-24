(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/contexts/user-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserProvider",
    ()=>UserProvider,
    "useUser",
    ()=>useUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const UserContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    currentUser: {
        employeeId: "",
        employeeName: "",
        email: "",
        role: "",
        permissions: []
    },
    isLoaded: false,
    setCurrentUser: ()=>{}
});
function UserProvider({ children }) {
    _s();
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        employeeId: "",
        employeeName: "",
        email: "",
        role: "",
        permissions: []
    });
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserProvider.useEffect": ()=>{
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setCurrentUser({
                        employeeId: parsedUser.employee_id || parsedUser.employeeId || parsedUser.id || "",
                        employeeName: parsedUser.full_name || parsedUser.employeeName || "",
                        email: parsedUser.email || "",
                        role: parsedUser.roles?.[0] || parsedUser.role || "",
                        permissions: parsedUser.permissions || []
                    });
                } catch (error) {
                    console.error("User Restore Error", error);
                }
            }
            setIsLoaded(true);
        }
    }["UserProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserContext.Provider, {
        value: {
            currentUser,
            isLoaded,
            setCurrentUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/user-context.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(UserProvider, "IKjVTba/32nJKQLU/C47Cu90Yww=");
_c = UserProvider;
function useUser() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(UserContext);
}
_s1(useUser, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "UserProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/user-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    role: "",
    setRole: ()=>{},
    permissions: []
});
function AuthProvider({ children }) {
    _s();
    const { currentUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            role: currentUser.role,
            setRole: ()=>{},
            permissions: currentUser.permissions || []
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/auth-context.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "v+M8xp8m2lAPJOnDjuJQyrgC5Tk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/modules.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MODULES",
    ()=>MODULES
]);
const MODULES = [
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
    "Users"
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/default-role-permissions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ROLE_PERMISSIONS",
    ()=>DEFAULT_ROLE_PERMISSIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modules.ts [app-client] (ecmascript)");
;
const fullAccess = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODULES"].map((module)=>({
        module,
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
        export: true
    }));
const financeManagerAccess = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODULES"].map((module)=>({
        module,
        view: [
            "Dashboard",
            "Claims",
            "Approvals",
            "Reports",
            "Projects",
            "Cost Centers",
            "Expense Types"
        ].includes(module),
        create: [
            "Claims",
            "Projects",
            "Cost Centers",
            "Expense Types"
        ].includes(module),
        edit: [
            "Claims",
            "Projects",
            "Cost Centers",
            "Expense Types"
        ].includes(module),
        delete: false,
        approve: [
            "Claims",
            "Approvals"
        ].includes(module),
        export: [
            "Reports",
            "Claims"
        ].includes(module)
    }));
const employeeAccess = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODULES"].map((module)=>({
        module,
        view: [
            "Dashboard",
            "Claims"
        ].includes(module),
        create: module === "Claims",
        edit: module === "Claims",
        delete: false,
        approve: false,
        export: false
    }));
const DEFAULT_ROLE_PERMISSIONS = {
    "System Administrator": fullAccess,
    "Finance Manager": financeManagerAccess,
    Employee: employeeAccess
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/rbac-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RBACProvider",
    ()=>RBACProvider,
    "useRBACContext",
    ()=>useRBACContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$default$2d$role$2d$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/default-role-permissions.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const RBACContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    rolePermissions: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$default$2d$role$2d$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_ROLE_PERMISSIONS"],
    setRolePermissions: ()=>{}
});
function RBACProvider({ children }) {
    _s();
    const [rolePermissions, setRolePermissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$default$2d$role$2d$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_ROLE_PERMISSIONS"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RBACContext.Provider, {
        value: {
            rolePermissions,
            setRolePermissions
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/rbac-context.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(RBACProvider, "NkfzhCeTTPz9wUU7aki94APXPBA=");
_c = RBACProvider;
function useRBACContext() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RBACContext);
}
_s1(useRBACContext, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "RBACProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/user-management-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserManagementProvider",
    ()=>UserManagementProvider,
    "useUserManagement",
    ()=>useUserManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const UserManagementContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    users: [],
    setUsers: ()=>{}
});
function UserManagementProvider({ children }) {
    _s();
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            employeeId: "EMP-001",
            employeeName: "System Administrator",
            email: "admin@rms.com",
            role: "System Administrator",
            password: "Password@123",
            status: "Active"
        },
        {
            id: 2,
            employeeId: "EMP-002",
            employeeName: "John Smith",
            email: "john.smith@rms.com",
            role: "Finance Manager",
            password: "Password@123",
            status: "Active"
        },
        {
            id: 3,
            employeeId: "EMP-003",
            employeeName: "Sarah Ahmed",
            email: "sarah.ahmed@rms.com",
            role: "Employee",
            password: "Password@123",
            status: "Inactive"
        }
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserManagementContext.Provider, {
        value: {
            users,
            setUsers
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/user-management-context.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_s(UserManagementProvider, "pJGfYO8yECSLLPQdnkWksgXEddk=");
_c = UserManagementProvider;
function useUserManagement() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(UserManagementContext);
}
_s1(useUserManagement, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "UserManagementProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/auth/route-guard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RouteGuard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/user-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RouteGuard({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { currentUser, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RouteGuard.useEffect": ()=>{
            if (!isLoaded) {
                return;
            }
            const publicRoutes = [
                "/"
            ];
            const isPublic = publicRoutes.includes(pathname);
            if (!isPublic && !currentUser.employeeId) {
                router.replace("/");
            }
        }
    }["RouteGuard.useEffect"], [
        pathname,
        currentUser,
        isLoaded,
        router
    ]);
    if (!isLoaded) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center",
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/components/auth/route-guard.tsx",
            lineNumber: 65,
            columnNumber: 7
        }, this);
    }
    const publicRoutes = [
        "/"
    ];
    const isPublic = publicRoutes.includes(pathname);
    if (!isPublic && !currentUser.employeeId) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(RouteGuard, "uFzx59JaRvwMo7svAmRcarCya2s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$user$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = RouteGuard;
var _c;
__turbopack_context__.k.register(_c, "RouteGuard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_13oluxz._.js.map