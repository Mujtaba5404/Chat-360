import { useLocalStorage } from "@mantine/hooks";
import { createCollection } from "../libs/store";
import { users } from "../mocks/users";

/** Shapes the logged-in account (from auth/login) like the workspace users the mock data uses. */
const fromAuth = (auth) => ({
  id: auth.id,
  name: auth.name,
  email: auth.email,
  role: auth.workspaceRole?.toLowerCase() ?? "agent",
  team: null,
  title: "",
  status: auth.isActive === false ? "inactive" : "active",
  presence: "online",
  phone: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  lastActiveAt: new Date().toISOString(),
  createdAt: auth.createdAt,
  stats: { conversations: 0, avgResponse: 0, csat: 0 },
});

const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("auth"));
  } catch {
    return null;
  }
};

const storedAuth = readAuth();

export const usersStore = createCollection(
  storedAuth?.id ? [fromAuth(storedAuth), ...users] : users,
  "u",
);

/** Adds (or refreshes) the logged-in account in the users list. */
export const upsertAuthUser = (auth) =>
  usersStore.setState((items) => [
    fromAuth(auth),
    ...items.filter((user) => user.id !== auth.id),
  ]);

export const useCurrentUser = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const user = usersStore.useItem(auth?.id);
  return user ?? (auth?.id ? fromAuth(auth) : undefined);
};

/** Active agents that can be assigned conversations. */
export const useAssignableAgents = () => {
  const users = usersStore.useItems();
  return users.filter(
    (user) => user.status === "active" && user.role !== "viewer",
  );
};
