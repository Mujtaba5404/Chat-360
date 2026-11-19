import { createCollection } from "./index";
import { users } from "../mocks/users";

export const usersStore = createCollection(users, "u");

/** Active agents that can be assigned conversations. */
export const useAssignableAgents = () => {
  const users = usersStore.useItems();
  return users.filter(
    (user) => user.status === "active" && user.role !== "viewer",
  );
};
