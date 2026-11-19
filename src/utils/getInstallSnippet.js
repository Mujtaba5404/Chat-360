// Embed code for a website. It identifies the site, not a widget: the loader
// serves whichever widget is active, so switching widgets never needs a reinstall.
const getInstallSnippet = (websiteId, platform = "html") => {
  if (platform === "react") {
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
};

export default getInstallSnippet;
