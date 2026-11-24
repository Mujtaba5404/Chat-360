import {
  IconArrowBackUp,
  IconBolt,
  IconBuilding,
  IconBuildingCommunity,
  IconMessageChatbot,
  IconMessages,
  IconRadar2,
  IconTag,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";

// `badge` names a live count the sidebar shows next to the link.
export const NAV_SECTIONS = [
  {
    label: "Inbox",
    links: [
      {
        title: "Chat",
        path: "/chat",
        icon: IconMessages,
        badge: "unread",
        description: "Conversations inbox",
      },
      {
        title: "Visitors",
        path: "/visitors",
        icon: IconRadar2,
        badge: "live",
        description: "Real-time website visitors",
      },
    ],
  },
  {
    label: "Configure",
    links: [
      {
        title: "Widgets",
        path: "/widgets",
        icon: IconMessageChatbot,
        description: "Chat widget appearance & behavior",
      },
      {
        title: "Website",
        path: "/website",
        icon: IconWorld,
        description: "Connected domains & installation",
      },
      {
        title: "Canned Responses",
        path: "/canned-responses",
        icon: IconBolt,
        description: "Saved replies & shortcuts",
      },
      {
        title: "Tags",
        path: "/tags",
        icon: IconTag,
        description: "Labels for grouping conversations",
      },
    ],
  },
  {
    label: "Manage",
    links: [
      {
        title: "Users",
        path: "/users",
        icon: IconUsers,
        description: "Agents, roles & access",
        superAdminOnly: true,
      },
      {
        title: "Workspace",
        path: "/workspace",
        icon: IconBuilding,
        description: "Workspace settings",
      },
    ],
  },
];

export const ALL_NAV_LINKS = NAV_SECTIONS.flatMap((section) => section.links);

// `superAdminOnly` links (e.g. Users) are hidden from workspace users.
export const visibleNavSections = (sections, isSuperAdmin) =>
  sections
    .map((section) => ({
      ...section,
      links: section.links.filter(
        (link) => isSuperAdmin || !link.superAdminOnly,
      ),
    }))
    .filter((section) => section.links.length);

export const visibleNavLinks = (isSuperAdmin) =>
  visibleNavSections(NAV_SECTIONS, isSuperAdmin).flatMap(
    (section) => section.links,
  );

// Workspace paths are relative to "/:workspaceId".
export const HOME_PATH = "/chat";

export const ADMIN_HOME_PATH = "/admin/workspaces";

// Super admin console. Paths are absolute: they never sit under a workspace.
export const ADMIN_NAV_SECTIONS = [
  {
    label: "Admin",
    links: [
      {
        title: "Workspaces",
        path: "/admin/workspaces",
        icon: IconBuildingCommunity,
        description: "Every workspace on the platform",
        absolute: true,
      },
      {
        title: "Users",
        path: "/admin/users",
        icon: IconUsers,
        description: "Every user on the platform",
        absolute: true,
      },
    ],
  },
];

export const ADMIN_NAV_LINKS = ADMIN_NAV_SECTIONS.flatMap(
  (section) => section.links,
);

// Shown above the workspace nav while a super admin is inside a workspace.
export const ADMIN_EXIT_SECTION = {
  label: "Admin",
  links: [
    {
      title: "All workspaces",
      path: "/admin/workspaces",
      icon: IconArrowBackUp,
      description: "Leave this workspace and go back to the admin console",
      absolute: true,
    },
  ],
};

export const findNavLink = (pathname, links = ALL_NAV_LINKS) =>
  links
    .filter(
      (link) => pathname === link.path || pathname.startsWith(`${link.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
