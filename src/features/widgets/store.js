import { createCollection } from '../../lib/store';
import { defaultPrechatFields, widgets } from '../../mocks/widgets';
import { websitesStore } from '../website/store';

export const widgetsStore = createCollection(widgets, 'w');

export const NEW_WIDGET = {
  websiteId: null,
  name: '',
  color: '#5E5AE6',
  position: 'right',
  theme: 'light',
  language: 'en',
  companyName: '',
  welcomeTitle: 'Hi there 👋',
  welcomeMessage: 'Ask us anything — we usually reply in a few minutes.',
  replyTime: 'minutes',
  launcherStyle: 'icon',
  launcherText: 'Chat with us',
  launcherIcon: 'message',
  showAgentAvatars: true,
  showBranding: true,
  prechatEnabled: false,
  prechatFields: defaultPrechatFields,
};

export const REPLY_TIMES = [
  { value: 'minutes', label: 'In a few minutes' },
  { value: 'hours', label: 'In a few hours' },
  { value: 'day', label: 'Within a day' },
];

/*
 * Widget ↔ website rules. A widget belongs to exactly one website; a website
 * serves at most one widget at a time (`website.activeWidgetId`).
 */

/** Creates a widget; the first widget on a website becomes its active one. */
export function createWidget(data) {
  const record = widgetsStore.add({ ...data, updatedAt: new Date().toISOString() });
  const site = websitesStore.getItem(record.websiteId);
  const activated = Boolean(site && !site.activeWidgetId);
  if (activated) websitesStore.update(site.id, { activeWidgetId: record.id });
  return { record, activated };
}

/** Makes the widget the one its website shows, replacing the previous active widget. */
export function setActiveWidget(widget) {
  websitesStore.update(widget.websiteId, { activeWidgetId: widget.id });
}

/** Deleting the active widget turns chat off on that website until another is activated. */
export function deleteWidget(widget) {
  widgetsStore.remove(widget.id);
  const site = websitesStore.getItem(widget.websiteId);
  if (site?.activeWidgetId === widget.id) websitesStore.update(site.id, { activeWidgetId: null, connection: 'disconnected' });
}

/** Removes a website together with its widgets (they can't exist without it). */
export function removeWebsite(websiteId) {
  widgetsStore.setState((items) => items.filter((widget) => widget.websiteId !== websiteId));
  websitesStore.remove(websiteId);
}

/** Black or white, whichever reads better on the given hex background. */
export function readableTextColor(hex) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#FFFFFF';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#111113' : '#FFFFFF';
}
