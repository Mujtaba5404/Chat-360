import { Badge, Button, EmptyState, Group, Loader, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "../api/user";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import UserAvatar from "../components/UserAvatar";
import PERMISSIONS from "../constants/PERMISSIONS";
import PLATFORM_ROLES, {
  USER_STATUSES,
  WORKSPACE_ROLE_OPTIONS,
  WORKSPACE_ROLES,
  platformRoleLabel,
} from "../constants/PLATFORM_ROLES";
import UserDetailDrawer from "../features/users/UserDetailDrawer";
import UserFormModal from "../features/users/UserFormModal";
import { toUserPayload, toUserValues } from "../features/users/userPayload";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatDate from "../utils/formatDate";

const SEARCH_FIELDS = ["name", "email"];
const NO_USERS = [];

const UsersPage = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const { filters, setFilters } = useFilters();
  const { view: viewId, edit: editId } = filters;
  const { data: users = NO_USERS, isLoading } = useGetAllUsersQuery();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const table = useTableQuery(users, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { workspaceRole: null, status: null },
    initialSort: { key: "name", direction: "asc" },
  });
  const [deleting, setDeleting] = useState(null);

  const viewing = users.find((user) => user._id === viewId);
  const editing =
    editId && editId !== "new"
      ? users.find((user) => user._id === editId)
      : null;
  const activeCount = users.filter((user) => user.status === "active").length;

  // The owner, a super admin and your own account can't be deactivated or deleted here.
  const isProtected = (user) =>
    user.workspaceRole === WORKSPACE_ROLES.OWNER ||
    user.platformRole === PLATFORM_ROLES.SUPER_ADMIN ||
    user._id === auth?.id;

  const toggleActive = (user) =>
    updateMutation.mutate({
      id: user._id,
      ...toUserPayload({
        ...toUserValues(user),
        status: user.status === "active" ? "suspended" : "active",
      }),
    });

  const deleteUser = () =>
    deleteMutation.mutate(deleting._id, {
      onSuccess: () => viewId === deleting._id && setFilters({ view: null }),
    });

  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <Group gap="sm" wrap="nowrap">
          <UserAvatar name={user.name} size={28} />
          <div>
            <Text size="sm" fw={500} lh={1.3} tt="capitalize">
              {user.name}
              {user._id === auth?.id && (
                <Text span size="xs" c="dimmed" tt="none">
                  {" "}
                  (you)
                </Text>
              )}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {user.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "workspaceRole",
      header: "Role",
      sortable: true,
      render: (user) => (
        <Badge variant="default">
          {platformRoleLabel(user.workspaceRole ?? user.platformRole)}
        </Badge>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (user) => (
        <Text size="sm" c="dimmed">
          {user.permissions?.length ?? 0} / {PERMISSIONS.length}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (user) => (
        <Text size="sm" c="dimmed">
          {formatDate(user.createdAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: 48,
      align: "right",
      render: (user) => (
        <RowActions
          items={[
            {
              label: "View details",
              icon: IconEye,
              onClick: () => setFilters({ view: user._id }),
            },
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: user._id }),
            },
            {
              label: user.status === "active" ? "Suspend" : "Activate",
              icon: user.status === "active" ? IconUserOff : IconUserCheck,
              disabled: isProtected(user),
              onClick: () => toggleActive(user),
            },
            { divider: true },
            {
              label: "Delete",
              icon: IconTrash,
              color: "red",
              disabled: isProtected(user),
              onClick: () => setDeleting(user),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Page
      title="Users"
      description={
        isLoading
          ? "Members of this workspace"
          : `${users.length} members · ${activeCount} active`
      }
      actions={
        <Button
          leftSection={<IconUserPlus size={14} />}
          onClick={() => setFilters({ edit: "new" })}
        >
          Add User
        </Button>
      }
    >
      <DataTable
        columns={columns}
        state={table}
        rowKey="_id"
        onRowClick={(user) => setFilters({ view: user._id })}
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search name or email"
            />
            <FilterSelect
              label="Role"
              data={WORKSPACE_ROLE_OPTIONS}
              value={table.filters.workspaceRole}
              onChange={(value) => table.setFilter("workspaceRole", value)}
            />
            <FilterSelect
              label="Status"
              data={USER_STATUSES}
              value={table.filters.status}
              onChange={(value) => table.setFilter("status", value)}
            />
          </>
        }
        emptyState={
          isLoading ? (
            <Loader size="sm" />
          ) : (
            <EmptyState
              size="sm"
              withIndicatorBackground
              icon={<IconUsers size={20} />}
              title={
                table.isFiltered
                  ? "No users match your filters"
                  : "No users yet"
              }
              description={
                table.isFiltered
                  ? "Try a different search or clear the filters."
                  : "Add your first teammate to get started."
              }
            >
              {table.isFiltered && (
                <Button
                  variant="default"
                  size="xs"
                  mt="sm"
                  onClick={table.reset}
                >
                  Clear filters
                </Button>
              )}
            </EmptyState>
          )
        }
      />

      <UserDetailDrawer
        user={viewing}
        isProtected={viewing && isProtected(viewing)}
        onClose={() => setFilters({ view: null })}
        onEdit={(user) => setFilters({ view: null, edit: user._id })}
        onToggleActive={toggleActive}
        onDelete={setDeleting}
      />

      {(editId === "new" || editing) && (
        <UserFormModal
          key={editId}
          user={editing}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={deleteUser}
        title="Delete user"
        message={`${deleting?.name ?? "This user"} will lose access to this workspace immediately.`}
        confirmLabel="Delete user"
      />
    </Page>
  );
};

export default UsersPage;
