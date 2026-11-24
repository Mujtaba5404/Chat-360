import { semantic } from "./TOKENS";

/** Every status the product displays, mapped to a label and semantic color. */
export const STATUS_META = {
  // Agent presence
  online: { label: "Online", color: semantic.success },
  away: { label: "Away", color: semantic.warning },
  offline: { label: "Offline", color: semantic.neutral },
  // Account, widget
  active: { label: "Active", color: semantic.success },
  inactive: { label: "Inactive", color: semantic.neutral },
  invited: { label: "Invited", color: semantic.info },
  suspended: { label: "Suspended", color: semantic.warning },
  blocked: { label: "Blocked", color: semantic.danger },
  archived: { label: "Archived", color: semantic.neutral },
  // Conversation
  open: { label: "Open", color: semantic.brand },
  pending: { label: "Pending", color: semantic.warning },
  resolved: { label: "Resolved", color: semantic.success },
  // Website
  verified: { label: "Verified", color: semantic.success },
  unverified: { label: "Unverified", color: semantic.neutral },
  failed: { label: "Failed", color: semantic.danger },
  connected: { label: "Connected", color: semantic.success },
  disconnected: { label: "Disconnected", color: semantic.neutral },
  // Visitor
  live: { label: "Live", color: semantic.success },
  idle: { label: "Idle", color: semantic.warning },
  left: { label: "Left", color: semantic.neutral },
  // Visibility
  public: { label: "Shared", color: semantic.info },
  private: { label: "Private", color: semantic.neutral },
};

export const PRIORITY_META = {
  urgent: { label: "Urgent", color: semantic.danger },
  high: { label: "High", color: "orange" },
  medium: { label: "Medium", color: semantic.warning },
  low: { label: "Low", color: semantic.neutral },
};

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

export const statusColor = (status) =>
  STATUS_META[status]?.color ?? semantic.neutral;
