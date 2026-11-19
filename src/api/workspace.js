import { createStore } from "./index";
import {
  rolePermissions,
  teams,
  workspaceSettings,
  workspaces,
} from "../mocks/workspace";

/** Workspace configuration. `saveSettings` is the seam for a future PATCH /workspace call. */
export const workspaceStore = createStore({
  currentId: workspaces[0].id,
  workspaces,
  settings: workspaceSettings,
  teams,
  rolePermissions,
});

export const useCurrentWorkspace = () =>
  workspaceStore.useStore((state) =>
    state.workspaces.find((w) => w.id === state.currentId),
  );
export const useWorkspaces = () =>
  workspaceStore.useStore((state) => state.workspaces);
export const useWorkspaceSettings = (section) =>
  workspaceStore.useStore((state) => state.settings[section]);
export const useTeams = () => workspaceStore.useStore((state) => state.teams);
export const useRolePermissions = () =>
  workspaceStore.useStore((state) => state.rolePermissions);

export const switchWorkspace = (currentId) =>
  workspaceStore.setState((state) => ({ ...state, currentId }));

export const saveSettings = (section, values) => {
  workspaceStore.setState((state) => ({
    ...state,
    settings: {
      ...state.settings,
      [section]: { ...state.settings[section], ...values },
    },
    workspaces:
      section === "general" && values.name
        ? state.workspaces.map((w) =>
            w.id === state.currentId ? { ...w, name: values.name } : w,
          )
        : state.workspaces,
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
