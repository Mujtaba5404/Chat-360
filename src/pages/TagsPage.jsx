import { Badge, Button, EmptyState, Loader, Text } from "@mantine/core";
import {
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  useDeleteTagMutation,
  useGetAllTagsQuery,
  useUpdateTagMutation,
} from "../api/tag";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import { safeColor } from "../constants/COLORS";
import TAG, { toTagPayload, toTagValues } from "../constants/TAG";
import TagFormModal from "../features/tags/TagFormModal";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatDate from "../utils/formatDate";

const SEARCH_FIELDS = ["title", "description"];
const NO_TAGS = [];

const TagsPage = () => {
  const { filters, setFilters } = useFilters();
  const { edit: editId } = filters;
  const { data = NO_TAGS, isLoading } = useGetAllTagsQuery();
  const updateMutation = useUpdateTagMutation();
  const deleteMutation = useDeleteTagMutation();
  const [deleting, setDeleting] = useState(null);

  // Flat fields the table can filter and sort on.
  const tags = useMemo(
    () =>
      data.map((tag) => ({
        ...tag,
        status: tag.isActive ? "active" : "inactive",
        creatorName: tag.createdBy?.name ?? "",
      })),
    [data],
  );
  const table = useTableQuery(tags, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { status: null },
    initialSort: { key: "title", direction: "asc" },
  });

  const editing =
    editId && editId !== "new" ? tags.find((tag) => tag._id === editId) : null;
  const activeCount = tags.filter((tag) => tag.isActive).length;

  const toggleActive = (tag) =>
    updateMutation.mutate({
      id: tag._id,
      ...toTagPayload({ ...toTagValues(tag), isActive: !tag.isActive }, tag),
    });

  const columns = [
    {
      key: "title",
      header: "Tag",
      sortable: true,
      render: (tag) => (
        <Badge color={safeColor(tag.color)} variant="light" tt="none">
          {tag.title}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (tag) => (
        <Text size="sm" c="dimmed" lineClamp={1} maw={360}>
          {tag.description || "—"}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (tag) => <StatusBadge status={tag.status} />,
    },
    {
      key: "creatorName",
      header: "Created by",
      sortable: true,
      render: (tag) => (
        <Text size="sm" c="dimmed" tt="capitalize">
          {tag.creatorName || "—"}
        </Text>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (tag) => (
        <Text size="sm" c="dimmed">
          {formatDate(tag.createdAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: 48,
      align: "right",
      render: (tag) => (
        <RowActions
          items={[
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: tag._id }),
            },
            {
              label: tag.isActive ? "Deactivate" : "Activate",
              icon: tag.isActive ? IconPlayerPause : IconPlayerPlay,
              onClick: () => toggleActive(tag),
            },
            { divider: true },
            {
              label: "Delete",
              icon: IconTrash,
              color: "red",
              onClick: () => setDeleting(tag),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Page
      title="Tags"
      description={
        isLoading
          ? "Labels for grouping conversations"
          : `${tags.length} tags · ${activeCount} active`
      }
      actions={
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setFilters({ edit: "new" })}
        >
          Add tag
        </Button>
      }
    >
      <DataTable
        columns={columns}
        state={table}
        rowKey="_id"
        onRowClick={(tag) => setFilters({ edit: tag._id })}
        minWidth={760}
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search tags"
            />
            <FilterSelect
              label="Status"
              data={TAG.STATUSES}
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
              icon={<IconTag size={20} />}
              title={
                table.isFiltered ? "No tags match your filters" : "No tags yet"
              }
              description={
                table.isFiltered
                  ? "Try a different search or filter."
                  : "Create tags to group conversations, e.g. billing or refund."
              }
            />
          )
        }
      />

      {(editId === "new" || editing) && (
        <TagFormModal
          key={editId}
          tag={editing}
          tags={tags}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
        title="Delete tag"
        message={`“${deleting?.title}” will be removed from the workspace.`}
        confirmLabel="Delete tag"
      />
    </Page>
  );
};

export default TagsPage;
