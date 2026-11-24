import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Kbd,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useMediaQuery, useOs } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconSearch,
} from "@tabler/icons-react";
import { useParams } from "react-router";
import WorkspaceLink from "../components/WorkspaceLink";
import { useBreadcrumbTrail } from "./breadcrumbs";
import { ADMIN_NAV_LINKS, ALL_NAV_LINKS, findNavLink } from "./navigation";
import { useGetWorkspaceQuery } from "../api/workspace";
import NotificationsMenu from "../components/NotificationsMenu";
import { useAppPathname } from "../hooks/useWorkspacePath";
import classes from "./AppHeader.module.css";

// Pages can hand over a trail (see Page `breadcrumbs`); otherwise the nav link names the page.
const HeaderBreadcrumbs = () => {
  const { workspaceId } = useParams();
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  const pathname = useAppPathname();
  const showWorkspace = useMediaQuery("(min-width: 48em)", undefined, {
    getInitialValueInEffect: false,
  });
  const crumbs = useBreadcrumbTrail();
  const links = workspaceId ? ALL_NAV_LINKS : ADMIN_NAV_LINKS;
  const trail = crumbs?.length
    ? crumbs
    : [{ label: findNavLink(pathname, links)?.title ?? "Not found" }];

  return (
    <Breadcrumbs
      separator="/"
      separatorMargin={6}
      className={classes.breadcrumbs}
    >
      {showWorkspace && (
        <Text size="sm" c="dimmed" tt="capitalize">
          {workspaceId ? (workspace?.title ?? "…") : "Admin"}
        </Text>
      )}
      {trail.map(({ label, to }) =>
        to ? (
          <Anchor
            key={label}
            component={WorkspaceLink}
            to={to}
            size="sm"
            c="dimmed"
            underline="never"
          >
            {label}
          </Anchor>
        ) : (
          <Text key={label} size="sm" fw={500}>
            {label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
};

const AppHeader = ({ sidebarCollapsed, onToggleSidebar, onOpenMobileNav }) => {
  const { workspaceId } = useParams();
  const os = useOs();
  const modKey = os === "macos" || os === "ios" ? "⌘" : "Ctrl";

  return (
    <header className={classes.header}>
      <ActionIcon
        size="lg"
        hiddenFrom="md"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <IconMenu2 size={18} stroke={1.75} />
      </ActionIcon>
      <Tooltip label={`${sidebarCollapsed ? "Expand" : "Collapse"} sidebar`}>
        <ActionIcon
          size="lg"
          visibleFrom="md"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <IconLayoutSidebarLeftExpand size={16} stroke={1.75} />
          ) : (
            <IconLayoutSidebarLeftCollapse size={16} stroke={1.75} />
          )}
        </ActionIcon>
      </Tooltip>

      <HeaderBreadcrumbs />

      <div className={classes.actions}>
        <UnstyledButton
          className={classes.search}
          onClick={spotlight.open}
          visibleFrom="sm"
          aria-label="Search"
        >
          <IconSearch size={14} stroke={1.75} />
          <span className={classes.searchLabel}>Search…</span>
        </UnstyledButton>
        <ActionIcon
          size="lg"
          hiddenFrom="sm"
          onClick={spotlight.open}
          aria-label="Search"
        >
          <IconSearch size={16} stroke={1.75} />
        </ActionIcon>
        {workspaceId && <NotificationsMenu />}
      </div>
    </header>
  );
};

export default AppHeader;
