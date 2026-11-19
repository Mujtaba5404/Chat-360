import {
  ActionIcon,
  Avatar,
  EmptyState,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowsSort,
  IconCheck,
  IconFlag,
  IconInbox,
  IconLayoutSidebarLeftExpand,
  IconLock,
  IconPaperclip,
} from "@tabler/icons-react";
import SearchInput from "../../components/SearchInput";
import UserAvatar from "../../components/UserAvatar";
import useNow from "../../hooks/useNow";
import formatListTime from "../../utils/formatListTime";
import { PRIORITY_META } from "../../constants/STATUS";
import { SORT_OPTIONS } from "./inbox";
import { getLastActivity, getLastMessage } from "../../api/chat";
import classes from "./ConversationList.module.css";

const preview = (message) => {
  if (!message) return "";
  if (message.type === "note") return "Note: " + message.body;
  if (message.type === "event") return message.body;
  const body =
    message.body ||
    (message.attachments?.length
      ? `Sent ${message.attachments.length} attachment(s)`
      : "");
  return message.type === "outgoing" ? `You: ${body}` : body;
};

const ConversationItem = ({
  conversation,
  contact,
  assignee,
  active,
  now,
  onSelect,
}) => {
  const last = getLastMessage(conversation);
  const priority = PRIORITY_META[conversation.priority];
  const unread = conversation.unread > 0;

  return (
    <UnstyledButton
      className={classes.item}
      data-active={active || undefined}
      data-unread={unread || undefined}
      onClick={() => onSelect(conversation.id)}
      aria-current={active ? "true" : undefined}
    >
      <UserAvatar
        name={contact?.name}
        presence={contact?.online ? "online" : undefined}
        size={32}
      />
      <div className={classes.body}>
        <div className={classes.row}>
          <Text size="sm" fw={unread ? 600 : 500} truncate>
            {contact?.name}
          </Text>
          <Text size="xs" c="dimmed" className={classes.time}>
            {formatListTime(getLastActivity(conversation), now)}
          </Text>
        </div>
        <div className={classes.row}>
          <Text
            size="xs"
            c={unread ? undefined : "dimmed"}
            truncate
            className={classes.preview}
          >
            {last?.type === "note" && (
              <IconLock size={11} className={classes.inlineIcon} />
            )}
            {last?.attachments?.length > 0 && (
              <IconPaperclip size={11} className={classes.inlineIcon} />
            )}
            {preview(last)}
          </Text>
          {unread && (
            <span className={classes.unread}>{conversation.unread}</span>
          )}
        </div>
        <div className={classes.meta}>
          {priority && (
            <span
              className={classes.priority}
              style={{ color: `var(--mantine-color-${priority.color}-6)` }}
            >
              <IconFlag size={11} stroke={2.25} />
              {priority.label}
            </span>
          )}
          <span className={classes.channel}>{conversation.channel}</span>
          {assignee ? (
            <Tooltip label={`Assigned to ${assignee.name}`}>
              <Avatar
                name={assignee.name}
                color="initials"
                size={16}
                className={classes.assignee}
              />
            </Tooltip>
          ) : (
            <span className={classes.unassigned}>Unassigned</span>
          )}
        </div>
      </div>
    </UnstyledButton>
  );
};

/** Panel 2: searchable, sortable conversation list. */
const ConversationList = ({
  title,
  conversations,
  contactById,
  userById,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  sort,
  onSortChange,
  onOpenNav,
}) => {
  const now = useNow();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {onOpenNav && (
          <ActionIcon onClick={onOpenNav} aria-label="Show inboxes">
            <IconLayoutSidebarLeftExpand size={16} stroke={1.75} />
          </ActionIcon>
        )}
        <Text fw={600} size="md" truncate>
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {conversations.length}
        </Text>
        <Menu width={170}>
          <Menu.Target>
            <ActionIcon ml="auto" aria-label="Sort conversations">
              <IconArrowsSort size={16} stroke={1.75} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Sort by</Menu.Label>
            {SORT_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onClick={() => onSortChange(option.value)}
                rightSection={sort === option.value && <IconCheck size={14} />}
              >
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
      <div className={classes.search}>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search conversations"
          w="100%"
        />
      </div>
      <div className={classes.list}>
        {conversations.length ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              contact={contactById.get(conversation.contactId)}
              assignee={userById.get(conversation.assigneeId)}
              active={conversation.id === selectedId}
              now={now}
              onSelect={onSelect}
            />
          ))
        ) : (
          <EmptyState
            size="sm"
            icon={<IconInbox size={20} />}
            withIndicatorBackground
            title={query ? "No matches" : "All caught up"}
            description={
              query
                ? "Try a different search."
                : "No conversations in this view."
            }
            className={classes.empty}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationList;
