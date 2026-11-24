import { Button, Center, EmptyState } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconBuildingOff } from "@tabler/icons-react";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { setActiveWorkspace } from "src/api";
import PLATFORM_ROLES from "src/constants/PLATFORM_ROLES";
import { useAppPathname } from "src/hooks/useWorkspacePath";

// The token lives in an httpOnly cookie (JS can't read it), so only the login data is checked here.
// If the session expires the API returns 401 and the api interceptor sends the user to login.
const Authenticated = () => {
  const [auth, , removeAuth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const { workspaceId } = useParams();
  const appPathname = useAppPathname();
  const location = useLocation();

  if (!auth?.id) {
    const next = encodeURIComponent(location.pathname + location.search);

    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const isSuperAdmin = auth.platformRole === PLATFORM_ROLES.SUPER_ADMIN;

  // The login response's slug is the user's workspace.
  const userWorkspace = auth.slug;

  if (!isSuperAdmin && !userWorkspace) {
    return (
      <Center h="100dvh" p="lg">
        <EmptyState
          size="sm"
          withIndicatorBackground
          icon={<IconBuildingOff size={20} />}
          title="Workspace not found"
          description="Your account signed in, but no workspace came back with it. Please try again later or contact support."
        >
          <Button variant="default" mt="md" onClick={removeAuth}>
            Back to login
          </Button>
        </EmptyState>
      </Center>
    );
  }

  // A super admin moves freely between the admin console (no workspaceId) and any
  // workspace they open. Everyone else is pinned to their own workspace.
  if (!isSuperAdmin && userWorkspace !== workspaceId) {
    const rest =
      appPathname.startsWith("/admin") || appPathname === "/"
        ? ""
        : appPathname;

    return (
      <Navigate to={`/${userWorkspace}${rest}${location.search}`} replace />
    );
  }

  // Set during render so every request below this point targets this workspace.
  setActiveWorkspace(workspaceId);

  return <Outlet />;
};

export default Authenticated;
