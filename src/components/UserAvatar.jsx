import { Avatar, Indicator } from "@mantine/core";
import { statusColor } from "../constants/STATUS";

/** Initials avatar with an optional presence dot (online / away / offline / live / idle). */
const UserAvatar = ({ name, src, size = 28, presence, ...rest }) => {
  const avatar = (
    <Avatar
      src={src}
      name={name}
      alt={name}
      color="initials"
      size={size}
      {...rest}
    />
  );
  if (!presence) return avatar;

  return (
    <Indicator
      inline
      position="bottom-end"
      offset={Math.round(size * 0.14)}
      size={size >= 36 ? 10 : 8}
      color={statusColor(presence)}
      withBorder
      aria-label={presence}
    >
      {avatar}
    </Indicator>
  );
};

export default UserAvatar;
