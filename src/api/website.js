import { createCollection } from "../libs/store";
import { websites } from "../mocks/websites";

export const websitesStore = createCollection(websites, "site");

/**
 * Simulates the installation check the backend performs by fetching the domain
 * and looking for the widget script. Resolves to the new verification status.
 */
export const verifyWebsite = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const site = websitesStore.getItem(id);
      const verified = Boolean(site?.activeWidgetId);
      websitesStore.update(id, {
        verification: verified ? "verified" : "failed",
        connection: verified ? "connected" : "disconnected",
        lastActivityAt: verified
          ? new Date().toISOString()
          : (site?.lastActivityAt ?? null),
      });
      resolve(verified ? "verified" : "failed");
    }, 1400);
  });
};
