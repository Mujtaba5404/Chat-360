import { useMemo } from "react";
import { createCollection } from "./index";
import { cannedResponses } from "../mocks/cannedResponses";

export const cannedStore = createCollection(cannedResponses, "cr");

/** Shared responses plus the agent's own private ones. */
export const useAvailableResponses = (userId) => {
  const items = cannedStore.useItems();
  return useMemo(
    () =>
      items.filter(
        (item) => item.visibility === "public" || item.ownerId === userId,
      ),
    [items, userId],
  );
};

export const recordUsage = (id) => {
  const item = cannedStore.getItem(id);
  if (item)
    cannedStore.update(id, {
      usageCount: item.usageCount + 1,
      lastUsedAt: new Date().toISOString(),
    });
};
