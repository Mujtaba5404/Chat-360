import dayjs from "../libs/dayjs";

const formatTime = (date, format = "h:mm A") => {
  return dayjs(date).format(format);
};

export default formatTime;
