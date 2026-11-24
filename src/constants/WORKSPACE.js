import COLORS from "./COLORS";
import { SERVER_URL } from "./SERVER_URL";

const supported = (key, fallback) => {
  try {
    return Intl.supportedValuesOf(key);
  } catch {
    return fallback;
  }
};

const languageName = new Intl.DisplayNames(["en"], { type: "language" });
const currencyName = new Intl.DisplayNames(["en"], { type: "currency" });

const LOCALE_CODES = [
  "en-US",
  "en-GB",
  "ar-SA",
  "de-DE",
  "es-ES",
  "fr-FR",
  "hi-IN",
  "it-IT",
  "ja-JP",
  "nl-NL",
  "pt-BR",
  "tr-TR",
  "ur-PK",
  "zh-CN",
];

/** Options and defaults for a workspace record (`/:slug`, `admin/workspaces`). */
const WORKSPACE = {
  DEFAULTS: {
    title: "",
    description: "",
    email: "",
    website: "",
    industry: null,
    companySize: null,
    status: "active",
    // A workspace without a color of its own uses the app's violet theme.
    color: COLORS.VIOLET,
    timezone: "UTC",
    currency: "USD",
    locale: "en-US",
    allowedIPs: [],
  },
  // The statuses the backend accepts for a workspace.
  STATUSES: [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "archived", label: "Archived" },
  ],
  // Same values the backend accepts ("finiancial_services" is its spelling).
  INDUSTRIES: [
    { value: "software", label: "Software" },
    { value: "e_commerce", label: "E-commerce" },
    { value: "finiancial_services", label: "Financial services" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "other", label: "Other" },
  ],
  COMPANY_SIZES: [
    { value: "1-10", label: "1–10 people" },
    { value: "11-50", label: "11–50 people" },
    { value: "51-200", label: "51–200 people" },
    { value: "201-1000", label: "201–1,000 people" },
    { value: "1000+", label: "1,000+ people" },
  ],
  IMAGE_TYPES: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  IMAGE_MAX_BYTES: 2 * 1024 * 1024,
  TIMEZONES: ["UTC", ...supported("timeZone", []).filter((z) => z !== "UTC")],
  CURRENCIES: supported("currency", ["USD", "EUR", "GBP", "PKR"]).map(
    (code) => ({ value: code, label: `${code} · ${currencyName.of(code)}` }),
  ),
  LOCALES: LOCALE_CODES.map((code) => ({
    value: code,
    label: `${languageName.of(code)} (${code})`,
  })),
};

/** The workspace's theme color; violet when it has none (or an unknown one). */
export const workspaceColor = (workspace) =>
  Object.values(COLORS).includes(workspace?.settings?.color)
    ? workspace.settings.color
    : WORKSPACE.DEFAULTS.color;

/**
 * Where the workspace's image is served. The backend stores its path on disk
 * ("public\uploads\workspace\x.png"), which it serves under the same path.
 */
export const workspaceImagePath = (workspace) => {
  const path = workspace?.image?.filePath;
  return path ? path.replace(/\\/g, "/").replace(/^\/+/, "") : null;
};

export const workspaceImageUrl = (workspace) => {
  const path = workspaceImagePath(workspace);
  return path ? `${SERVER_URL}${path}` : null;
};

export const industryLabel = (value) =>
  WORKSPACE.INDUSTRIES.find((item) => item.value === value)?.label ?? value;

/** A workspace record → flat form values. `image` holds a newly picked file. */
export const toWorkspaceValues = (workspace) => {
  const { DEFAULTS } = WORKSPACE;
  const settings = workspace?.settings ?? {};
  return {
    title: workspace?.title ?? DEFAULTS.title,
    description: workspace?.description ?? DEFAULTS.description,
    email: workspace?.email ?? DEFAULTS.email,
    website: workspace?.website ?? DEFAULTS.website,
    industry: workspace?.industry ?? DEFAULTS.industry,
    companySize: workspace?.companySize ?? DEFAULTS.companySize,
    status: workspace?.status ?? DEFAULTS.status,
    color: workspace ? workspaceColor(workspace) : DEFAULTS.color,
    timezone: settings.timezone ?? DEFAULTS.timezone,
    currency: settings.currency ?? DEFAULTS.currency,
    locale: settings.locale ?? DEFAULTS.locale,
    allowedIPs: settings.allowedIPs ?? DEFAULTS.allowedIPs,
    image: null,
  };
};

/**
 * Flat form values → the fields the workspace APIs expect. Empty optional fields
 * are left out (the backend rejects "" for email, website and the enums), so
 * clearing one keeps its saved value.
 */
export const toWorkspacePayload = (values, workspace) => {
  const optional = (value) => {
    const text = typeof value === "string" ? value.trim() : value;
    return text ? text : undefined;
  };
  return {
    title: values.title.trim(),
    description: optional(values.description),
    email: optional(values.email),
    website: optional(values.website),
    industry: optional(values.industry),
    companySize: optional(values.companySize),
    status: values.status,
    agents: (workspace?.agents ?? []).map((agent) => agent?._id ?? agent),
    settings: {
      color: values.color,
      timezone: values.timezone,
      currency: values.currency,
      locale: values.locale,
      allowedIPs: values.allowedIPs,
    },
  };
};

export default WORKSPACE;
