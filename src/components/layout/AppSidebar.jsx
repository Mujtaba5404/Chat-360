import { Menu, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconSelector, IconSettings, IconUserPlus } from '@tabler/icons-react';
import { NavLink, useNavigate } from 'react-router';
import { NAV_SECTIONS } from '../../app/navigation';
import { useCurrentUser } from '../../app/session';
import { useUnreadConversationCount } from '../../features/chat/store';
import { useLiveVisitorCount } from '../../features/visitors/store';
import { switchWorkspace, useCurrentWorkspace, useWorkspaces } from '../../features/workspace/store';
import { STATUS_META } from '../../lib/status';
import Logo from '../ui/Logo';
import UserAvatar from '../ui/UserAvatar';
import AccountMenu from './AccountMenu';
import classes from './AppSidebar.module.css';

function WorkspaceSwitcher({ collapsed, onNavigate }) {
  const navigate = useNavigate();
  const workspace = useCurrentWorkspace();
  const workspaces = useWorkspaces();

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const select = (target) => {
    switchWorkspace(target.id);
    notifications.show({ message: `Switched to ${target.name}` });
  };

  return (
    <Menu position="bottom-start" width={232}>
      <Menu.Target>
        <UnstyledButton className={classes.workspace} aria-label="Switch workspace">
          <Logo />
          {!collapsed && (
            <>
              <div className={classes.workspaceText}>
                <Text size="sm" fw={600} truncate>
                  {workspace.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {workspace.plan} plan
                </Text>
              </div>
              <IconSelector size={14} className={classes.muted} />
            </>
          )}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Workspaces</Menu.Label>
        {workspaces.map((item) => (
          <Menu.Item
            key={item.id}
            onClick={() => select(item)}
            rightSection={item.id === workspace.id && <IconCheck size={14} />}
          >
            {item.name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => go('/workspace')}>
          Workspace settings
        </Menu.Item>
        <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={() => go('/users?edit=new')}>
          Invite teammates
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function SidebarLink({ item, badge, collapsed, onNavigate }) {
  const Icon = item.icon;
  const link = (
    <NavLink to={item.path} className={classes.link} onClick={onNavigate} aria-label={collapsed ? item.label : undefined}>
      <Icon size={16} stroke={1.75} className={classes.linkIcon} />
      {!collapsed && <span className={classes.linkLabel}>{item.label}</span>}
      {badge > 0 &&
        (collapsed ? <span className={classes.dot} /> : <span className={classes.count}>{badge}</span>)}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip label={item.label} position="right" offset={12}>
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export default function AppSidebar({ collapsed = false, onNavigate }) {
  const user = useCurrentUser();
  const badges = { unread: useUnreadConversationCount(), live: useLiveVisitorCount() };

  return (
    <div className={classes.root} data-collapsed={collapsed || undefined}>
      <WorkspaceSwitcher collapsed={collapsed} onNavigate={onNavigate} />

      <nav className={classes.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={classes.section}>
            {!collapsed && <div className={classes.sectionLabel}>{section.label}</div>}
            {section.items.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                badge={badges[item.badge]}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className={classes.footer}>
        <AccountMenu position="top-start" onNavigate={onNavigate}>
          <UnstyledButton className={classes.profile} aria-label="Account menu">
            <UserAvatar name={user.name} presence={user.presence} size={28} />
            {!collapsed && (
              <>
                <div className={classes.workspaceText}>
                  <Text size="sm" fw={500} truncate>
                    {user.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {STATUS_META[user.presence].label}
                  </Text>
                </div>
                <IconSelector size={14} className={classes.muted} />
              </>
            )}
          </UnstyledButton>
        </AccountMenu>
      </div>
    </div>
  );
}
