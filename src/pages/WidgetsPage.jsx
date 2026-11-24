import {
  Badge,
  Button,
  EmptyState,
  Group,
  Loader,
  SegmentedControl,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCode,
  IconCopy,
  IconMessageChatbot,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetAllWebsitesQuery } from "../api/website";
import {
  useCreateWidgetMutation,
  useDeleteWidgetMutation,
  useGetAllWidgetsQuery,
  useUpdateWidgetMutation,
} from "../api/widget";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterSelect from "../components/FilterSelect";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import WebsiteLogo from "../components/WebsiteLogo";
import WorkspaceLink from "../components/WorkspaceLink";
import WIDGET, {
  toWidgetPayload,
  toWidgetValues,
  widgetWebsiteId,
} from "../constants/WIDGET";
import useFilters from "../hooks/useFilters";
import useWorkspacePath from "../hooks/useWorkspacePath";
import { showNotification } from "../notifications/showNotification";
import formatRelative from "../utils/formatRelative";
import getInstallSnippet from "../utils/getInstallSnippet";
import pluralize from "../utils/pluralize";
import readableTextColor from "../utils/readableTextColor";
import { normalizeDomain } from "../utils/validation";
import classes from "./WidgetsPage.module.css";

const STATUS_SEGMENTS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const NO_ITEMS = [];

// Older records may hold "BOTTOM_RIGHT"; the API now uses "bottom_right".
const positionLabel = (value = "") =>
  WIDGET.POSITIONS.find((p) => p.value === value.toLowerCase())?.label ??
  "Bottom right";
const stop = (event) => event.stopPropagation();

const WidgetRow = ({ widget, onToggle, onDuplicate, onDelete }) => {
  const navigate = useNavigate();
  const toWorkspace = useWorkspacePath();
  const editPath = `/widgets/${widget._id}`;
  const { settings = {} } = widget;
  const style = settings.style ?? {};
  const color = style.primaryColor ?? "#5E5AE6";

  const copyCode = async () => {
    await navigator.clipboard.writeText(getInstallSnippet(widget.publicKey));
    showNotification({ message: "Installation code copied" });
  };

  return (
    <div
      className={classes.row}
      data-active={widget.isActive || undefined}
      onClick={() => navigate(toWorkspace(editPath))}
    >
      <div className={classes.widget}>
        <span
          className={classes.swatch}
          style={{
            background: color,
            color: style.textColor ?? readableTextColor(color),
          }}
        >
          <IconMessageChatbot size={16} />
        </span>
        <div className={classes.widgetText}>
          <WorkspaceLink to={editPath} className={classes.name} onClick={stop}>
            {widget.title}
          </WorkspaceLink>
          <Text size="xs" c="dimmed" truncate>
            {settings.message?.welcome}
          </Text>
        </div>
      </div>
      <div>
        <StatusBadge status={widget.isActive ? "active" : "inactive"} />
      </div>
      <Text size="sm" c="dimmed" className={classes.optional}>
        {settings.preChatForm?.enabled ? "On" : "Off"}
      </Text>
      <Text size="sm" c="dimmed" className={classes.optional}>
        {positionLabel(style.position)}
      </Text>
      <Text size="sm" c="dimmed" className={classes.optional}>
        {formatRelative(widget.updatedAt)}
      </Text>
      <div className={classes.actions}>
        {!widget.isActive && (
          <Button
            size="xs"
            variant="default"
            className={classes.setActive}
            onClick={(event) => {
              stop(event);
              onToggle(widget);
            }}
          >
            Activate
          </Button>
        )}
        <RowActions
          items={[
            {
              label: "Edit",
              icon: IconPencil,
              onClick: () => navigate(toWorkspace(editPath)),
            },
            {
              label: widget.isActive ? "Deactivate" : "Activate",
              icon: widget.isActive ? IconPlayerPause : IconPlayerPlay,
              onClick: () => onToggle(widget),
            },
            {
              label: "Duplicate",
              icon: IconCopy,
              onClick: () => onDuplicate(widget),
            },
            { label: "Copy install code", icon: IconCode, onClick: copyCode },
            { divider: true },
            {
              label: "Delete",
              icon: IconTrash,
              color: "red",
              onClick: () => onDelete(widget),
            },
          ]}
        />
      </div>
    </div>
  );
};

const WebsiteGroup = ({ website, widgets, total, chatOff, ...handlers }) => {
  const domain = normalizeDomain(website.domain ?? "");

  return (
    <section aria-label={website.title}>
      <div className={classes.groupHeader}>
        <Group gap="sm" wrap="nowrap" miw={0}>
          <WebsiteLogo domain={website.domain} size={24} />
          <Text size="sm" fw={600} truncate>
            {website.title}
          </Text>
          <Text size="sm" c="dimmed" truncate className={classes.optional}>
            {domain}
          </Text>
          <Text size="xs" c="dimmed" className={classes.count}>
            {total}
          </Text>
          {chatOff && (
            <Tooltip
              label="No widget is active, so visitors don’t see chat. Activate one to turn it on."
              multiline
              w={240}
            >
              <Badge color="orange" variant="light" className={classes.flag}>
                Chat off
              </Badge>
            </Tooltip>
          )}
        </Group>
        <Button
          component={WorkspaceLink}
          to={`/widgets/new?website=${website._id}`}
          size="xs"
          variant="subtle"
          leftSection={<IconPlus size={14} />}
        >
          Add widget
        </Button>
      </div>

      {widgets.map((widget) => (
        <WidgetRow key={widget._id} widget={widget} {...handlers} />
      ))}

      {total === 0 && (
        <div className={classes.groupEmpty}>
          <Text size="sm" c="dimmed">
            No widgets on {domain} yet.
          </Text>
        </div>
      )}
    </section>
  );
};

const WidgetsPage = () => {
  const { filters, setFilters } = useFilters();
  const { website: websiteFilter } = filters;
  const { data: widgets = NO_ITEMS, isLoading: widgetsLoading } =
    useGetAllWidgetsQuery();
  const { data: websiteList = NO_ITEMS, isLoading: websitesLoading } =
    useGetAllWebsitesQuery();
  const createMutation = useCreateWidgetMutation();
  const updateMutation = useUpdateWidgetMutation();
  const deleteMutation = useDeleteWidgetMutation();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [deleting, setDeleting] = useState(null);

  // Websites of the workspace, plus any a widget points to that the list lacks.
  const websites = [...websiteList];
  for (const widget of widgets) {
    const id = widgetWebsiteId(widget);
    if (id && !websites.some((site) => site._id === id))
      websites.push(
        widget.website?._id
          ? widget.website
          : { _id: id, title: "Unknown website", domain: "" },
      );
  }

  const search = query.trim().toLowerCase();
  const isFiltered = Boolean(search) || status !== "all";

  const groups = websites
    .filter((site) => !websiteFilter || site._id === websiteFilter)
    .map((website) => {
      const own = widgets.filter((w) => widgetWebsiteId(w) === website._id);
      const visible = own.filter(
        (widget) =>
          widget.title.toLowerCase().includes(search) &&
          (status === "all" || (status === "active") === widget.isActive),
      );
      // Active widgets first, then most recently updated.
      visible.sort(
        (a, b) =>
          b.isActive - a.isActive ||
          (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      );
      return {
        website,
        widgets: visible,
        total: own.length,
        chatOff: own.length > 0 && !own.some((w) => w.isActive),
      };
    })
    // While filtering, hide websites with no matching widgets.
    .filter((group) => !isFiltered || group.widgets.length);

  // Round-tripped through the form mapping: the API takes the whole `settings`
  // object (a partial one resets the rest) and rejects keys it doesn't know.
  const handlers = {
    onToggle: (widget) =>
      updateMutation.mutate({
        id: widget._id,
        ...toWidgetPayload(toWidgetValues(widget)),
        isActive: !widget.isActive,
      }),
    onDuplicate: (widget) =>
      createMutation.mutate({
        website: widgetWebsiteId(widget),
        ...toWidgetPayload(toWidgetValues(widget)),
        title: `${widget.title} (copy)`,
        isActive: false,
      }),
    onDelete: setDeleting,
  };

  const loading = widgetsLoading || websitesLoading;

  return (
    <Page
      title="Widgets"
      description={`${pluralize(widgets.length, "widget")} across ${pluralize(websites.length, "website")}. Each website shows one active widget; activating another switches the current one off.`}
      actions={
        <Button
          component={WorkspaceLink}
          to={
            websiteFilter
              ? `/widgets/new?website=${websiteFilter}`
              : "/widgets/new"
          }
          leftSection={<IconPlus size={14} />}
        >
          Add widget
        </Button>
      }
    >
      <div className={classes.panel}>
        <div className={classes.toolbar}>
          <SegmentedControl
            value={status}
            onChange={setStatus}
            data={STATUS_SEGMENTS}
            aria-label="Widget status"
          />
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search widgets"
          />
          <FilterSelect
            label="Website"
            data={websites.map((site) => ({
              value: site._id,
              label: normalizeDomain(site.domain ?? "") || site.title,
            }))}
            value={websiteFilter}
            onChange={(website) => setFilters({ website })}
            w={{ base: "100%", sm: 180 }}
          />
        </div>

        {groups.length ? (
          <div className={classes.scroll}>
            <div className={classes.table}>
              <div className={classes.head} aria-hidden="true">
                <span>Widget</span>
                <span>Status</span>
                <span className={classes.optional}>Pre-chat</span>
                <span className={classes.optional}>Position</span>
                <span className={classes.optional}>Updated</span>
                <span />
              </div>
              {groups.map((group) => (
                <WebsiteGroup
                  key={group.website._id}
                  {...group}
                  {...handlers}
                />
              ))}
            </div>
          </div>
        ) : loading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : (
          <EmptyState
            size="sm"
            withIndicatorBackground
            icon={<IconMessageChatbot size={20} />}
            title={
              isFiltered ? "No widgets match your filters" : "No websites yet"
            }
            description={
              isFiltered
                ? "Try a different search or status."
                : "Add a website first, then design the widgets it shows."
            }
            className={classes.empty}
          >
            {!isFiltered && (
              <Button component={WorkspaceLink} to="/website?edit=new" mt="md">
                Add website
              </Button>
            )}
          </EmptyState>
        )}
      </div>

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
        title="Delete widget"
        message={
          deleting?.isActive
            ? `“${deleting.title}” is active. Visitors stop seeing it as soon as it’s deleted.`
            : "This widget will be permanently deleted."
        }
        confirmLabel="Delete widget"
      />
    </Page>
  );
};

export default WidgetsPage;
