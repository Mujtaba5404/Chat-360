import { Box, Group, Menu, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconLogout, IconSettings, IconUserCircle } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import useIsSuperAdmin from "../hooks/useIsSuperAdmin";
import useWorkspacePath from "../hooks/useWorkspacePath";
import { useLogoutMutation } from "src/api/auth";
import { useCurrentUser } from "src/api/user";
import ThemeSwitcher from "./ThemeSwitcher";
import UserAvatar from "./UserAvatar";

const UserMenu = ({ children, position = "bottom-end", onNavigate }) => {
  const [, , removeAuth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const user = useCurrentUser();
  const navigate = useNavigate();
  const toWorkspace = useWorkspacePath();
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const isSuperAdmin = useIsSuperAdmin();
  const logoutMutation = useLogoutMutation();

  const go = (path) => {
    navigate(toWorkspace(path));
    onNavigate?.();
  };

  // The server clears the httpOnly auth cookies; end the local session even if the request fails
  const logOut = () => {
    onNavigate?.();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        removeAuth();
        queryClient.clear();
      },
    });
  };

  return (
    <Menu position={position} width={256}>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Group gap="sm" p="sm" wrap="nowrap">
          <UserAvatar name={user.name} size={32} />
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {user.email}
            </Text>
          </div>
        </Group>
        <Menu.Divider />
        <Menu.Label>Theme</Menu.Label>
        <Box px="xs" pb="xs">
          <ThemeSwitcher fullWidth />
        </Box>
        {/* Profile and settings live inside a workspace; the admin console has neither. */}
        {workspaceId && (
          <>
            <Menu.Divider />
            {/* The profile opens on the Users page, which only a super admin has. */}
            {isSuperAdmin && (
              <Menu.Item
                leftSection={<IconUserCircle size={14} />}
                onClick={() => go(`/users?view=${user.id}`)}
              >
                My profile
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => go("/workspace")}
            >
              Workspace settings
            </Menu.Item>
          </>
        )}
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={logOut}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
export default UserMenu;
