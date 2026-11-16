import { createCollection } from '../../lib/store';
import { visitors } from '../../mocks/visitors';

export const visitorsStore = createCollection(visitors, 'v');

export const useLiveVisitorCount = () =>
  visitorsStore.useStore((items) => items.filter((visitor) => visitor.status === 'live').length);

/** Derived fields used for filtering and display. */
export const visitorKind = (visitor) => (visitor.contactId || visitor.email ? 'identified' : 'anonymous');
export const visitorName = (visitor) => visitor.name ?? `Visitor ${visitor.id.replace(/\D/g, '').padStart(4, '0')}`;

const PAGE_POOL = [
  { path: '/pricing', title: 'Pricing' },
  { path: '/features/inbox', title: 'Shared inbox' },
  { path: '/integrations', title: 'Integrations' },
  { path: '/customers', title: 'Customer stories' },
  { path: '/docs/quickstart', title: 'Quickstart' },
  { path: '/blog/support-metrics', title: '12 support metrics that matter' },
  { path: '/security', title: 'Security & compliance' },
];

/**
 * Simulates the realtime feed (page views from live visitors) until a websocket
 * subscription is available. Returns a cleanup function.
 */
export function subscribeToVisitorActivity(interval = 7000) {
  let tick = 0;
  const timer = setInterval(() => {
    const live = visitorsStore.getState().filter((visitor) => visitor.status === 'live');
    if (!live.length) return;
    const visitor = live[tick % live.length];
    const page = PAGE_POOL[(tick * 3 + visitor.visits) % PAGE_POOL.length];
    tick += 1;
    if (visitor.pages[0]?.path === page.path) return;
    const at = new Date().toISOString();
    visitorsStore.update(visitor.id, { lastSeenAt: at, pages: [{ ...page, at }, ...visitor.pages] });
  }, interval);
  return () => clearInterval(timer);
}
