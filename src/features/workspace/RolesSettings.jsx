import { Badge, Checkbox, Stack, Text, Tooltip } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { Fragment } from "react";
import SettingsSection from "../../components/SettingsSection";
import pluralize from "../../utils/pluralize";
import { permissions, roles } from "../../mocks/workspace";
import { usersStore } from "../../api/user";
import { saveRolePermissions, useRolePermissions } from "../../api/workspace";
import SettingsForm from "./SettingsForm";
import classes from "./WorkspaceSettings.module.css";

const PERMISSION_GROUPS = Object.entries(
  Object.groupBy(permissions, (permission) => permission.group),
);

const RolesSettings = () => {
  const rolePermissions = useRolePermissions();
  const users = usersStore.useItems();

  return (
    <Stack gap="lg">
      <SettingsSection
        title="Roles"
        description="Every member has exactly one role."
        flush
      >
        {roles.map((role) => (
          <div key={role.id} className={classes.listRow}>
            <div className={classes.listText}>
              <Text size="sm" fw={500}>
                {role.name}{" "}
                {role.locked && (
                  <IconLock
                    size={12}
                    style={{ verticalAlign: -1 }}
                    aria-label="Locked role"
                  />
                )}
              </Text>
              <Text size="xs" c="dimmed">
                {role.description}
              </Text>
            </div>
            <Badge variant="default">
              {pluralize(
                users.filter((user) => user.role === role.id).length,
                "member",
              )}
            </Badge>
          </div>
        ))}
      </SettingsSection>

      <SettingsForm
        title="Permissions"
        description="Choose what each role can do. The Owner role always has full access."
        initialValues={rolePermissions}
        onSave={saveRolePermissions}
        flush
      >
        {(form) => {
          const toggle = (roleId, permissionId) => {
            const current = form.values[roleId];
            form.setFieldValue(
              roleId,
              current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId],
            );
          };

          return (
            <div className={classes.matrix}>
              <table>
                <thead>
                  <tr>
                    <th>Permission</th>
                    {roles.map((role) => (
                      <th key={role.id}>{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_GROUPS.map(([group, items]) => (
                    <Fragment key={group}>
                      <tr className={classes.groupRow}>
                        <td colSpan={roles.length + 1}>{group}</td>
                      </tr>
                      {items.map((permission) => (
                        <tr key={permission.id}>
                          <td>{permission.label}</td>
                          {roles.map((role) => {
                            const checkbox = (
                              <Checkbox
                                aria-label={`${role.name}: ${permission.label}`}
                                checked={form.values[role.id].includes(
                                  permission.id,
                                )}
                                disabled={role.locked}
                                onChange={() => toggle(role.id, permission.id)}
                              />
                            );
                            return (
                              <td key={role.id}>
                                {role.locked ? (
                                  <Tooltip label="Owner permissions can't be changed">
                                    <span>{checkbox}</span>
                                  </Tooltip>
                                ) : (
                                  checkbox
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </SettingsForm>
    </Stack>
  );
};

export default RolesSettings;
