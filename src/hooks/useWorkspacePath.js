import { useCallback } from "react";
import { useLocation, useParams } from "react-router";

/** Prefixes an app path with the workspace in the URL: "/chat" → "/:workspaceId/chat". */
const useWorkspacePath = () => {
  const { workspaceId } = useParams();

  return useCallback(
    (path) => (workspaceId ? `/${workspaceId}${path}` : path),
    [workspaceId],
  );
};

/** The current pathname without the "/:workspaceId" prefix. */
export const useAppPathname = () => {
  const { workspaceId } = useParams();
  const { pathname } = useLocation();

  return workspaceId ? pathname.slice(workspaceId.length + 1) || "/" : pathname;
};

export default useWorkspacePath;
