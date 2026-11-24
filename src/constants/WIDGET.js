// The locales the widget API accepts for `settings.locale`.
const LOCALE_CODES = [
  "en-US",
  "en-GB",
  "en-AU",
  "en-CA",
  "en-IN",
  "en-PK",
  "fr-FR",
  "fr-CA",
  "de-DE",
  "de-AT",
  "de-CH",
  "es-ES",
  "es-MX",
  "es-AR",
  "pt-PT",
  "pt-BR",
  "it-IT",
  "nl-NL",
  "nl-BE",
  "ar-SA",
  "ar-AE",
  "ar-EG",
  "ur-PK",
  "hi-IN",
  "bn-BD",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "zh-HK",
  "ru-RU",
  "tr-TR",
  "th-TH",
  "vi-VN",
  "id-ID",
  "ms-MY",
  "fil-PH",
  "pl-PL",
  "sv-SE",
  "da-DK",
  "nb-NO",
  "fi-FI",
  "el-GR",
  "he-IL",
  "uk-UA",
];
const localeName = new Intl.DisplayNames(["en"], { type: "language" });

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const pad = (value) => String(value).padStart(2, "0");

/** Minutes after midnight → "09:30". */
export const formatMinutes = (minutes) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

// Pre-chat fields the editor offers; the backend accepts only these keys and stores
// only the shown ones.
const PRECHAT_FIELDS = [
  { key: "title", label: "Your Name", required: true },
  { key: "email", label: "Email Address", required: true },
  { key: "phone", label: "Phone Number", required: false },
  { key: "message", label: "How can we help?", required: false },
];

/** Options and defaults for a widget record (`/:slug/widgets`). */
const WIDGET = {
  // Same shape as `settings` in the API. Optional URLs are "" here and null in the API.
  SETTINGS: {
    style: {
      primaryColor: "#5E5AE6",
      launcherColor: "#5E5AE6",
      textColor: "#FFFFFF",
      position: "bottom_right",
      offsetX: 20,
      offsetY: 20,
    },
    message: {
      welcome: "Welcome! How can we help you today?",
      offline: "We are currently offline. Leave us a message.",
    },
    header: {
      logo: "",
      avatar: "",
      title: "Support",
      subtitle: "We are here to help",
    },
    launcher: {
      textEnabled: true,
      text: "Chat with us",
      icon: "message-circle",
    },
    preChatForm: { enabled: false },
    businessHours: {
      enabled: false,
      timezone: "UTC",
      days: Object.fromEntries(
        DAY_KEYS.map((key) => [
          key,
          { enabled: !["sat", "sun"].includes(key), from: 540, to: 1080 },
        ]),
      ),
    },
    branding: {
      showBranding: true,
      logo: "",
      text: "Powered by Chat360",
      url: "",
    },
    locale: "en-US",
    soundNotification: true,
    showTypingIndicator: true,
    showAgentAvailability: true,
    fileUploadEnabled: true,
    showQuickReplies: false,
  },
  POSITIONS: [
    { value: "bottom_left", label: "Bottom left" },
    { value: "bottom_right", label: "Bottom right" },
  ],
  LAUNCHER_ICONS: [
    { value: "message-circle", label: "Chat bubble" },
    { value: "message", label: "Message" },
    { value: "help-circle", label: "Help" },
  ],
  LOCALES: LOCALE_CODES.map((code) => ({
    value: code,
    label: `${localeName.of(code)} (${code})`,
  })),
  DAYS: DAY_KEYS.map((key) => ({ key, label: DAY_LABELS[key] })),
  // Every half hour, as minutes after midnight (the backend's unit).
  TIMES: Array.from({ length: 48 }, (_, index) => ({
    value: String(index * 30),
    label: formatMinutes(index * 30),
  })),
  PRECHAT_FIELDS,
};

/** Accepts "#RRGGBB" in any case. */
export const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value ?? "");

export const isUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** The website a widget belongs to: populated record or bare id → id. */
export const widgetWebsiteId = (widget) =>
  widget?.website?._id ?? widget?.website ?? null;

/**
 * Keeps only the keys `defaults` has, taking saved values where present (null → the
 * default, so optional URLs become ""). The API rejects unknown keys, so anything else
 * the backend returns is dropped here.
 */
const pickShape = (defaults, saved) =>
  Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      fallback && typeof fallback === "object" && !Array.isArray(fallback)
        ? pickShape(fallback, saved?.[key])
        : (saved?.[key] ?? fallback),
    ]),
  );

/** A widget record → form values: the API's `settings` shape plus the pre-chat list. */
export const toWidgetValues = (widget, websiteId = null) => {
  const settings = pickShape(WIDGET.SETTINGS, widget?.settings);
  const fields = widget?.settings?.preChatForm?.fields ?? [];

  return {
    website: widgetWebsiteId(widget) ?? websiteId,
    title: widget?.title ?? "",
    isActive: widget?.isActive ?? true,
    settings: {
      ...settings,
      style: {
        ...settings.style,
        // Colors come back as saved; normalised so the color inputs show "#2563EB".
        primaryColor: settings.style.primaryColor.toUpperCase(),
        launcherColor: settings.style.launcherColor.toUpperCase(),
        textColor: settings.style.textColor.toUpperCase(),
        position: settings.style.position.toLowerCase(),
      },
      preChatForm: { enabled: Boolean(settings.preChatForm.enabled) },
    },
    // A field is shown when it's saved; a new widget starts with the required ones.
    prechatFields: PRECHAT_FIELDS.map((field) => {
      const match = fields.find((item) => item.key === field.key);
      return match
        ? {
            key: field.key,
            label: match.label,
            required: match.required,
            enabled: true,
          }
        : { ...field, enabled: !widget && field.required };
    }),
  };
};

/** Form values → the body the widget APIs expect. Empty optional URLs go as null. */
export const toWidgetPayload = (values) => {
  const { settings } = values;
  const text = (value) => value.trim();
  const optional = (value) => value?.trim() || null;

  return {
    title: text(values.title),
    isActive: values.isActive,
    settings: {
      ...settings,
      message: {
        welcome: text(settings.message.welcome),
        offline: text(settings.message.offline),
      },
      header: {
        logo: optional(settings.header.logo),
        avatar: optional(settings.header.avatar),
        title: text(settings.header.title),
        subtitle: text(settings.header.subtitle),
      },
      launcher: {
        ...settings.launcher,
        // Required by the backend even for an icon-only launcher.
        text: text(settings.launcher.text) || WIDGET.SETTINGS.launcher.text,
      },
      preChatForm: {
        enabled: settings.preChatForm.enabled,
        fields: values.prechatFields
          .filter((field) => field.enabled)
          .map(({ key, label, required }) => ({
            key,
            label: label.trim(),
            required,
          })),
      },
      branding: {
        showBranding: settings.branding.showBranding,
        logo: optional(settings.branding.logo),
        // Kept filled even while branding is hidden.
        text: text(settings.branding.text) || WIDGET.SETTINGS.branding.text,
        url: optional(settings.branding.url),
      },
    },
  };
};

export default WIDGET;
