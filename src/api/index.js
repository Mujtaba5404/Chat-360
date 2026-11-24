import axios from "axios";
import { SERVER_URL } from "src/constants/SERVER_URL";

const api = axios.create({
  // In dev, requests go through the Vite proxy (vite.config.js) so auth cookies stay same-origin
  baseURL: import.meta.env.DEV ? "/api/v1" : `${SERVER_URL}api/v1`,
  withCredentials: true, // sends the httpOnly auth cookies
});

// The workspace in the current URL (/:workspaceId/...). Authenticated sets it before any
// page renders, so a super admin's requests follow the workspace they opened instead of
// their own login slug.
let activeWorkspace;

export const setActiveWorkspace = (slug) => {
  activeWorkspace = slug || undefined;
};

export const getActiveWorkspace = () => activeWorkspace;

const storedSlug = () => {
  try {
    return JSON.parse(localStorage.getItem("auth"))?.slug;
  } catch {
    return undefined;
  }
};

/** Prefixes a workspace-scoped route with the active workspace slug: `${slug}/${path}`. */
export const workspaceUrl = (path = "") => {
  const slug = activeWorkspace ?? storedSlug();

  return slug ? `${slug}/${path}` : path;
};

const isSuperAdmin = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth"))?.platformRole === "SUPER_ADMIN"
    );
  } catch {
    return false;
  }
};

/**
 * A workspace resource route. A super admin reaches any workspace through
 * `admin/:slug/...`; a workspace user through `:slug/...`.
 */
export const resourceUrl = (path = "") =>
  isSuperAdmin() ? `admin/${workspaceUrl(path)}` : workspaceUrl(path);

// No Authorization header needed — the backend reads the token from the cookie
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const isAuthRequest = /^\/?auth\//.test(error.config?.url || "");

      if (error.response.status === 401 && !isAuthRequest) {
        // Session expired/invalid — clear auth and send the user to login
        localStorage.removeItem("auth");
        if (window.location.pathname !== "/login")
          window.location.href = "/login";
      }

      error.message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      error.message = "No response received from the server";
    } else {
      error.message = "Unexpected error occurred while making the request";
    }

    return Promise.reject(error);
  },
);

export default api;
