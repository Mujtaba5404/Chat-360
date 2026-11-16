import { ActionIcon, Anchor, Breadcrumbs, Kbd, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { useMediaQuery, useOs } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMenu2, IconSearch } from '@tabler/icons-react';
import { Link, useMatches } from 'react-router';
import { NAV_ITEMS } from '../../app/navigation';
import { useCurrentWorkspace } from '../../features/workspace/store';
import NotificationsMenu from './NotificationsMenu';
import classes from './AppHeader.module.css';

function HeaderBreadcrumbs() {
  const workspace = useCurrentWorkspace();
  const showWorkspace = useMediaQuery('(min-width: 48em)', undefined, { getInitialValueInEffect: false });
  const match = useMatches().findLast((m) => m.handle?.title);
  const section = NAV_ITEMS.find((item) => item.label === match?.handle.title);
  const detail = match?.handle.detail;

  return (
    <Breadcrumbs separator="/" separatorMargin={6} className={classes.breadcrumbs}>
      {showWorkspace && (
        <Text size="sm" c="dimmed">
          {workspace.name}
        </Text>
      )}
      {match &&
        (detail && section ? (
          <Anchor component={Link} to={section.path} size="sm" c="dimmed" underline="never">
            {match.handle.title}
          </Anchor>
        ) : (
          <Text size="sm" fw={500}>
            {match.handle.title}
          </Text>
        ))}
      {detail && (
        <Text size="sm" fw={500}>
          {detail}
        </Text>
      )}
    </Breadcrumbs>
  );
}

export default function AppHeader({ sidebarCollapsed, onToggleSidebar, onOpenMobileNav }) {
  const os = useOs();
  const modKey = os === 'macos' || os === 'ios' ? '⌘' : 'Ctrl';

  return (
    <header className={classes.header}>
      <ActionIcon size="lg" hiddenFrom="md" onClick={onOpenMobileNav} aria-label="Open navigation">
        <IconMenu2 size={18} stroke={1.75} />
      </ActionIcon>
      <Tooltip label={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar  [`}>
        <ActionIcon size="lg" visibleFrom="md" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          {sidebarCollapsed ? <IconLayoutSidebarLeftExpand size={16} stroke={1.75} /> : <IconLayoutSidebarLeftCollapse size={16} stroke={1.75} />}
        </ActionIcon>
      </Tooltip>

      <HeaderBreadcrumbs />

      <div className={classes.actions}>
        <UnstyledButton className={classes.search} onClick={spotlight.open} visibleFrom="sm" aria-label="Search">
          <IconSearch size={14} stroke={1.75} />
          <span className={classes.searchLabel}>Search…</span>
          <span className={classes.searchKeys}>
            <Kbd>{modKey}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </UnstyledButton>
        <ActionIcon size="lg" hiddenFrom="sm" onClick={spotlight.open} aria-label="Search">
          <IconSearch size={16} stroke={1.75} />
        </ActionIcon>
        <NotificationsMenu />
      </div>
    </header>
  );
}
