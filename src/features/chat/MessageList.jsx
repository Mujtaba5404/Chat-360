import { Text, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconChecks,
  IconFileText,
  IconLock,
  IconPhoto,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import UserAvatar from "../../components/UserAvatar";
import formatDateTime from "../../utils/formatDateTime";
import formatBytes from "../../utils/formatBytes";
import formatTime from "../../utils/formatTime";
import classes from "./MessageList.module.css";

const GROUP_WINDOW_MS = 5 * 60_000;
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

const dayLabel = (date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return dayFormat.format(date);
};

const DELIVERY = {
  sent: { icon: IconCheck, label: "Sent" },
  delivered: { icon: IconChecks, label: "Delivered" },
  read: { icon: IconChecks, label: "Seen" },
};

const Attachments = ({ items }) => {
  return (
    <div className={classes.attachments}>
      {items.map((file) => {
        const Icon = file.type === "image" ? IconPhoto : IconFileText;
        return (
          <div key={file.name} className={classes.attachment}>
            <Icon size={16} stroke={1.75} />
            <div className={classes.attachmentText}>
              <Text size="xs" fw={500} truncate>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatBytes(file.size, 1)}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const withMentions = (text) =>
  text.split(/(@\w+)/g).map((part, index) =>
    index % 2 ? (
      <strong key={index} className={classes.mention}>
        {part}
      </strong>
    ) : (
      part
    ),
  );

/** Builds render rows: day separators + messages flagged with grouping info. */
const buildRows = (messages) => {
  const rows = [];
  let lastDay = null;
  messages.forEach((message, index) => {
    const date = new Date(message.createdAt);
    const day = date.toDateString();
    if (day !== lastDay) {
      rows.push({ kind: "day", id: `day-${day}`, label: dayLabel(date) });
      lastDay = day;
    }
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const sameSender = (a, b) =>
      a &&
      b &&
      a.type === b.type &&
      a.authorId === b.authorId &&
      Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) < GROUP_WINDOW_MS;
    rows.push({
      kind: "message",
      id: message.id,
      message,
      first:
        !sameSender(prev, message) ||
        new Date(prev.createdAt).toDateString() !== day,
      last: !sameSender(message, next),
    });
  });
  return rows;
};

const MessageList = ({ messages, contact, userById }) => {
  const scrollRef = useRef(null);

  // Keep the newest message in view when messages are added.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      className={classes.scroll}
      role="log"
      aria-label={`Conversation with ${contact.name}`}
    >
      <div className={classes.thread}>
        {buildRows(messages).map((row) => {
          if (row.kind === "day") {
            return (
              <div key={row.id} className={classes.day}>
                <span>{row.label}</span>
              </div>
            );
          }

          const { message, first, last } = row;

          if (message.type === "event") {
            return (
              <div key={row.id} className={classes.event}>
                {message.body} · {formatTime(message.createdAt)}
              </div>
            );
          }

          if (message.type === "note") {
            const author = userById.get(message.authorId);
            return (
              <div
                key={row.id}
                className={classes.note}
                data-first={first || undefined}
              >
                <div className={classes.noteHeader}>
                  <IconLock size={12} />
                  Private note · {author?.name ?? "Agent"} ·{" "}
                  {formatTime(message.createdAt)}
                </div>
                <div className={classes.text}>{withMentions(message.body)}</div>
                {message.attachments?.length > 0 && (
                  <Attachments items={message.attachments} />
                )}
              </div>
            );
          }

          const outgoing = message.type === "outgoing";
          const author = outgoing ? userById.get(message.authorId) : contact;
          const delivery = DELIVERY[message.status];

          return (
            <div
              key={row.id}
              className={classes.message}
              data-outgoing={outgoing || undefined}
              data-first={first || undefined}
            >
              <div className={classes.avatarSlot}>
                {last && <UserAvatar name={author?.name} size={28} />}
              </div>
              <div className={classes.content}>
                {first && (
                  <Text size="xs" c="dimmed" className={classes.author}>
                    {author?.name}
                  </Text>
                )}
                {message.body && (
                  <Tooltip
                    label={formatDateTime(message.createdAt)}
                    openDelay={600}
                    position={outgoing ? "left" : "right"}
                  >
                    <div className={classes.bubble}>{message.body}</div>
                  </Tooltip>
                )}
                {message.attachments?.length > 0 && (
                  <Attachments items={message.attachments} />
                )}
                {last && (
                  <div className={classes.meta}>
                    {formatTime(message.createdAt)}
                    {outgoing && delivery && (
                      <span
                        className={classes.delivery}
                        data-status={message.status}
                        aria-label={delivery.label}
                      >
                        · <delivery.icon size={12} /> {delivery.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
