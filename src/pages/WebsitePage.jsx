import {
  Badge,
  Button,
  EmptyState,
  Group,
  Loader,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconPencil,
  IconPlus,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  useDeleteWebsiteMutation,
  useGetAllWebsitesQuery,
} from "../api/website";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import WebsiteLogo from "../components/WebsiteLogo";
import WEBSITE, { displayDomain } from "../constants/WEBSITE";
import WebsiteFormModal from "../features/website/WebsiteFormModal";
import WebsiteSetupDrawer from "../features/website/WebsiteSetupDrawer";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatDate from "../utils/formatDate";

const SEARCH_FIELDS = ["title", "domain"];
const NO_WEBSITES = [];

const WebsitePage = () => {
  const { filters, setFilters } = useFilters();
  const { view: viewId, edit: editId } = filters;
  const { data: websites = NO_WEBSITES, isLoading } = useGetAllWebsitesQuery();
  const deleteMutation = useDeleteWebsiteMutation();
  const table = useTableQuery(websites, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { status: null, verificationStatus: null },
    initialSort: { key: "createdAt", direction: "desc" },
  });
  const [deleting, setDeleting] = useState(null);

  const viewing = websites.find((site) => site._id === viewId);
  const editing =
    editId && editId !== "new"
      ? websites.find((site) => site._id === editId)
      : null;
  const verifiedCount = websites.filter(
    (site) => site.verificationStatus === "verified",
  ).length;

  const confirmDelete = () =>
    deleteMutation.mutate(deleting._id, {
      onSuccess: () => viewId === deleting._id && setFilters({ view: null }),
    });

  const columns = [
    {
      key: "title",
      header: "Website",
      sortable: true,
      render: (site) => (
        <Group gap="sm" wrap="nowrap">
          <WebsiteLogo domain={site.domain} />
          <div>
            <Text size="sm" fw={500} lh={1.3} tt="capitalize">
              {site.title}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {displayDomain(site.domain)}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "allowedDomains",
      header: "Allowed domains",
      render: (site) =>
        site.allowedDomains?.length ? (
          <Tooltip
            label={site.allowedDomains.map(displayDomain).join(", ")}
            multiline
            maw={320}
          >
            <Badge variant="default" tt="none">
              {site.allowedDomains.length}{" "}
              {site.allowedDomains.length === 1 ? "domain" : "domains"}
            </Badge>
          </Tooltip>
        ) : (
          <Text size="sm" c="dimmed">
            None
          </Text>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (site) => <StatusBadge status={site.status} />,
    },
    {
      key: "verificationStatus",
      header: "Verification",
      sortable: true,
      render: (site) => (
        <StatusBadge status={site.verificationStatus} variant="light" />
      ),
    },
    {
      key: "originCheck",
      header: "Origin check",
      render: (site) => (
        <Text size="sm" c="dimmed">
          {site.settings?.enforceOriginCheck ? "Enforced" : "Off"}
        </Text>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      sortable: true,
      render: (site) => (
        <Text size="sm" c="dimmed">
          {formatDate(site.createdAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: 48,
      align: "right",
      render: (site) => (
        <RowActions
          items={[
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: site._id }),
            },
            { divider: true },
            {
              label: "Delete",
              icon: IconTrash,
              color: "red",
              onClick: () => setDeleting(site),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Page
      title="Website"
      description={
        isLoading
          ? "Connected domains"
          : `${websites.length} connected domains · ${verifiedCount} verified`
      }
      actions={
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setFilters({ edit: "new" })}
        >
          Add website
        </Button>
      }
    >
      <DataTable
        columns={columns}
        state={table}
        rowKey="_id"
        onRowClick={(site) => setFilters({ view: site._id })}
        minWidth={900}
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search websites"
            />
            <FilterSelect
              label="Status"
              data={WEBSITE.STATUSES}
              value={table.filters.status}
              onChange={(value) => table.setFilter("status", value)}
            />
            <FilterSelect
              label="Verification"
              data={WEBSITE.VERIFICATION_STATUSES}
              value={table.filters.verificationStatus}
              onChange={(value) => table.setFilter("verificationStatus", value)}
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
              icon={<IconWorld size={20} />}
              title={
                table.isFiltered
                  ? "No websites match your filters"
                  : "No websites connected"
              }
              description={
                table.isFiltered
                  ? "Try a different search or filter."
                  : "Add your first domain to install the chat widget."
              }
            />
          )
        }
      />

      <WebsiteSetupDrawer
        website={viewing}
        onClose={() => setFilters({ view: null })}
        onEdit={(site) => setFilters({ view: null, edit: site._id })}
        onDelete={setDeleting}
      />

      {(editId === "new" || editing) && (
        <WebsiteFormModal
          key={editId}
          website={editing}
          onClose={() => setFilters({ edit: null })}
          onCreated={(site) => setFilters({ edit: null, view: site?._id })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete website"
        message={`Chat will stop working on ${deleting ? displayDomain(deleting.domain) : "this website"} immediately.`}
        confirmLabel="Delete website"
      />
    </Page>
  );
};

export default WebsitePage;
