import { showNotification } from "../../notifications/showNotification";
import { useNavigate } from "react-router";
import useWorkspacePath from "../../hooks/useWorkspacePath";
import { useCurrentUser } from "../../api/user";
import { startConversationWithVisitor } from "../../api/chat";
import { visitorName, visitorsStore } from "../../api/visitor";

/** Opens the visitor's active conversation, or starts a new one assigned to the current agent. */
const useStartConversation = () => {
  const navigate = useNavigate();
  const toWorkspace = useWorkspacePath();
  const agent = useCurrentUser();

  return (visitor) => {
    const { conversationId, contactId } = startConversationWithVisitor(
      visitor,
      agent,
    );
    if (visitor.contactId !== contactId) {
      visitorsStore.update(visitor.id, {
        contactId,
        events: [
          {
            label: `${agent.name} started a conversation`,
            at: new Date().toISOString(),
          },
          ...visitor.events,
        ],
      });
      showNotification({
        message: `Conversation started with ${visitorName(visitor)}`,
      });
    }
    navigate(toWorkspace(`/chat/${conversationId}`));
  };
};

export default useStartConversation;
