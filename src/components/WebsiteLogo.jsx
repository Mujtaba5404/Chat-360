import { ThemeIcon } from "@mantine/core";
import { IconWorld } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./WebsiteLogo.module.css";

// The site's favicon, like a link preview in a chat app. Google's service answers
// even for sites without an icon: it sends a 16px placeholder (no load error), so
// anything that small counts as "no logo" and the globe stays.
const FAVICON_SIZE = 64;
const PLACEHOLDER_MAX = 16;

const hostOf = (domain = "") => {
  try {
    const value = domain.trim();
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
      .hostname;
  } catch {
    return "";
  }
};

const Logo = ({ host, size }) => {
  const [status, setStatus] = useState("loading");
  const ready = status === "ready";

  return (
    <ThemeIcon
      variant="default"
      size={size}
      radius="sm"
      className={classes.tile}
      data-logo={ready || undefined}
    >
      {!ready && <IconWorld size={Math.round(size / 2)} stroke={1.75} />}
      {status !== "missing" && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${FAVICON_SIZE}`}
          alt=""
          className={classes.image}
          data-ready={ready || undefined}
          style={{ width: Math.round(size * 0.6) }}
          onLoad={(event) =>
            setStatus(
              event.currentTarget.naturalWidth > PLACEHOLDER_MAX
                ? "ready"
                : "missing",
            )
          }
          onError={() => setStatus("missing")}
        />
      )}
    </ThemeIcon>
  );
};

/** A website's logo (favicon), or a globe when the site has none. */
const WebsiteLogo = ({ domain, size = 28 }) => {
  const host = hostOf(domain);

  if (!host)
    return (
      <ThemeIcon variant="default" size={size} radius="sm">
        <IconWorld size={Math.round(size / 2)} stroke={1.75} />
      </ThemeIcon>
    );

  // Keyed by host so a different website starts loading from scratch.
  return <Logo key={host} host={host} size={size} />;
};

export default WebsiteLogo;
