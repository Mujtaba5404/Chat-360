import axios from "axios";
import { SERVER_URL } from "src/constants/SERVER_URL";

const api = axios.create({
  // In dev, requests go through the Vite proxy (vite.config.js) so auth cookies stay same-origin
  baseURL: import.meta.env.DEV ? "/api/v1" : `${SERVER_URL}api/v1`,
  withCredentials: true, // sends the httpOnly auth cookies
});

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
