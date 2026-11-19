import {
  Anchor,
  Button,
  ColorSwatch,
  EmptyState,
  Group,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "../notifications/showNotification";
import {
  IconMessageChatbot,
  IconPencil,
  IconPlus,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import useNow from "../hooks/useNow";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatNumber from "../utils/formatNumber";
import formatRelative from "../utils/formatRelative";
import pluralize from "../utils/pluralize";
import { removeWebsite, widgetsStore } from "../api/widget";
import WebsiteFormModal from "../features/website/WebsiteFormModal";
import WebsiteSetupDrawer from "../features/website/WebsiteSetupDrawer";
import { websitesStore } from "../api/website";

const SEARCH_FIELDS = ["name", "domain"];
const VERIFICATION_OPTIONS = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const WebsitePage = () => {
  const { filters, setFilters } = useFilters();
  const { view: viewId, edit: editId } = filters;
  const websites = websitesStore.useItems();
  const widgets = widgetsStore.useItems();
  const now = useNow();
  const table = useTableQuery(websites, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { verification: null },
    initialSort: { key: "monthlyVisitors", direction: "desc" },
  });
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const viewing = websites.find((site) => site.id === viewId);
  const editing =
    editId && editId !== "new"
      ? websites.find((site) => site.id === editId)
      : null;
  const widgetById = new Map(widgets.map((widget) => [widget.id, widget]));
  const widgetCount = widgets.reduce(
    (counts, widget) =>
      counts.set(widget.websiteId, (counts.get(widget.websiteId) ?? 0) + 1),
    new Map(),
  );
  const verifiedCount = websites.filter(
    (site) => site.verification === "verified",
  ).length;

  const confirmDelete = () => {
    removeWebsite(deleting.id);
    if (viewId === deleting.id) setFilters({ view: null });
    showNotification({ message: `${deleting.domain} deleted` });
  };

  const columns = [
    {
      key: "name",
      header: "Website",
      sortable: true,
      render: (site) => (
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="default" size={28} radius="sm">
            <IconWorld size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500} lh={1.3}>
              {site.name}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {site.domain}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "activeWidgetId",
      header: "Active widget",
      render: (site) => {
        const widget = widgetById.get(site.activeWidgetId);
        return widget ? (
          <Group gap={6} wrap="nowrap">
            <ColorSwatch color={widget.color} size={10} withShadow={false} />
            <Text size="sm">{widget.name}</Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            None, chat off
          </Text>
        );
      },
    },
    {
      key: "widgets",
      header: "Widgets",
      align: "right",
      render: (site) => (
        <Anchor
          component={Link}
          to={`/widgets?website=${site.id}`}
          size="sm"
          onClick={(event) => event.stopPropagation()}
        >
          {widgetCount.get(site.id) ?? 0}
        </Anchor>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      sortable: true,
      render: (site) => <StatusBadge status={site.verification} />,
    },
    {
      key: "connection",
      header: "Connection",
      sortable: true,
      render: (site) => (
        <StatusBadge status={site.connection} variant="light" />
      ),
    },
    {
      key: "monthlyVisitors",
      header: "Visitors / mo",
      sortable: true,
      align: "right",
      render: (site) => formatNumber(site.monthlyVisitors, "standard"),
    },
    {
      key: "lastActivityAt",
      header: "Last activity",
      sortable: true,
      render: (site) => (
        <Text size="sm" c="dimmed">
          {formatRelative(site.lastActivityAt, now)}
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
              label: "Manage widgets",
              icon: IconMessageChatbot,
              onClick: () => navigate(`/widgets?website=${site.id}`),
            },
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => setFilters({ edit: site.id }),
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
      description={`${websites.length} connected domains · ${verifiedCount} verified`}
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
        onRowClick={(site) => setFilters({ view: site.id })}
        minWidth={900}
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search websites"
            />
            <FilterSelect
              label="Verification"
              data={VERIFICATION_OPTIONS}
              value={table.filters.verification}
              onChange={(value) => table.setFilter("verification", value)}
            />
          </>
        }
        emptyState={
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
        }
      />

      <WebsiteSetupDrawer
        website={viewing}
        onClose={() => setFilters({ view: null })}
        onEdit={(site) => setFilters({ edit: site.id })}
        onDelete={setDeleting}
      />

      {(editId === "new" || editing) && (
        <WebsiteFormModal
          key={editId}
          website={editing}
          onClose={() => setFilters({ edit: null })}
          onCreated={(site) =>
            navigate({ search: `?view=${site.id}` }, { replace: true })
          }
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete website"
        message={`Chat will stop working on ${deleting?.domain ?? "this website"} immediately, and its ${pluralize(widgetCount.get(deleting?.id) ?? 0, "widget")} will be deleted.`}
        confirmLabel="Delete website"
      />
    </Page>
  );
};

export default WebsitePage;
