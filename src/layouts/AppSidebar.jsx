import { Menu, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconCheck,
  IconSelector,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetAllAdminWorkspacesQuery } from "../api/admin";
import { useUnreadConversationCount } from "../api/chat";
import { useCurrentUser } from "../api/user";
import { useLiveVisitorCount } from "../api/visitor";
import { useGetWorkspaceQuery } from "../api/workspace";
import Logo from "../components/Logo";
import UserAvatar from "../components/UserAvatar";
import UserMenu from "../components/UserMenu";
import WorkspaceAvatar from "../components/WorkspaceAvatar";
import PLATFORM_ROLES from "../constants/PLATFORM_ROLES";
import { roleLabel } from "../constants/ROLES";
import { STATUS_META } from "../constants/STATUS";
import useWorkspacePath from "../hooks/useWorkspacePath";
import AppSidebarLink from "./AppSidebarLink";
import {
  ADMIN_EXIT_SECTION,
  ADMIN_HOME_PATH,
  ADMIN_NAV_SECTIONS,
  HOME_PATH,
  NAV_SECTIONS,
  visibleNavSections,
} from "./navigation";
import classes from "./AppSidebar.module.css";

const useAuth = () =>
  useLocalStorage({ key: "auth", getInitialValueInEffect: false })[0];

const WorkspaceSwitcher = ({ collapsed, onNavigate }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const toWorkspace = useWorkspacePath();
  const { workspaceId } = useParams();
  const isSuperAdmin = auth?.platformRole === PLATFORM_ROLES.SUPER_ADMIN;
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  // Only a super admin can move between workspaces.
  const { data: workspaces = [] } = useGetAllAdminWorkspacesQuery({
    enabled: isSuperAdmin,
  });

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Menu position="bottom-start" width={232}>
      <Menu.Target>
        <UnstyledButton
          className={classes.workspace}
          aria-label="Switch workspace"
        >
          {workspace ? (
            <WorkspaceAvatar workspace={workspace} size={24} />
          ) : (
            <Logo />
          )}
          {!collapsed && (
            <>
              <div className={classes.workspaceText}>
                {workspace ? (
                  <Text size="sm" fw={600} tt="capitalize" truncate>
                    {workspace.title}
                  </Text>
                ) : (
                  <Skeleton h={12} w={110} my={4} />
                )}
                <Text size="xs" c="dimmed" truncate>
                  {isSuperAdmin
                    ? "Super admin"
                    : roleLabel(auth?.workspaceRole?.toLowerCase())}
                </Text>
              </div>
              <IconSelector size={14} className={classes.muted} />
            </>
          )}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {isSuperAdmin && (
          <>
            <Menu.Label>Workspaces</Menu.Label>
            {workspaces.map((item) => (
              <Menu.Item
                key={item._id}
                tt="capitalize"
                leftSection={<WorkspaceAvatar workspace={item} size={18} />}
                onClick={() => go(`/${item.slug}${HOME_PATH}`)}
                rightSection={
                  item.slug === workspaceId && <IconCheck size={14} />
                }
              >
                {item.title}
              </Menu.Item>
            ))}
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconSettings size={14} />}
          onClick={() => go(toWorkspace("/workspace"))}
        >
          Workspace settings
        </Menu.Item>
        {isSuperAdmin && (
          <Menu.Item
            leftSection={<IconUserPlus size={14} />}
            onClick={() => go(toWorkspace("/users?edit=new"))}
          >
            Invite teammates
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

// The admin console has no workspace — it shows the brand instead of the switcher.
const AdminBrand = ({ collapsed, onNavigate }) => (
  <UnstyledButton
    component={Link}
    to={ADMIN_HOME_PATH}
    className={classes.workspace}
    onClick={onNavigate}
    aria-label="Admin console"
  >
    <Logo />
    {!collapsed && (
      <div className={classes.workspaceText}>
        <Text size="sm" fw={600} truncate>
          Chat Model
        </Text>
        <Text size="xs" c="dimmed" truncate>
          Admin console
        </Text>
      </div>
    )}
  </UnstyledButton>
);

// Admin console (no workspace in the URL) shows the admin nav. Inside a workspace it
// shows the workspace nav, plus a way back for a super admin.
const useNavSections = () => {
  const auth = useAuth();
  const { workspaceId } = useParams();

  if (!workspaceId) return ADMIN_NAV_SECTIONS;

  const isSuperAdmin = auth?.platformRole === PLATFORM_ROLES.SUPER_ADMIN;
  const sections = visibleNavSections(NAV_SECTIONS, isSuperAdmin);

  return isSuperAdmin ? [ADMIN_EXIT_SECTION, ...sections] : sections;
};

const AppSidebar = ({ collapsed = false, onNavigate }) => {
  const { workspaceId } = useParams();
  const user = useCurrentUser();
  const sections = useNavSections();
  const badges = {
    unread: useUnreadConversationCount(),
    live: useLiveVisitorCount(),
  };

  return (
    <div className={classes.root} data-collapsed={collapsed || undefined}>
      {workspaceId ? (
        <WorkspaceSwitcher collapsed={collapsed} onNavigate={onNavigate} />
      ) : (
        <AdminBrand collapsed={collapsed} onNavigate={onNavigate} />
      )}

      <nav className={classes.nav}>
        {sections.map((section) => (
          <div key={section.label} className={classes.section}>
            {!collapsed && (
              <div className={classes.sectionLabel}>{section.label}</div>
            )}
            {section.links.map((link) => (
              <AppSidebarLink
                key={link.path}
                link={link}
                badge={badges[link.badge]}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
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
                  <Text size="sm" fw={500} tt="capitalize" truncate>
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
        </UserMenu>
      </div>
    </div>
  );
};

export default AppSidebar;
