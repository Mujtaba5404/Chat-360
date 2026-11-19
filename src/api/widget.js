import { createCollection } from "./index";
import { widgets } from "../mocks/widgets";
import { websitesStore } from "./website";

export const widgetsStore = createCollection(widgets, "w");

/*
 * Widget ↔ website rules. A widget belongs to exactly one website; a website
 * serves at most one widget at a time (`website.activeWidgetId`).
 */

/** Creates a widget; the first widget on a website becomes its active one. */
export const createWidget = (data) => {
  const record = widgetsStore.add({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  const site = websitesStore.getItem(record.websiteId);
  const activated = Boolean(site && !site.activeWidgetId);
  if (activated) websitesStore.update(site.id, { activeWidgetId: record.id });
  return { record, activated };
};

/** Makes the widget the one its website shows, replacing the previous active widget. */
export const setActiveWidget = (widget) => {
  websitesStore.update(widget.websiteId, { activeWidgetId: widget.id });
};

/** Deleting the active widget turns chat off on that website until another is activated. */
export const deleteWidget = (widget) => {
  widgetsStore.remove(widget.id);
  const site = websitesStore.getItem(widget.websiteId);
  if (site?.activeWidgetId === widget.id)
    websitesStore.update(site.id, {
      activeWidgetId: null,
      connection: "disconnected",
    });
};

/** Removes a website together with its widgets (they can't exist without it). */
export const removeWebsite = (websiteId) => {
  widgetsStore.setState((items) =>
    items.filter((widget) => widget.websiteId !== websiteId),
  );
  websitesStore.remove(websiteId);
};
