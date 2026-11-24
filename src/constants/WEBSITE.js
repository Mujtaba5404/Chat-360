/** Options and defaults for a website record (`/:slug/websites`). */
const WEBSITE = {
  DEFAULTS: {
    title: "",
    domain: "",
    allowedDomains: [],
    status: "active",
    enforceOriginCheck: true,
    collectVisitorLocation: true,
  },
  // The statuses the backend accepts.
  STATUSES: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "Inactive" },
  ],
  VERIFICATION_STATUSES: [
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
    { value: "failed", label: "Failed" },
  ],
};

/** "makeaboxes.com" or "http://x.com/path" → "https://makeaboxes.com" (origin only). */
export const toOrigin = (value) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return url.origin;
  } catch {
    return trimmed;
  }
};

/** "https://www.makeaboxes.com" → "www.makeaboxes.com" for display. */
export const displayDomain = (value = "") =>
  value.replace(/^https?:\/\//i, "").replace(/\/$/, "");

/** A website record → flat form values. */
export const toWebsiteValues = (website) => ({
  title: website?.title ?? WEBSITE.DEFAULTS.title,
  domain: website?.domain ?? WEBSITE.DEFAULTS.domain,
  allowedDomains: website?.allowedDomains ?? WEBSITE.DEFAULTS.allowedDomains,
  status: website?.status ?? WEBSITE.DEFAULTS.status,
  enforceOriginCheck:
    website?.settings?.enforceOriginCheck ??
    WEBSITE.DEFAULTS.enforceOriginCheck,
  collectVisitorLocation:
    website?.settings?.collectVisitorLocation ??
    WEBSITE.DEFAULTS.collectVisitorLocation,
});

/** Flat form values → the body the websites API expects. */
export const toWebsitePayload = (values, website) => ({
  title: values.title.trim(),
  domain: toOrigin(values.domain),
  allowedDomains: [
    ...new Set(values.allowedDomains.map(toOrigin).filter(Boolean)),
  ],
  status: values.status,
  settings: {
    ...website?.settings,
    enforceOriginCheck: values.enforceOriginCheck,
    collectVisitorLocation: values.collectVisitorLocation,
  },
  metadata: website?.metadata ?? {},
});

export default WEBSITE;
