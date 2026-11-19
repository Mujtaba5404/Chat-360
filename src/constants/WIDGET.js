import { defaultPrechatFields } from "../mocks/widgets";

const WIDGET = {
  DEFAULTS: {
    websiteId: null,
    name: "",
    color: "#5E5AE6",
    position: "right",
    theme: "light",
    language: "en",
    companyName: "",
    welcomeTitle: "Hi there 👋",
    welcomeMessage: "Ask us anything — we usually reply in a few minutes.",
    replyTime: "minutes",
    launcherStyle: "icon",
    launcherText: "Chat with us",
    launcherIcon: "message",
    showAgentAvatars: true,
    showBranding: true,
    prechatEnabled: false,
    prechatFields: defaultPrechatFields,
  },
  REPLY_TIMES: [
    { value: "minutes", label: "In a few minutes" },
    { value: "hours", label: "In a few hours" },
    { value: "day", label: "Within a day" },
  ],
};

export default WIDGET;
