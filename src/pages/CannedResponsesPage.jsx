import {
  Badge,
  Button,
  Code,
  EmptyState,
  Group,
  Loader,
  Select,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconBolt,
  IconCircleCheck,
  IconCircleOff,
  IconFolder,
  IconLock,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  useDeleteCannedResponseMutation,
  useGetAllCannedResponsesQuery,
  useUpdateCannedResponseMutation,
} from "../api/cannedResponse";
import ConfirmDialog from "../components/ConfirmDialog";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import TablePagination from "../components/TablePagination";
import CANNED_RESPONSE, {
  categoryLabel,
  creatorIdOf,
  isVisibleTo,
  shortcutName,
  tagNamesOf,
  toCannedPayload,
  toCannedValues,
} from "../constants/CANNED_RESPONSE";
import CannedResponseEditor from "../features/cannedResponses/CannedResponseEditor";
import TemplateText from "../features/cannedResponses/TemplateText";
import useFilters from "../hooks/useFilters";
import useIsSuperAdmin from "../hooks/useIsSuperAdmin";
import useTableQuery from "../hooks/useTableQuery";
import formatNumber from "../utils/formatNumber";
import formatRelative from "../utils/formatRelative";
import classes from "./CannedResponsesPage.module.css";

const SEARCH_FIELDS = ["title", "shortcut", "content", "tagNames"];
const NO_RESPONSES = [];
const ALL = { isActive: null, createdBy: null, category: null };

const NavItem = ({ active, onClick, icon: Icon, label, count }) => {
  return (
    <UnstyledButton
      className={classes.navItem}
      data-active={active || undefined}
      onClick={onClick}
      aria-pressed={active}
    >
      {Icon && <Icon size={14} stroke={1.75} />}
      <span className={classes.navLabel}>{label}</span>
      <span className={classes.navCount}>{count}</span>
    </UnstyledButton>
  );
};

const CannedResponsesPage = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const isSuperAdmin = useIsSuperAdmin();
  const { filters, setFilters } = useFilters();
  const { edit: editId } = filters;
  const { data = NO_RESPONSES, isLoading } = useGetAllCannedResponsesQuery();
  const updateMutation = useUpdateCannedResponseMutation();
  const deleteMutation = useDeleteCannedResponseMutation();

  // Private responses only show to their creator. `createdBy` and `tagList` are
  // flattened so the list can filter, search and render them.
  const responses = useMemo(
    () =>
      data
        .filter((response) => isVisibleTo(response, auth?.id, isSuperAdmin))
        .map((response) => {
          const tagList = tagNamesOf(response.tags);
          return {
            ...response,
            createdBy: creatorIdOf(response),
            tagList,
            tagNames: tagList.join(" "),
          };
        }),
    [data, auth?.id, isSuperAdmin],
  );
  const table = useTableQuery(responses, {
    searchFields: SEARCH_FIELDS,
    initialFilters: ALL,
    initialSort: { key: "usageCount", direction: "desc" },
    pageSize: 10,
  });
  const [deleting, setDeleting] = useState(null);
  const editing =
    editId && editId !== "new" ? responses.find((r) => r._id === editId) : null;

  const selectNav = (next) => {
    const target = { ...ALL, ...next };
    for (const key of Object.keys(ALL)) table.setFilter(key, target[key]);
  };
  const isNav = (next) => {
    const target = { ...ALL, ...next };
    return Object.keys(ALL).every((key) => table.filters[key] === target[key]);
  };
  const navItem = (key, label, icon, next) => (
    <NavItem
      key={key}
      label={label}
      icon={icon}
      count={
        Object.entries(next).reduce(
          (list, [field, value]) => list.filter((r) => r[field] === value),
          responses,
        ).length
      }
      active={isNav(next)}
      onClick={() => selectNav(next)}
    />
  );

  const toggleActive = (response) =>
    updateMutation.mutate({
      id: response._id,
      ...toCannedPayload({
        ...toCannedValues(response),
        isActive: !response.isActive,
      }),
    });

  return (
    <Page
      title="Canned Responses"
      description="Saved replies your team can insert with / in any conversation."
      actions={
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setFilters({ edit: "new" })}
        >
          Add Response
        </Button>
      }
    >
      <div className={classes.layout}>
        <nav className={classes.nav} aria-label="Response filters">
          {navItem("all", "All responses", IconBolt, {})}
          {navItem("active", "Active", IconCircleCheck, { isActive: true })}
          {navItem("inactive", "Inactive", IconCircleOff, { isActive: false })}
          {navItem("mine", "Created by me", IconUser, { createdBy: auth?.id })}
          <Text className={classes.navHeading}>Categories</Text>
          {CANNED_RESPONSE.CATEGORIES.map((category) =>
            navItem(category.value, category.label, IconFolder, {
              category: category.value,
            }),
          )}
        </nav>

        <div className={classes.panel}>
          <div className={classes.toolbar}>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search title, shortcut, text or tag"
              w={{ base: "100%", sm: 300 }}
            />
            <Select
              aria-label="Sort by"
              data={CANNED_RESPONSE.SORTS}
              value={`${table.sort.key}:${table.sort.direction}`}
              onChange={(value) => {
                const [key, direction] = value.split(":");
                table.setSort({ key, direction });
              }}
              allowDeselect={false}
              w={{ base: "100%", sm: 160 }}
              ml={{ sm: "auto" }}
            />
          </div>

          {table.pageItems.length ? (
            <ul className={classes.list}>
              {table.pageItems.map((response) => (
                <li key={response._id} className={classes.item}>
                  <UnstyledButton
                    className={classes.itemMain}
                    onClick={() => setFilters({ edit: response._id })}
                  >
                    <Group gap="sm" wrap="nowrap" mb={4} miw={0}>
                      <Text size="sm" fw={600} truncate tt="capitalize" miw={0}>
                        {response.title || shortcutName(response.shortcut)}
                      </Text>
                      <Code className={classes.shortcut}>
                        /{shortcutName(response.shortcut)}
                      </Code>
                      {response.visibility === "private" && (
                        <Badge
                          variant="default"
                          size="sm"
                          leftSection={<IconLock size={10} />}
                        >
                          Only me
                        </Badge>
                      )}
                      {!response.isActive && (
                        <Badge variant="default" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      <TemplateText text={response.content} />
                    </Text>
                    <Group gap={6} mt="xs">
                      {response.category && (
                        <Badge variant="light" color="gray" size="sm">
                          {categoryLabel(response.category)}
                        </Badge>
                      )}
                      {response.tagList.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm" tt="none">
                          {tag}
                        </Badge>
                      ))}
                      {response.user?.name && (
                        <Text size="xs" c="dimmed" tt="capitalize">
                          By {response.user.name}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed" ml="auto">
                        Used{" "}
                        {formatNumber(response.usageCount ?? 0, "standard")}× ·{" "}
                        {response.lastUsedAt
                          ? formatRelative(response.lastUsedAt)
                          : "never used"}
                      </Text>
                    </Group>
                  </UnstyledButton>
                  <RowActions
                    items={[
                      {
                        label: "Edit",
                        icon: IconPencil,
                        onClick: () => setFilters({ edit: response._id }),
                      },
                      {
                        label: response.isActive ? "Deactivate" : "Activate",
                        icon: response.isActive
                          ? IconPlayerPause
                          : IconPlayerPlay,
                        onClick: () => toggleActive(response),
                      },
                      { divider: true },
                      {
                        label: "Delete",
                        icon: IconTrash,
                        color: "red",
                        onClick: () => setDeleting(response),
                      },
                    ]}
                  />
                </li>
              ))}
            </ul>
          ) : isLoading ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <EmptyState
              size="sm"
              withIndicatorBackground
              icon={<IconBolt size={20} />}
              title={
                table.isFiltered
                  ? "No matching responses"
                  : "No canned responses yet"
              }
              description={
                table.isFiltered
                  ? "Try another search or filter."
                  : "Save replies you send often and insert them with a shortcut."
              }
              className={classes.empty}
            />
          )}

          {table.total > 0 && <TablePagination state={table} />}
        </div>
      </div>

      {(editId === "new" || editing) && (
        <CannedResponseEditor
          key={editId}
          response={editing}
          responses={data}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
        title="Delete canned response"
        message={`/${shortcutName(deleting?.shortcut)} will no longer be available to your team.`}
      />
    </Page>
  );
};

export default CannedResponsesPage;
