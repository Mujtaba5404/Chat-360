import { createCollection } from '../../lib/store';
import { websites } from '../../mocks/websites';

export const websitesStore = createCollection(websites, 'site');

/**
 * Simulates the installation check the backend performs by fetching the domain
 * and looking for the widget script. Resolves to the new verification status.
 */
export function verifyWebsite(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const site = websitesStore.getItem(id);
      const verified = Boolean(site?.activeWidgetId);
      websitesStore.update(id, {
        verification: verified ? 'verified' : 'failed',
        connection: verified ? 'connected' : 'disconnected',
        lastActivityAt: verified ? new Date().toISOString() : site?.lastActivityAt ?? null,
      });
      resolve(verified ? 'verified' : 'failed');
    }, 1400);
  });
}

/**
 * Embed code for a website. It identifies the site, not a widget: the loader
 * (the product's public CDN script) serves whichever widget is active, so
 * switching widgets never requires reinstalling.
 */
export function getInstallSnippet(websiteId, platform = 'html') {
  if (platform === 'react') {
    return `// app/layout.jsx (or your root component)
import Script from 'next/script';

<Script id="chat-model" strategy="afterInteractive">
  {\`window.ChatModel = { websiteId: "${websiteId}" };\`}
</Script>
<Script src="https://widget.chatmodel.app/v1/loader.js" strategy="afterInteractive" />`;
  }
  return `<!-- Chat Model widget -->
<script>
  window.ChatModel = { websiteId: "${websiteId}" };
</script>
<script src="https://widget.chatmodel.app/v1/loader.js" async></script>`;
}
