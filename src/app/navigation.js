import {
  IconBolt,
  IconBuilding,
  IconMessageChatbot,
  IconMessages,
  IconRadar2,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';

/** Primary navigation — consumed by the sidebar, global search and breadcrumbs. */
export const NAV_SECTIONS = [
  {
    label: 'Inbox',
    items: [
      { path: '/chat', label: 'Chat', icon: IconMessages, badge: 'unread', description: 'Conversations inbox' },
      { path: '/visitors', label: 'Visitors', icon: IconRadar2, badge: 'live', description: 'Real-time website visitors' },
    ],
  },
  {
    label: 'Configure',
    items: [
      { path: '/widgets', label: 'Widgets', icon: IconMessageChatbot, description: 'Chat widget appearance & behavior' },
      { path: '/website', label: 'Website', icon: IconWorld, description: 'Connected domains & installation' },
      { path: '/canned-responses', label: 'Canned Responses', icon: IconBolt, description: 'Saved replies & shortcuts' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { path: '/users', label: 'Users', icon: IconUsers, description: 'Agents, roles & access' },
      { path: '/workspace', label: 'Workspace', icon: IconBuilding, description: 'Workspace settings' },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
