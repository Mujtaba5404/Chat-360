import { createStore } from "../libs/store";
import { notifications } from "../mocks/workspace";

export const notificationsStore = createStore(notifications);

export const useNotifications = () => notificationsStore.useStore();

export const markNotificationRead = (id) =>
  notificationsStore.setState((items) =>
    items.map((n) => (n.id === id ? { ...n, read: true } : n)),
  );

export const markAllNotificationsRead = () =>
  notificationsStore.setState((items) =>
    items.map((n) => ({ ...n, read: true })),
  );
