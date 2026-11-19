import {
  Badge,
  Button,
  Code,
  EmptyState,
  Group,
  Select,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { showNotification } from "../notifications/showNotification";
import {
  IconBolt,
  IconCopy,
  IconLock,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCurrentUser } from "../api/auth";
import ConfirmDialog from "../components/ConfirmDialog";
import Page from "../components/Page";
import RowActions from "../components/RowActions";
import SearchInput from "../components/SearchInput";
import TablePagination from "../components/TablePagination";
import useFilters from "../hooks/useFilters";
import useTableQuery from "../hooks/useTableQuery";
import formatNumber from "../utils/formatNumber";
import formatRelative from "../utils/formatRelative";
import { cannedCategories } from "../mocks/cannedResponses";
import CannedResponseEditor from "../features/cannedResponses/CannedResponseEditor";
import TemplateText from "../features/cannedResponses/TemplateText";
import { cannedStore, useAvailableResponses } from "../api/cannedResponse";
import classes from "./CannedResponsesPage.module.css";

const SEARCH_FIELDS = ["title", "shortcut", "message"];
const SORTS = [
  { value: "usageCount:desc", label: "Most used" },
  { value: "lastUsedAt:desc", label: "Recently used" },
  { value: "title:asc", label: "Title A–Z" },
];
const categoryLabel = (value) =>
  cannedCategories.find((c) => c.value === value)?.label ?? value;

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
  const { filters, setFilters } = useFilters();
  const { edit: editId } = filters;
  const user = useCurrentUser();
  const responses = useAvailableResponses(user.id);
  const table = useTableQuery(responses, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { category: null, visibility: null },
    initialSort: { key: "usageCount", direction: "desc" },
    pageSize: 10,
  });
  const [deleting, setDeleting] = useState(null);
  const editing =
    editId && editId !== "new" ? responses.find((r) => r.id === editId) : null;

  const countBy = (key, value) =>
    responses.filter((r) => r[key] === value).length;
  const selectNav = (category, visibility = null) => {
    table.setFilter("category", category);
    table.setFilter("visibility", visibility);
  };
  const isNav = (category, visibility = null) =>
    table.filters.category === category &&
    table.filters.visibility === visibility;


  const remove = () => {
    cannedStore.remove(deleting.id);
    showNotification({ message: `Deleted /${deleting.shortcut}` });
  };

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
        <nav className={classes.nav} aria-label="Response categories">
          <NavItem label="All responses" icon={IconBolt} count={responses.length} active={isNav(null)} onClick={() => selectNav(null)}/>
          <NavItem label="Shared" icon={IconUsersGroup} count={countBy("visibility", "public")} active={isNav(null, "public")} onClick={() => selectNav(null, "public")}/>
          <NavItem label="Only me" icon={IconLock} count={countBy("visibility", "private")} active={isNav(null, "private")} onClick={() => selectNav(null, "private")}/>
          <Text className={classes.navHeading}>Categories</Text>
          {cannedCategories.map((category) => (
            <NavItem key={category.value} label={category.label} count={countBy("category", category.value)} active={isNav(category.value)} onClick={() => selectNav(category.value)}/>
          ))}
        </nav>

        <div className={classes.panel}>
          <div className={classes.toolbar}>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Search title, shortcut or text"
              w={{ base: "100%", sm: 280 }}
            />
            <Select
              aria-label="Sort by"
              data={SORTS}
              value={`${table.sort.key}:${table.sort.direction}`}
              onChange={(value) => {
                const [key, direction] = value.split(":");
                table.setSort({ key, direction });
              }}
              w={{ base: "100%", sm: 160 }}
              ml={{ sm: "auto" }}
            />
          </div>

          {table.pageItems.length ? (
            <ul className={classes.list}>
              {table.pageItems.map((response) => (
                <li key={response.id} className={classes.item}>
                  <UnstyledButton
                    className={classes.itemMain}
                    onClick={() => setFilters({ edit: response.id })}
                  >
                    <Group gap="sm" wrap="nowrap" mb={4}>
                      <Code className={classes.shortcut}>
                        /{response.shortcut}
                      </Code>
                      <Text size="sm" fw={600} truncate>
                        {response.title}
                      </Text>
                      {response.visibility === "private" && (
                        <IconLock
                          size={12}
                          aria-label="Private"
                          className={classes.muted}
                        />
                      )}
                    </Group>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      <TemplateText text={response.message} />
                    </Text>
                    <Group gap={6} mt="xs">
                      <Badge variant="default">
                        {categoryLabel(response.category)}
                      </Badge>
                      {response.tags.map((tag) => (
                        <Badge key={tag} variant="light" color="gray">
                          #{tag}
                        </Badge>
                      ))}
                      <Text size="xs" c="dimmed" ml="auto">
                        Used {formatNumber(response.usageCount, "standard")}× ·{" "}
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
                        onClick: () => setFilters({ edit: response.id }),
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
                  ? "Try another search or category."
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
          ownerId={user.id}
          onClose={() => setFilters({ edit: null })}
        />
      )}

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete canned response"
        message={`/${deleting?.shortcut ?? ""} will no longer be available to ${deleting?.visibility === "private" ? "you" : "your team"}.`}
      />
    </Page>
  );
};

export default CannedResponsesPage;