import { Badge, Button, EmptyState, Group, Text } from "@mantine/core";
import { showNotification } from "../notifications/showNotification";
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
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import UserAvatar from "../components/UserAvatar";
import useNow from "../hooks/useNow";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatDate from "../utils/formatDate";
import formatRelative from "../utils/formatRelative";
import { unassignAgentConversations } from "../api/chat";
import UserDetailDrawer from "../features/users/UserDetailDrawer";
import UserFormModal from "../features/users/UserFormModal";
import { useCurrentUser, usersStore } from "../api/user";
import ROLES, { roleLabel } from "../constants/ROLES";

const SEARCH_FIELDS = ["name", "email", "title"];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "invited", label: "Invited" },
];

const UsersPage = () => {
  const { filters, setFilters } = useFilters();
  const { view: viewId, edit: editId } = filters;
  const users = usersStore.useItems();
  const currentUser = useCurrentUser();
  const now = useNow();
  const table = useTableQuery(users, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { role: null, status: null },
    initialSort: { key: "name", direction: "asc" },
  });
  const [deleting, setDeleting] = useState(null);

  const viewing = users.find((user) => user.id === viewId);
  const editing =
    editId && editId !== "new"
      ? users.find((user) => user.id === editId)
      : null;
  const onlineCount = users.filter((user) => user.presence === "online").length;
  const activeCount = users.filter((user) => user.status === "active").length;
  const isProtected = (user) =>
    user.role === "owner" || user.id === currentUser.id;

  const toggleActive = (user) => {
    const status = user.status === "active" ? "inactive" : "active";
    usersStore.update(user.id, {
      status,
      ...(status === "inactive" && { presence: "offline" }),
    });
    showNotification({
      message: `${user.name} ${status === "active" ? "activated" : "deactivated"}`,
    });
  };

  const deleteUser = () => {
    usersStore.remove(deleting.id);
    unassignAgentConversations(deleting.id);
    if (viewId === deleting.id) setFilters({ view: null });
    showNotification({
      message: `${deleting.name} was removed from the workspace`,
    });
  };

  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <Group gap="sm" wrap="nowrap">
          <UserAvatar
            name={user.name}
            presence={user.status === "active" ? user.presence : undefined}
            size={28}
          />
          <div>
            <Text size="sm" fw={500} lh={1.3}>
              {user.name}
              {user.id === currentUser.id && (
                <Text span size="xs" c="dimmed">
                  {" "}
                  (you)
                </Text>
              )}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {user.title}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (user) => (
        <Text size="sm" c="dimmed">
          {user.email}
        </Text>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => <Badge variant="default">{roleLabel(user.role)}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "lastActiveAt",
      header: "Last active",
      sortable: true,
      render: (user) =>
        user.status === "active" && user.presence === "online" ? (
          <Text size="sm" c="green">
            Online now
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {formatRelative(user.lastActiveAt, now)}
          </Text>
        ),
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
              onClick: () => setFilters({ view: user.id }),
            },
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: user.id }),
            },
            user.status !== "invited" && {
              label: user.status === "active" ? "Deactivate" : "Activate",
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
      description={`${users.length} members · ${activeCount} active · ${onlineCount} online now`}
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
        onRowClick={(user) => setFilters({ view: user.id })}
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search name, email or title"
            />
            <FilterSelect
              label="Role"
              data={ROLES}
              value={table.filters.role}
              onChange={(value) => table.setFilter("role", value)}
            />
            <FilterSelect
              label="Status"
              data={STATUS_OPTIONS}
              value={table.filters.status}
              onChange={(value) => table.setFilter("status", value)}
            />
          </>
        }
        emptyState={
          <EmptyState
            size="sm"
            withIndicatorBackground
            icon={<IconUsers size={20} />}
            title={
              table.isFiltered ? "No users match your filters" : "No users yet"
            }
            description={
              table.isFiltered
                ? "Try a different search or clear the filters."
                : "Invite your first teammate to get started."
            }
          >
            {table.isFiltered && (
              <Button variant="default" size="xs" mt="sm" onClick={table.reset}>
                Clear filters
              </Button>
            )}
          </EmptyState>
        }
      />

      <UserDetailDrawer
        user={viewing}
        isCurrentUser={viewing?.id === currentUser.id}
        onClose={() => setFilters({ view: null })}
        onEdit={(user) => setFilters({ edit: user.id })}
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
        message={`${deleting?.name ?? "This user"} will lose access to this workspace immediately. Their conversations will become unassigned.`}
        confirmLabel="Delete user"
      />
    </Page>
  );
};

export default UsersPage;
