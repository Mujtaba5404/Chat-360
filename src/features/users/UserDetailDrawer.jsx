import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { IconMail, IconPencil } from "@tabler/icons-react";
import CopyAction from "../../components/CopyAction";
import DetailDrawer, { DetailSection } from "../../components/DetailDrawer";
import PropertyList from "../../components/PropertyList";
import StatusBadge from "../../components/StatusBadge";
import UserAvatar from "../../components/UserAvatar";
import PERMISSIONS, {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  permissionKey,
} from "../../constants/PERMISSIONS";
import PLATFORM_ROLES, {
  platformRoleLabel,
} from "../../constants/PLATFORM_ROLES";
import formatDate from "../../utils/formatDate";

const actionLabel = (action) =>
  action.charAt(0) + action.slice(1).toLowerCase();

/** Each resource with the actions this user has on it. */
const PermissionSummary = ({ permissions = [] }) => {
  const granted = new Set(permissions);
  const rows = PERMISSION_RESOURCES.map((resource) => ({
    ...resource,
    actions: PERMISSION_ACTIONS.filter((action) =>
      granted.has(permissionKey(resource.value, action)),
    ),
  })).filter((row) => row.actions.length);

  if (!rows.length)
    return (
      <Text size="sm" c="dimmed">
        No permissions granted.
      </Text>
    );

  return (
    <PropertyList
      items={rows.map((row) => ({
        label: row.label,
        value:
          row.actions.length === PERMISSION_ACTIONS.length ? (
            <Badge variant="light" size="sm">
              Full access
            </Badge>
          ) : (
            <Group gap={4}>
              {row.actions.map((action) => (
                <Badge key={action} variant="default" size="sm">
                  {actionLabel(action)}
                </Badge>
              ))}
            </Group>
          ),
      }))}
    />
  );
};

const UserDetailDrawer = ({
  user,
  isProtected,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const isSuperAdmin = user?.platformRole === PLATFORM_ROLES.SUPER_ADMIN;

  return (
    <DetailDrawer
      opened={Boolean(user)}
      onClose={onClose}
      title="User details"
      summary={
        user && (
          <Group gap="md" wrap="nowrap" align="flex-start">
            <UserAvatar name={user.name} size={44} />
            <Stack gap={4} miw={0}>
              <Text fw={600} size="md" tt="capitalize" truncate>
                {user.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
              <Group gap={6} mt={4}>
                <StatusBadge status={user.status} />
                <Badge variant="default">
                  {platformRoleLabel(
                    isSuperAdmin ? user.platformRole : user.workspaceRole,
                  )}
                </Badge>
              </Group>
            </Stack>
          </Group>
        )
      }
      footer={
        user && (
          <>
            <Button
              variant="subtle"
              color="red"
              mr="auto"
              disabled={isProtected}
              onClick={() => onDelete(user)}
            >
              Delete
            </Button>
            <Button
              variant="default"
              disabled={isProtected}
              onClick={() => onToggleActive(user)}
            >
              {user.status === "active" ? "Suspend" : "Activate"}
            </Button>
            <Button
              leftSection={<IconPencil size={14} />}
              onClick={() => onEdit(user)}
            >
              Edit
            </Button>
          </>
        )
      }
    >
      {user && (
        <>
          <DetailSection title="Account">
            <PropertyList
              items={[
                {
                  label: "Email",
                  icon: IconMail,
                  value: (
                    <Group gap={4} wrap="nowrap">
                      {user.email}
                      <CopyAction value={user.email} label="Copy email" />
                    </Group>
                  ),
                },
                {
                  label: "Platform role",
                  value: platformRoleLabel(user.platformRole),
                },
                !isSuperAdmin && {
                  label: "Workspace role",
                  value: platformRoleLabel(user.workspaceRole),
                },
                {
                  label: "User ID",
                  value: (
                    <Group gap={4} wrap="nowrap">
                      <Text size="sm" ff="monospace">
                        {user._id}
                      </Text>
                      <CopyAction value={user._id} label="Copy user ID" />
                    </Group>
                  ),
                },
                { label: "Created", value: formatDate(user.createdAt) },
                { label: "Last updated", value: formatDate(user.updatedAt) },
              ].filter(Boolean)}
            />
          </DetailSection>

          <DetailSection
            title={
              isSuperAdmin
                ? "Access"
                : `Permissions · ${user.permissions?.length ?? 0} of ${PERMISSIONS.length}`
            }
          >
            {isSuperAdmin ? (
              <Text size="sm" c="dimmed">
                Super admins can open and manage every workspace.
              </Text>
            ) : (
              <PermissionSummary permissions={user.permissions} />
            )}
          </DetailSection>
        </>
      )}
    </DetailDrawer>
  );
};

export default UserDetailDrawer;
