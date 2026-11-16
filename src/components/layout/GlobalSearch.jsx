import { Spotlight } from '@mantine/spotlight';
import { IconBolt, IconMessageChatbot, IconSearch, IconUserPlus, IconWorldWww } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { NAV_ITEMS } from '../../app/navigation';
import { getLastMessage, useContacts, useConversations } from '../../features/chat/store';
import { usersStore } from '../../features/users/store';
import UserAvatar from '../ui/UserAvatar';

const QUICK_ACTIONS = [
  { id: 'new-user', label: 'Invite user', path: '/users?edit=new', icon: IconUserPlus },
  { id: 'new-canned', label: 'New canned response', path: '/canned-responses?edit=new', icon: IconBolt },
  { id: 'new-widget', label: 'Create widget', path: '/widgets/new', icon: IconMessageChatbot },
  { id: 'new-website', label: 'Add website', path: '/website?edit=new', icon: IconWorldWww },
];

/** ⌘K command palette: pages, quick actions, conversations and teammates. */
export default function GlobalSearch() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const contacts = useContacts();
  const users = usersStore.useItems();

  const actions = useMemo(() => {
    const icon = (Icon) => <Icon size={16} stroke={1.75} />;
    const contactById = new Map(contacts.map((c) => [c.id, c]));

    return [
      {
        group: 'Pages',
        actions: NAV_ITEMS.map((item) => ({
          id: `page-${item.path}`,
          label: item.label,
          description: item.description,
          leftSection: icon(item.icon),
          onClick: () => navigate(item.path),
        })),
      },
      {
        group: 'Quick actions',
        actions: QUICK_ACTIONS.map((item) => ({
          id: item.id,
          label: item.label,
          leftSection: icon(item.icon),
          onClick: () => navigate(item.path),
        })),
      },
      {
        group: 'Conversations',
        actions: conversations
          .filter((c) => c.status !== 'resolved')
          .map((c) => {
            const contact = contactById.get(c.contactId);
            return {
              id: `conversation-${c.id}`,
              label: contact?.name ?? 'Unknown contact',
              description: getLastMessage(c)?.body,
              leftSection: <UserAvatar name={contact?.name} size={24} />,
              onClick: () => navigate(`/chat/${c.id}`),
            };
          }),
      },
      {
        group: 'Teammates',
        actions: users.map((user) => ({
          id: `user-${user.id}`,
          label: user.name,
          description: user.email,
          leftSection: <UserAvatar name={user.name} size={24} />,
          onClick: () => navigate(`/users?view=${user.id}`),
        })),
      },
    ];
  }, [contacts, conversations, users, navigate]);

  return (
    <Spotlight
      actions={actions}
      limit={10}
      shortcut={['mod + K']}
      highlightQuery
      nothingFound="No results"
      scrollable
      maxHeight={420}
      radius="md"
      searchProps={{ leftSection: <IconSearch size={16} stroke={1.75} />, placeholder: 'Search pages, conversations, people…' }}
    />
  );
}
