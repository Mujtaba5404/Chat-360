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
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
} from "src/api/admin";
import ConfirmDialog from "src/components/ConfirmDialog";
import DataTable from "src/components/DataTable";
import Page from "src/components/Page";
import RowActions from "src/components/RowActions";
import StatusBadge from "src/components/StatusBadge";
import UserAvatar from "src/components/UserAvatar";
import PAGE_SIZES from "src/constants/PAGE_SIZES";
import PERMISSIONS from "src/constants/PERMISSIONS";
import PLATFORM_ROLES, {
  platformRoleLabel,
} from "src/constants/PLATFORM_ROLES";
import UserDetailDrawer from "src/features/users/UserDetailDrawer";
import UserFormModal from "src/features/users/UserFormModal";
import { toUserPayload, toUserValues } from "src/features/users/userPayload";
import useFilters from "src/hooks/useFilters";
import formatDate from "src/utils/formatDate";
import pluralize from "src/utils/pluralize";

const AdminUsersPage = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const { filters, setFilters } = useFilters();
  const { view: viewId, edit: editId } = filters;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading } = useGetAdminUsersQuery({ page, pageSize });
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();

  const users = data?.data ?? [];
  const total = data?.meta?.totalCount ?? 0;
  const viewing = users.find((user) => user._id === viewId);
  const editing =
    editId && editId !== "new"
      ? users.find((user) => user._id === editId)
      : null;

  // Server-side pagination in the shape DataTable / TablePagination expect.
  const table = {
    pageItems: users,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, data?.meta?.totalPages ?? 1),
    setPage,
    setPageSize: (value) => {
      setPageSize(value);
      setPage(1);
    },
  };

  // A super admin can't deactivate or delete themselves.
  const isProtected = (user) => user._id === auth?.id;

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
      render: (user) => (
        <Group gap="sm" wrap="nowrap">
          <UserAvatar name={user.name} size={28} />
          <div>
            <Text size="sm" fw={500} lh={1.3} tt="capitalize">
              {user.name || "—"}
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
      key: "platformRole",
      header: "Platform role",
      render: (user) => (
        <Badge
          variant={
            user.platformRole === PLATFORM_ROLES.SUPER_ADMIN
              ? "light"
              : "default"
          }
        >
          {platformRoleLabel(user.platformRole)}
        </Badge>
      ),
    },
    {
      key: "workspaceRole",
      header: "Workspace role",
      render: (user) => (
        <Text size="sm" c="dimmed">
          {user.workspaceRole ? platformRoleLabel(user.workspaceRole) : "—"}
        </Text>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (user) => (
        <Text size="sm" c="dimmed">
          {user.platformRole === PLATFORM_ROLES.SUPER_ADMIN
            ? "All"
            : `${user.permissions?.length ?? 0} / ${PERMISSIONS.length}`}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
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
          ? "Every user on the platform"
          : `${pluralize(total, "user")} on the platform`
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
        emptyState={
          isLoading ? (
            <Loader size="sm" />
          ) : (
            <EmptyState
              size="sm"
              withIndicatorBackground
              icon={<IconUsers size={20} />}
              title="No users yet"
              description="Add the first user to get started."
            />
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
          scope="admin"
          user={editing}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={deleteUser}
        title="Delete user"
        message={`${deleting?.name ?? "This user"} will be removed from the platform and lose access immediately.`}
        confirmLabel="Delete user"
      />
    </Page>
  );
};

export default AdminUsersPage;
