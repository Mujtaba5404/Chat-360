import formatDate from "./formatDate";
import formatTime from "./formatTime";

const formatDateTime = (date) => `${formatDate(date)}, ${formatTime(date)}`;

export default formatDateTime;
