// Backend permissions are "<Resource>:<ACTION>", e.g. "Conversation:READ".

export const PERMISSION_ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE"];

export const PERMISSION_RESOURCES = [
  { value: "Conversation", label: "Conversations" },
  { value: "Message", label: "Messages" },
  { value: "Visitor", label: "Visitors" },
  { value: "CannedResponse", label: "Canned responses" },
  { value: "Attachment", label: "Attachments" },
  { value: "Tag", label: "Tags" },
  { value: "Widget", label: "Widgets" },
  { value: "Website", label: "Websites" },
  { value: "User", label: "Users" },
  { value: "Role", label: "Roles" },
  { value: "Picklist", label: "Picklists" },
  { value: "AuditLog", label: "Audit logs" },
  { value: "Workspace", label: "Workspace" },
];

export const permissionKey = (resource, action) => `${resource}:${action}`;

const PERMISSIONS = PERMISSION_RESOURCES.flatMap(({ value }) =>
  PERMISSION_ACTIONS.map((action) => permissionKey(value, action)),
);

export default PERMISSIONS;
