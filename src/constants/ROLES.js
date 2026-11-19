const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "supervisor", label: "Supervisor" },
  { value: "agent", label: "Agent" },
  { value: "viewer", label: "Viewer" },
];

export const roleLabel = (role) =>
  ROLES.find((option) => option.value === role)?.label ?? role;

export default ROLES;
