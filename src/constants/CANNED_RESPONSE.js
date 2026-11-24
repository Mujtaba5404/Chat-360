/** Options and helpers for canned responses (`/:slug/canned-responses`). */
const CANNED_RESPONSE = {
  DEFAULTS: {
    title: "",
    shortcut: "",
    category: "general",
    visibility: "shared",
    tags: [],
    content: "",
    isActive: true,
  },
  // Same values the backend accepts.
  CATEGORIES: [
    { value: "general", label: "General" },
    { value: "billing", label: "Billing" },
    { value: "technical", label: "Technical" },
    { value: "onboarding", label: "Onboarding" },
    { value: "sales", label: "Sales" },
  ],
  VISIBILITIES: [
    { value: "shared", label: "Shared with team" },
    { value: "private", label: "Only me" },
  ],
  TITLE_MAX: 80,
  TAG_MAX: 30,
  TAGS_MAX: 10,
  // The backend stores shortcuts as "/name"; this is the part after the slash.
  SHORTCUT_PATTERN: /^[a-z0-9][a-z0-9._-]*$/i,
  // {{variables}} the chat composer fills in when a response is inserted.
  VARIABLES: [
    { key: "customer_name", label: "Customer name", sample: "Marcus" },
    { key: "agent_name", label: "Agent name", sample: "Sarah" },
    { key: "company_name", label: "Company name", sample: "Acme" },
    {
      key: "customer_email",
      label: "Customer email",
      sample: "marcus@northwind.com",
    },
    { key: "ticket_id", label: "Conversation ID", sample: "#4821" },
  ],
  SORTS: [
    { value: "usageCount:desc", label: "Most used" },
    { value: "lastUsedAt:desc", label: "Recently used" },
    { value: "createdAt:desc", label: "Newest" },
    { value: "title:asc", label: "Title A–Z" },
    { value: "shortcut:asc", label: "Shortcut A–Z" },
  ],
};

/** "/greet" → "greet" */
export const shortcutName = (shortcut = "") => shortcut.replace(/^\/+/, "");

/** "Greet " → "/greet" */
export const toShortcut = (name) =>
  `/${shortcutName(name.trim()).toLowerCase()}`;

export const categoryLabel = (value) =>
  CANNED_RESPONSE.CATEGORIES.find((item) => item.value === value)?.label ??
  value;

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/**
 * Tags on a response are plain words agents type. Older responses may still hold
 * Tag records (populated, or as bare ids); a record counts by its title and a bare
 * id is dropped.
 */
export const tagNamesOf = (tags = []) =>
  tags
    .map((tag) => (typeof tag === "string" ? tag : tag?.title))
    .filter((tag) => tag && !OBJECT_ID.test(tag));

/** Trimmed, without blanks or case-insensitive repeats. */
export const cleanTags = (tags) => {
  const seen = new Set();
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/** Id of the user who created a response (populated or not). */
export const creatorIdOf = (response) => response?.user?._id ?? response?.user;

/** Private responses are only for their creator; a super admin sees every one. */
export const isVisibleTo = (response, userId, isSuperAdmin = false) =>
  isSuperAdmin ||
  response.visibility !== "private" ||
  creatorIdOf(response) === userId;

/** A canned response record → form values. */
export const toCannedValues = (response) => {
  const { DEFAULTS } = CANNED_RESPONSE;
  return {
    title: response?.title ?? DEFAULTS.title,
    shortcut: shortcutName(response?.shortcut ?? DEFAULTS.shortcut),
    category: response?.category ?? DEFAULTS.category,
    visibility: response?.visibility ?? DEFAULTS.visibility,
    tags: tagNamesOf(response?.tags ?? DEFAULTS.tags),
    content: response?.content ?? DEFAULTS.content,
    isActive: response?.isActive ?? DEFAULTS.isActive,
  };
};

/**
 * Form values → the body the API expects. An update replaces the whole record,
 * so every field is always sent.
 */
export const toCannedPayload = (values) => ({
  title: values.title.trim(),
  category: values.category,
  visibility: values.visibility,
  tags: cleanTags(values.tags),
  shortcut: toShortcut(values.shortcut),
  content: values.content.trim(),
  isActive: values.isActive,
});

export default CANNED_RESPONSE;
