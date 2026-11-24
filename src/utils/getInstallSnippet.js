// Embed code for one widget, identified by its public key. The secret key never
// belongs in a page.
const getInstallSnippet = (publicKey, platform = "html") => {
  if (platform === "react") {
    return `// app/layout.jsx (or your root component)
import Script from 'next/script';

<Script id="chat-model" strategy="afterInteractive">
  {\`window.ChatModel = { key: "${publicKey}" };\`}
</Script>
<Script src="https://widget.chatmodel.app/v1/loader.js" strategy="afterInteractive" />`;
  }

  return `<!-- Chat Model widget -->
<script>
  window.ChatModel = { key: "${publicKey}" };
</script>
<script src="https://widget.chatmodel.app/v1/loader.js" async></script>`;
};

export default getInstallSnippet;
