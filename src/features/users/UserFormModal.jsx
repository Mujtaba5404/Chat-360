import { PasswordInput, Select, SimpleGrid, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
} from "../../api/admin";
import { useCreateUserMutation, useUpdateUserMutation } from "../../api/user";
import FormModal from "../../components/FormModal";
import PERMISSIONS from "../../constants/PERMISSIONS";
import PLATFORM_ROLES, {
  PLATFORM_ROLE_OPTIONS,
  USER_STATUSES,
  WORKSPACE_ROLE_OPTIONS,
  WORKSPACE_ROLES,
} from "../../constants/PLATFORM_ROLES";
import PermissionsInput from "./PermissionsInput";
import { toUserPayload, toUserValues } from "./userPayload";

/**
 * Create or edit a user. `scope="workspace"` uses /:slug/users (the workspace in the URL);
 * `scope="admin"` uses admin/users and can also set the platform role.
 * Mount with a `key` per record so the form resets.
 */
const UserFormModal = ({ user, scope = "workspace", onClose }) => {
  const isEdit = Boolean(user);
  const isAdmin = scope === "admin";
  const createWorkspaceUser = useCreateUserMutation();
  const updateWorkspaceUser = useUpdateUserMutation();
  const createAdminUser = useCreateAdminUserMutation();
  const updateAdminUser = useUpdateAdminUserMutation();
  const create = isAdmin ? createAdminUser : createWorkspaceUser;
  const update = isAdmin ? updateAdminUser : updateWorkspaceUser;

  const form = useForm({
    initialValues: toUserValues(user),
    validate: {
      name: (value) => (value.trim() ? null : "Name is required"),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Enter a valid email",
      password: (value) =>
        !value && isEdit
          ? null
          : value.length >= 8
            ? null
            : "Use at least 8 characters",
      // The backend requires at least one permission (super admins carry none).
      permissions: (value, values) =>
        values.platformRole === PLATFORM_ROLES.SUPER_ADMIN || value.length
          ? null
          : "Grant at least one permission",
    },
  });

  const isSuperAdmin = form.values.platformRole === PLATFORM_ROLES.SUPER_ADMIN;

  // Owners get full access by default; the matrix can still narrow it.
  const changeRole = (workspaceRole) => {
    form.setFieldValue("workspaceRole", workspaceRole);
    if (workspaceRole === WORKSPACE_ROLES.OWNER)
      form.setFieldValue("permissions", PERMISSIONS);
  };

  const submit = form.onSubmit((values) => {
    const payload = toUserPayload(values);
    const options = { onSuccess: onClose };

    if (isEdit) update.mutate({ id: user._id, ...payload }, options);
    else create.mutate(payload, options);
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit user" : "Add user"}
      submitLabel={isEdit ? "Save changes" : "Create user"}
      loading={create.isPending || update.isPending}
      onSubmit={submit}
    >
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <TextInput
          label="Full name"
          placeholder="Jane Cooper"
          withAsterisk
          data-autofocus
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Email"
          placeholder="jane@company.com"
          type="email"
          autoComplete="off"
          withAsterisk
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label={isEdit ? "New password" : "Password"}
          placeholder={
            isEdit ? "Leave blank to keep it" : "At least 8 characters"
          }
          autoComplete="new-password"
          withAsterisk={!isEdit}
          {...form.getInputProps("password")}
        />
        <Select
          label="Status"
          data={USER_STATUSES}
          allowDeselect={false}
          {...form.getInputProps("status")}
        />
        {isAdmin && (
          <Select
            label="Platform role"
            data={PLATFORM_ROLE_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps("platformRole")}
          />
        )}
        {!isSuperAdmin && (
          <Select
            label="Workspace role"
            data={WORKSPACE_ROLE_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps("workspaceRole")}
            onChange={changeRole}
          />
        )}
      </SimpleGrid>

      {!isSuperAdmin && (
        <PermissionsInput {...form.getInputProps("permissions")} />
      )}
    </FormModal>
  );
};

export default UserFormModal;
