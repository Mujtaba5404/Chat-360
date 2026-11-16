import { daysAgo, hoursAgo, minutesAgo } from './time';

/** `activeWidgetId` is the one widget (of the site's widgets) visitors see; null = chat off. */
export const websites = [
  { id: 'site_1', name: 'Acme marketing site', domain: 'acme.io', activeWidgetId: 'w_main', platform: 'html', verification: 'verified', connection: 'connected', lastActivityAt: minutesAgo(1), createdAt: daysAgo(380), monthlyVisitors: 48210 },
  { id: 'site_2', name: 'Acme app', domain: 'app.acme.io', activeWidgetId: 'w_app', platform: 'react', verification: 'verified', connection: 'connected', lastActivityAt: minutesAgo(4), createdAt: daysAgo(300), monthlyVisitors: 21890 },
  { id: 'site_3', name: 'Developer docs', domain: 'docs.acme.io', activeWidgetId: 'w_docs', platform: 'react', verification: 'verified', connection: 'connected', lastActivityAt: minutesAgo(12), createdAt: daysAgo(210), monthlyVisitors: 15402 },
  { id: 'site_4', name: 'Acme Store', domain: 'shop.acme.io', activeWidgetId: 'w_shop', platform: 'shopify', verification: 'verified', connection: 'connected', lastActivityAt: hoursAgo(1), createdAt: daysAgo(96), monthlyVisitors: 9640 },
  { id: 'site_5', name: 'Help center', domain: 'help.acme.io', activeWidgetId: 'w_help', platform: 'wordpress', verification: 'pending', connection: 'disconnected', lastActivityAt: null, createdAt: daysAgo(2), monthlyVisitors: 0 },
  { id: 'site_6', name: 'Beta landing page', domain: 'beta.acme.io', activeWidgetId: null, platform: 'html', verification: 'failed', connection: 'disconnected', lastActivityAt: daysAgo(12), createdAt: daysAgo(30), monthlyVisitors: 310 },
];

export const platforms = [
  { value: 'html', label: 'HTML / Any website' },
  { value: 'react', label: 'React / Next.js' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'shopify', label: 'Shopify' },
];
