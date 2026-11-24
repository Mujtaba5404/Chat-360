import { Badge, Button, EmptyState, Group, Loader, Text } from "@mantine/core";
import {
  IconBuildingCommunity,
  IconDoorEnter,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useDeleteWorkspaceMutation,
  useGetAdminWorkspacesQuery,
} from "src/api/admin";
import ConfirmDialog from "src/components/ConfirmDialog";
import DataTable from "src/components/DataTable";
import Page from "src/components/Page";
import RowActions from "src/components/RowActions";
import StatusBadge from "src/components/StatusBadge";
import WorkspaceAvatar from "src/components/WorkspaceAvatar";
import PAGE_SIZES from "src/constants/PAGE_SIZES";
import WorkspaceFormModal from "src/features/admin/WorkspaceFormModal";
import useFilters from "src/hooks/useFilters";
import { HOME_PATH } from "src/layouts/navigation";
import formatDate from "src/utils/formatDate";
import pluralize from "src/utils/pluralize";

const AdminWorkspacesPage = () => {
  const navigate = useNavigate();
  const { filters, setFilters } = useFilters();
  const { edit: editId } = filters;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading } = useGetAdminWorkspacesQuery({ page, pageSize });
  const deleteMutation = useDeleteWorkspaceMutation();

  const workspaces = data?.data ?? [];
  const total = data?.meta?.totalCount ?? 0;
  const editing =
    editId && editId !== "new"
      ? workspaces.find((workspace) => workspace._id === editId)
      : null;

  // Server-side pagination in the shape DataTable / TablePagination expect.
  const table = {
    pageItems: workspaces,
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

  const open = (workspace) => navigate(`/${workspace.slug}${HOME_PATH}`);

  const columns = [
    {
      key: "title",
      header: "Workspace",
      render: (workspace) => (
        <Group gap="sm" wrap="nowrap">
          <WorkspaceAvatar workspace={workspace} size={30} />
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} lh={1.3} tt="capitalize" truncate>
              {workspace.title || "Untitled"}
            </Text>
            <Text size="xs" c="dimmed" ff="monospace" lh={1.3}>
              {workspace.slug}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: ({ user }) => (
        <div>
          <Text size="sm" lh={1.3} tt="capitalize">
            {user?.name || "—"}
          </Text>
          <Text size="xs" c="dimmed" lh={1.3}>
            {user?.email}
          </Text>
        </div>
      ),
    },
    {
      key: "agents",
      header: "Agents",
      render: (workspace) => (
        <Badge variant="default">{workspace.agents?.length ?? 0}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (workspace) => <StatusBadge status={workspace.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (workspace) => (
        <Text size="sm" c="dimmed">
          {formatDate(workspace.createdAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: 48,
      align: "right",
      render: (workspace) => (
        <RowActions
          items={[
            {
              label: "Open workspace",
              icon: IconDoorEnter,
              onClick: () => open(workspace),
            },
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: workspace._id }),
            },
            { divider: true },
            {
              label: "Delete",
              icon: IconTrash,
              color: "red",
              onClick: () => setDeleting(workspace),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Page
      title="Workspaces"
      description={
        isLoading
          ? "Every workspace on the platform"
          : `${pluralize(total, "workspace")} on the platform · open one to manage its inbox, widgets and settings`
      }
      actions={
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setFilters({ edit: "new" })}
        >
          Create workspace
        </Button>
      }
    >
      <DataTable
        columns={columns}
        state={table}
        rowKey="_id"
        onRowClick={open}
        emptyState={
          isLoading ? (
            <Loader size="sm" />
          ) : (
            <EmptyState
              size="sm"
              withIndicatorBackground
              icon={<IconBuildingCommunity size={20} />}
              title="No workspaces yet"
              description="Create the first workspace to get started."
            />
          )
        }
      />

      {(editId === "new" || editing) && (
        <WorkspaceFormModal
          key={editId}
          workspace={editing}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
        title="Delete workspace"
        message={`“${deleting?.title ?? "This workspace"}” and everything in it will be deleted. Its users will lose access immediately.`}
        confirmLabel="Delete workspace"
      />
    </Page>
  );
};

export default AdminWorkspacesPage;
