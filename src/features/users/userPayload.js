import PERMISSIONS from "../../constants/PERMISSIONS";
import PLATFORM_ROLES, {
  WORKSPACE_ROLES,
} from "../../constants/PLATFORM_ROLES";

/** A user record → form values. */
export const toUserValues = (user) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  password: "",
  platformRole: user?.platformRole ?? PLATFORM_ROLES.USER,
  workspaceRole: user?.workspaceRole ?? WORKSPACE_ROLES.AGENT,
  permissions: user?.permissions ?? [],
  status: user?.status ?? "active",
});

/** Form values (or a record) → the body `users` APIs expect. Blank password = unchanged. */
export const toUserPayload = (values) => {
  const isSuperAdmin = values.platformRole === PLATFORM_ROLES.SUPER_ADMIN;
  const payload = {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    platformRole: values.platformRole,
    ...(!isSuperAdmin && { workspaceRole: values.workspaceRole }),
    permissions: isSuperAdmin
      ? []
      : PERMISSIONS.filter((key) => values.permissions?.includes(key)),
    status: values.status,
    isActive: values.status === "active",
  };

  if (values.password) payload.password = values.password;

  return payload;
};
