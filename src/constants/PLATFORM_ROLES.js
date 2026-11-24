const PLATFORM_ROLES = {
  SUPER_ADMIN: "super_admin",
  USER: "user",
};

export const PLATFORM_ROLE_OPTIONS = [
  { value: PLATFORM_ROLES.USER, label: "User" },
  { value: PLATFORM_ROLES.SUPER_ADMIN, label: "Super admin" },
];

// The roles the backend has returned so far. Add any others it supports here.
export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  AGENT: "agent",
  SUPERVISOR: "supervisor",
  VIEWER: "viewer",
};

export const WORKSPACE_ROLE_OPTIONS = [
  { value: WORKSPACE_ROLES.OWNER, label: "Owner" },
  { value: WORKSPACE_ROLES.AGENT, label: "Agent" },
];

// User account statuses the backend accepts.
export const USER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
];

const LABELS = Object.fromEntries(
  [...PLATFORM_ROLE_OPTIONS, ...WORKSPACE_ROLE_OPTIONS].map((o) => [
    o.value,
    o.label,
  ]),
);

/** "OWNER" → "Owner"; unknown values are title-cased. */
export const platformRoleLabel = (role) =>
  LABELS[role] ??
  (role ? role.charAt(0) + role.slice(1).toLowerCase().replace("_", " ") : "—");

export default PLATFORM_ROLES;
