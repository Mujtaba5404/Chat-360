import { IconCircleCheck, IconCircleDashed, IconClock, IconFlame, IconInbox, IconUserCircle, IconUserQuestion } from '@tabler/icons-react';
import { getLastActivity, getLastMessage } from './store';

export const INBOX_VIEWS = [
  { id: 'all', label: 'All conversations', icon: IconInbox },
  { id: 'mine', label: 'My conversations', icon: IconUserCircle },
  { id: 'unassigned', label: 'Unassigned', icon: IconUserQuestion },
  { id: 'priority', label: 'Priority', icon: IconFlame },
];

export const STATUS_VIEWS = [
  { id: 'open', label: 'Open', icon: IconCircleDashed },
  { id: 'pending', label: 'Pending', icon: IconClock },
  { id: 'resolved', label: 'Resolved', icon: IconCircleCheck },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
];

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

/** `inbox` is a view id or `team:<teamId>`. */
export function matchesInbox(conversation, inbox, userId) {
  switch (inbox) {
    case 'all':
      return true;
    case 'mine':
      return conversation.assigneeId === userId;
    case 'unassigned':
      return !conversation.assigneeId;
    case 'priority':
      return conversation.priority === 'urgent' || conversation.priority === 'high';
    default:
      return conversation.team === inbox.replace('team:', '');
  }
}

export function matchesQuery(conversation, contact, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [contact?.name, contact?.email, contact?.company, getLastMessage(conversation)?.body]
    .some((value) => value?.toLowerCase().includes(q));
}

export function sortConversations(conversations, sort) {
  const byActivity = (a, b) => getLastActivity(b).localeCompare(getLastActivity(a));
  const sorted = [...conversations];
  if (sort === 'oldest') return sorted.sort((a, b) => -byActivity(a, b));
  if (sort === 'priority') {
    return sorted.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || byActivity(a, b));
  }
  return sorted.sort(byActivity);
}
