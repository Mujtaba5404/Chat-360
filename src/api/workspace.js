import { upperFirst } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import { createStore } from "../libs/store";
import { rolePermissions, teams, workspaceSettings } from "../mocks/workspace";
import api from ".";
import { toWorkspaceFormData } from "./workspaceFormData";

// GET /:slug — one workspace's own record (title, description, settings, owner).
export const useGetWorkspaceQuery = (slug, options = {}) => {
  return useQuery({
    queryKey: ["workspace", slug],
    queryFn: () => api.get(slug).then(({ data }) => data),
    enabled: !!slug,
    ...options,
  });
};

// PATCH /:slug (multipart) — a workspace user updates the workspace they are in.
// `payload` from toWorkspacePayload, `image` a newly picked file, `workspace` the saved record.
export const useUpdateWorkspaceMutation = (slug) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, image, workspace }) =>
      api.patch(slug, await toWorkspaceFormData(payload, { image, workspace })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      showNotification({
        title: upperFirst("workspace successfully updated"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(
          error.response?.data?.message || error.message || "error",
        ),
        type: "error",
      }),
  });
};

/** Workspace configuration that has no API yet (teams, roles, hours, notifications, security). */
export const workspaceStore = createStore({
  settings: workspaceSettings,
  teams,
  rolePermissions,
});

export const useWorkspaceSettings = (section) =>
  workspaceStore.useStore((state) => state.settings[section]);
export const useTeams = () => workspaceStore.useStore((state) => state.teams);
export const useRolePermissions = () =>
  workspaceStore.useStore((state) => state.rolePermissions);

export const saveSettings = (section, values) => {
  workspaceStore.setState((state) => ({
    ...state,
    settings: {
      ...state.settings,
      [section]: { ...state.settings[section], ...values },
    },
  }));
};

export const updateTeamMembers = (teamId, memberIds) => {
  workspaceStore.setState((state) => ({
    ...state,
    teams: state.teams.map((team) =>
      team.id === teamId ? { ...team, memberIds } : team,
    ),
  }));
};

export const saveRolePermissions = (rolePermissions) =>
  workspaceStore.setState((state) => ({ ...state, rolePermissions }));

export const revokeSession = (sessionId) => {
  saveSettings("security", {
    sessions: workspaceStore
      .getState()
      .settings.security.sessions.filter((s) => s.id !== sessionId),
  });
};
