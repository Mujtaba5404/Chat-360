import dayjs from "../libs/dayjs";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "Just now", "5m ago", "3h ago", "Yesterday", "4d ago", then "Mar 4".
const formatRelative = (date, now = Date.now()) => {
  if (!date) return "Never";

  const diff = now - new Date(date).getTime();

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;

  return dayjs(date).format("MMM D");
};

export default formatRelative;
