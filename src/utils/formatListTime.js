import dayjs from "../libs/dayjs";

// Compact list timestamp: "10:42 AM" today, "Mon" this week, "Mar 4" older.
const formatListTime = (date, now = Date.now()) => {
  const value = dayjs(date);

  if (value.isSame(now, "day")) return value.format("h:mm A");
  if (dayjs(now).diff(value, "day") < 7) return value.format("ddd");

  return value.format("MMM D");
};

export default formatListTime;
