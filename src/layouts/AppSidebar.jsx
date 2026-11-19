import { Menu, Text, UnstyledButton } from "@mantine/core";
import { showNotification } from "../notifications/showNotification";
import {
  IconCheck,
  IconSelector,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import AppSidebarLink from "./AppSidebarLink";
import { NAV_SECTIONS } from "./navigation";
import { useCurrentUser } from "../api/auth";
import { useUnreadConversationCount } from "../api/chat";
import { useLiveVisitorCount } from "../api/visitor";
import {
  switchWorkspace,
  useCurrentWorkspace,
  useWorkspaces,
} from "../api/workspace";
import { STATUS_META } from "../constants/STATUS";
import Logo from "../components/Logo";
import UserAvatar from "../components/UserAvatar";
import UserMenu from "../components/UserMenu";
import classes from "./AppSidebar.module.css";

const WorkspaceSwitcher = ({ collapsed, onNavigate }) => {
  const navigate = useNavigate();
  const workspace = useCurrentWorkspace();
  const workspaces = useWorkspaces();

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const select = (target) => {
    switchWorkspace(target.id);
    showNotification({ message: `Switched to ${target.name}` });
  };

  return (
    <Menu position="bottom-start" width={232}>
      <Menu.Target>
        <UnstyledButton
          className={classes.workspace}
          aria-label="Switch workspace"
        >
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
        <Menu.Item
          leftSection={<IconSettings size={14} />}
          onClick={() => go("/workspace")}
        >
          Workspace settings
        </Menu.Item>
        <Menu.Item
          leftSection={<IconUserPlus size={14} />}
          onClick={() => go("/users?edit=new")}
        >
          Invite teammates
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const AppSidebar = ({ collapsed = false, onNavigate }) => {
  const user = useCurrentUser();
  const badges = {
    unread: useUnreadConversationCount(),
    live: useLiveVisitorCount(),
  };

  return (
    <div className={classes.root} data-collapsed={collapsed || undefined}>
      <WorkspaceSwitcher collapsed={collapsed} onNavigate={onNavigate} />

      <nav className={classes.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={classes.section}>
            {!collapsed && (
              <div className={classes.sectionLabel}>{section.label}</div>
            )}
            {section.links.map((link) => (
              <AppSidebarLink key={link.path} link={link} badge={badges[link.badge]} collapsed={collapsed} onNavigate={onNavigate}/>
            ))}
          </div>
        ))}
      </nav>

      <div className={classes.footer}>
        <UserMenu position="top-start" onNavigate={onNavigate}>
          <UnstyledButton className={classes.profile} aria-label="Account menu">
            <UserAvatar name={user.name} presence={user.presence} size={28} />
            {!collapsed && (
              <>
                <div className={classes.workspaceText}>
                  <Text size="sm" fw={500} truncate>{user.name}</Text>
                  <Text size="xs" c="dimmed" truncate>{STATUS_META[user.presence].label}</Text>
                </div>
                <IconSelector size={14} className={classes.muted} />
              </>
            )}
          </UnstyledButton>
        </UserMenu>
      </div>
    </div>
  );
};

export default AppSidebar;