import { ActionIcon, Button, Group, Menu, ScrollArea, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconDots,
  IconFlag,
  IconLayoutSidebarRight,
  IconLink,
  IconMail,
  IconRefresh,
  IconUserCircle,
  IconUserOff,
} from '@tabler/icons-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import UserAvatar from '../../../components/ui/UserAvatar';
import { PRIORITY_META, PRIORITY_OPTIONS } from '../../../lib/status';
import { assignConversation, markConversationUnread, setConversationPriority, setConversationStatus } from '../store';
import classes from './ConversationHeader.module.css';

export default function ConversationHeader({ conversation, contact, assignee, agents, currentUser, onBack, contextOpen, onToggleContext }) {
  const priority = PRIORITY_META[conversation.priority];
  const resolved = conversation.status === 'resolved';
  const actor = currentUser.name;

  const assign = (agent) => {
    assignConversation(conversation.id, agent, actor);
    notifications.show({ message: agent ? `Assigned to ${agent.name}` : 'Conversation unassigned' });
  };

  const changeStatus = (status) => {
    setConversationStatus(conversation.id, status, actor);
    notifications.show({ message: status === 'resolved' ? 'Conversation resolved' : `Marked as ${status}` });
  };

  // Leave the conversation first, otherwise opening it would immediately mark it read again.
  const markUnread = () => {
    onBack();
    markConversationUnread(conversation.id);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/chat/${conversation.id}`);
    notifications.show({ message: 'Conversation link copied' });
  };

  return (
    <header className={classes.header}>
      <ActionIcon className={classes.back} onClick={onBack} aria-label="Back to conversations">
        <IconArrowLeft size={16} />
      </ActionIcon>

      <UserAvatar name={contact.name} presence={contact.online ? 'online' : 'offline'} size={32} />
      <div className={classes.identity}>
        <Group gap={6} wrap="nowrap">
          <Text fw={600} size="sm" truncate>
            {contact.name}
          </Text>
          <StatusBadge status={conversation.status} className={classes.status} />
        </Group>
        <Text size="xs" c="dimmed" truncate>
          {contact.online ? `Online · ${contact.currentPage ?? 'browsing'}` : 'Offline'} · {conversation.channel}
        </Text>
      </div>

      <Group gap={6} wrap="nowrap" className={classes.actions}>
        <Menu width={240} position="bottom-end">
          <Menu.Target>
            <Button
              variant="default"
              size="xs"
              leftSection={assignee ? <UserAvatar name={assignee.name} size={18} /> : <IconUserCircle size={14} />}
              rightSection={<IconChevronDown size={12} />}
              aria-label={assignee ? `Assigned to ${assignee.name}` : 'Assign conversation'}
              className={classes.secondary}
            >
              <span className={classes.label}>{assignee ? assignee.name.split(' ')[0] : 'Assign'}</span>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Assign to</Menu.Label>
            <ScrollArea.Autosize mah={260}>
              {agents.map((agent) => (
                <Menu.Item
                  key={agent.id}
                  leftSection={<UserAvatar name={agent.name} presence={agent.presence} size={20} />}
                  rightSection={agent.id === conversation.assigneeId && <IconCheck size={14} />}
                  onClick={() => assign(agent)}
                >
                  {agent.name}
                  {agent.id === currentUser.id && ' (you)'}
                </Menu.Item>
              ))}
            </ScrollArea.Autosize>
            {assignee && (
              <>
                <Menu.Divider />
                <Menu.Item leftSection={<IconUserOff size={14} />} onClick={() => assign(null)}>
                  Unassign
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>

        <Menu width={160} position="bottom-end">
          <Menu.Target>
            <Tooltip label={priority ? `${priority.label} priority` : 'Set priority'}>
              <ActionIcon
                size="lg"
                variant="default"
                aria-label="Priority"
                className={classes.secondary}
                style={priority && { color: `var(--mantine-color-${priority.color}-6)` }}
              >
                <IconFlag size={16} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Priority</Menu.Label>
            {PRIORITY_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                leftSection={<IconFlag size={14} color={`var(--mantine-color-${PRIORITY_META[option.value].color}-6)`} />}
                rightSection={conversation.priority === option.value && <IconCheck size={14} />}
                onClick={() => setConversationPriority(conversation.id, option.value)}
              >
                {option.label}
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item disabled={!conversation.priority} onClick={() => setConversationPriority(conversation.id, null)}>
              No priority
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Button.Group>
          <Button
            size="xs"
            variant={resolved ? 'default' : 'filled'}
            color={resolved ? undefined : 'green'}
            leftSection={resolved ? <IconRefresh size={14} /> : <IconCircleCheck size={14} />}
            onClick={() => changeStatus(resolved ? 'open' : 'resolved')}
            aria-label={resolved ? 'Reopen conversation' : 'Resolve conversation'}
          >
            <span className={classes.label}>{resolved ? 'Reopen' : 'Resolve'}</span>
          </Button>
          <Menu width={180} position="bottom-end">
            <Menu.Target>
              <Button size="xs" px={6} variant={resolved ? 'default' : 'filled'} color={resolved ? undefined : 'green'} aria-label="More status options">
                <IconChevronDown size={14} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconClock size={14} />} disabled={conversation.status === 'pending'} onClick={() => changeStatus('pending')}>
                Mark as pending
              </Menu.Item>
              <Menu.Item leftSection={<IconRefresh size={14} />} disabled={conversation.status === 'open'} onClick={() => changeStatus('open')}>
                Mark as open
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Button.Group>

        <Menu width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon size="lg" aria-label="More actions">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconMail size={14} />} onClick={markUnread}>
              Mark as unread
            </Menu.Item>
            <Menu.Item leftSection={<IconLink size={14} />} onClick={copyLink}>
              Copy link
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Tooltip label={contextOpen ? 'Hide details' : 'Show details'}>
          <ActionIcon size="lg" onClick={onToggleContext} aria-label="Toggle customer details" aria-pressed={contextOpen} variant={contextOpen ? 'light' : 'subtle'}>
            <IconLayoutSidebarRight size={16} stroke={1.75} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </header>
  );
}
