import {
  IconBolt,
  IconBuilding,
  IconMessageChatbot,
  IconMessages,
  IconRadar2,
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

export const HOME_PATH = "/chat";

export const findNavLink = (pathname, links = ALL_NAV_LINKS) =>
  links
    .filter(
      (link) => pathname === link.path || pathname.startsWith(`${link.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
