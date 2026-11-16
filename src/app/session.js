import { usersStore } from '../features/users/store';
import { createStore } from '../lib/store';
import { notifications } from '../mocks/workspace';

/**
 * Signed-in agent session: identity, presence and personal notifications.
 * `signIn` / `signOut` are the seam for a real auth API; the session id is kept in
 * localStorage ("Remember me") or sessionStorage (this tab only).
 */
const STORAGE_KEY = 'cm-session';

/** Demo credential — any active member's email works with this password. */
export const DEMO_PASSWORD = 'chatmodel';

function readStoredUserId() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).userId : null;
  } catch {
    return null;
  }
}

function persist(userId, remember) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (userId) (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify({ userId }));
  } catch {
    // Storage unavailable (private mode) — the session simply lasts until reload.
  }
}

export const sessionStore = createStore({ userId: readStoredUserId(), notifications });

export const isAuthenticated = () => {
  const { userId } = sessionStore.getState();
  return Boolean(userId && usersStore.getItem(userId)?.status === 'active');
};

const LOGIN_ERRORS = {
  invalid: 'Incorrect email or password.',
  inactive: 'This account has been deactivated. Contact your workspace admin.',
  invited: 'This account has a pending invitation. Accept it from your email first.',
};

/** Resolves with the user, or rejects with a user-facing message. */
export function signIn({ email, password, remember }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = usersStore.getState().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || password !== DEMO_PASSWORD) return reject(new Error(LOGIN_ERRORS.invalid));
      if (user.status !== 'active') return reject(new Error(LOGIN_ERRORS[user.status]));

      usersStore.update(user.id, { presence: 'online', lastActiveAt: new Date().toISOString() });
      persist(user.id, remember);
      sessionStore.setState((state) => ({ ...state, userId: user.id }));
      resolve(user);
    }, 600);
  });
}

export function signOut() {
  const { userId } = sessionStore.getState();
  if (userId) usersStore.update(userId, { presence: 'offline', lastActiveAt: new Date().toISOString() });
  persist(null);
  sessionStore.setState((state) => ({ ...state, userId: null }));
}

export const useCurrentUser = () => {
  const userId = sessionStore.useStore((state) => state.userId);
  return usersStore.useItem(userId);
};

export const useNotifications = () => sessionStore.useStore((state) => state.notifications);

export const markNotificationRead = (id) =>
  sessionStore.setState((state) => ({
    ...state,
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  }));

export const markAllNotificationsRead = () =>
  sessionStore.setState((state) => ({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  }));
