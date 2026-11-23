import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { SERVER_URL } from "./src/constants/SERVER_URL.js";

// In dev the API is proxied same-origin so the httpOnly auth cookies stay first-party.
// The browser's Origin is dropped (the backend CORS list has no localhost origin), and
// the cookie must be stored for http://localhost, so Secure/SameSite=None/Partitioned/Domain are stripped.
const configureProxy = (proxy) => {
  proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));

  proxy.on("proxyRes", (proxyRes) => {
    const cookies = proxyRes.headers["set-cookie"];
    if (!cookies) return;

    proxyRes.headers["set-cookie"] = cookies.map((cookie) =>
      cookie
        .replace(/;\s*secure/gi, "")
        .replace(/;\s*partitioned/gi, "")
        .replace(/;\s*domain=[^;]*/gi, "")
        .replace(/;\s*samesite=none/gi, "; SameSite=Lax"),
    );
  });
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    proxy: {
      "/api": {
        target: SERVER_URL,
        changeOrigin: true,
        configure: configureProxy,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache independently of app code changes.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            { name: "mantine", test: /node_modules[\\/]@mantine[\\/]/ },
          ],
        },
      },
    },
  },
});
