import { createId, createStore } from '../../lib/store';
import { contacts, conversations } from '../../mocks/conversations';
import { visitorName } from '../visitors/store';

/**
 * Conversations + contacts. Each action maps to a future API call; message delivery
 * receipts are simulated locally until a realtime backend is connected.
 */
export const chatStore = createStore({ conversations, contacts });

export const useConversations = () => chatStore.useStore((state) => state.conversations);
export const useConversation = (id) => chatStore.useStore((state) => state.conversations.find((c) => c.id === id));
export const useContacts = () => chatStore.useStore((state) => state.contacts);
export const useContact = (id) => chatStore.useStore((state) => state.contacts.find((c) => c.id === id));
export const useUnreadConversationCount = () =>
  chatStore.useStore((state) => state.conversations.filter((c) => c.unread > 0 && c.status !== 'resolved').length);

const now = () => new Date().toISOString();

const updateConversation = (id, updater) =>
  chatStore.setState((state) => ({
    ...state,
    conversations: state.conversations.map((c) => (c.id === id ? updater(c) : c)),
  }));

const appendMessages = (id, ...messages) =>
  updateConversation(id, (c) => ({ ...c, messages: [...c.messages, ...messages] }));

const eventMessage = (body) => ({ id: createId('m'), type: 'event', body, createdAt: now() });

/** Latest non-event message — used for list previews and sorting. */
export const getLastMessage = (conversation) =>
  conversation.messages.findLast((m) => m.type !== 'event') ?? conversation.messages.at(-1);

export const getLastActivity = (conversation) => conversation.messages.at(-1)?.createdAt;

export function sendMessage(conversationId, { body, note, authorId, attachments = [] }) {
  const message = {
    id: createId('m'),
    type: note ? 'note' : 'outgoing',
    body,
    authorId,
    attachments,
    createdAt: now(),
    ...(note ? {} : { status: 'sent' }),
  };
  updateConversation(conversationId, (c) => ({ ...c, unread: 0, messages: [...c.messages, message] }));

  if (!note) {
    setTimeout(() => {
      updateConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === message.id ? { ...m, status: 'delivered' } : m)),
      }));
    }, 1200);
  }
}

const STATUS_EVENTS = { resolved: 'resolved', open: 'reopened', pending: 'marked as pending' };

export function setConversationStatus(conversationId, status, actorName) {
  updateConversation(conversationId, (c) => ({ ...c, status, unread: status === 'resolved' ? 0 : c.unread }));
  appendMessages(conversationId, eventMessage(`${actorName} ${STATUS_EVENTS[status]} this conversation`));
}

export function assignConversation(conversationId, assignee, actorName) {
  updateConversation(conversationId, (c) => ({ ...c, assigneeId: assignee?.id ?? null }));
  appendMessages(
    conversationId,
    eventMessage(assignee ? `${actorName} assigned this conversation to ${assignee.name}` : `${actorName} unassigned this conversation`),
  );
}

/** Called when an agent is removed from the workspace. */
export const unassignAgentConversations = (agentId) =>
  chatStore.setState((state) => ({
    ...state,
    conversations: state.conversations.map((c) => (c.assigneeId === agentId ? { ...c, assigneeId: null } : c)),
  }));

export const setConversationPriority =(conversationId, priority) =>
  updateConversation(conversationId, (c) => ({ ...c, priority }));

export const markConversationRead = (conversationId) =>
  updateConversation(conversationId, (c) => (c.unread ? { ...c, unread: 0 } : c));

export const markConversationUnread = (conversationId) =>
  updateConversation(conversationId, (c) => ({ ...c, unread: Math.max(1, c.unread) }));

/** Opens (or reuses) a conversation for a website visitor. Returns `{ conversationId, contactId }`. */
export function startConversationWithVisitor(visitor, agent) {
  const { conversations: existing } = chatStore.getState();
  const active = visitor.contactId && existing.find((c) => c.contactId === visitor.contactId && c.status !== 'resolved');
  if (active) return { conversationId: active.id, contactId: visitor.contactId };

  let contactId = visitor.contactId;
  if (!contactId) {
    contactId = createId('ct');
    const contact = {
      id: contactId,
      name: visitorName(visitor),
      email: visitor.email ?? '',
      phone: '',
      company: '',
      city: visitor.city,
      country: visitor.country,
      countryCode: visitor.countryCode,
      timezone: '',
      browser: visitor.browser,
      os: visitor.os,
      device: visitor.device,
      ip: visitor.ip,
      online: visitor.status !== 'left',
      currentPage: visitor.pages[0]?.path ?? null,
      attributes: { Visits: String(visitor.visits), Referrer: visitor.referrer },
      notes: [],
    };
    chatStore.setState((state) => ({ ...state, contacts: [contact, ...state.contacts] }));
  }

  const conversation = {
    id: createId('c'),
    contactId,
    status: 'open',
    priority: null,
    assigneeId: agent.id,
    team: 'support',
    unread: 0,
    channel: visitor.website,
    tags: [],
    messages: [eventMessage(`${agent.name} started this conversation from Visitors`)],
  };
  chatStore.setState((state) => ({ ...state, conversations: [conversation, ...state.conversations] }));
  return { conversationId: conversation.id, contactId };
}

/** Finds the active (unresolved) conversation for a contact, if any. */
export const useActiveConversationId = (contactId) =>
  chatStore.useStore((state) =>
    contactId ? state.conversations.find((c) => c.contactId === contactId && c.status !== 'resolved')?.id : undefined,
  );
