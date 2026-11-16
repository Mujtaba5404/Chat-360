import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';
import { useCurrentUser } from '../../app/session';
import { startConversationWithVisitor } from '../chat/store';
import { visitorName, visitorsStore } from './store';

/** Opens the visitor's active conversation, or starts a new one assigned to the current agent. */
export function useStartConversation() {
  const navigate = useNavigate();
  const agent = useCurrentUser();

  return (visitor) => {
    const { conversationId, contactId } = startConversationWithVisitor(visitor, agent);
    if (visitor.contactId !== contactId) {
      visitorsStore.update(visitor.id, {
        contactId,
        events: [{ label: `${agent.name} started a conversation`, at: new Date().toISOString() }, ...visitor.events],
      });
      notifications.show({ message: `Conversation started with ${visitorName(visitor)}` });
    }
    navigate(`/chat/${conversationId}`);
  };
}
