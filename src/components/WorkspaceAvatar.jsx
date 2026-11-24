import { Avatar } from "@mantine/core";
import { useState } from "react";
import { workspaceColor, workspaceImageUrl } from "../constants/WORKSPACE";

/** A workspace's image, or its first letter on its theme color. */
const WorkspaceAvatar = ({ workspace, src, size = 28 }) => {
  const url = src ?? workspaceImageUrl(workspace);
  const [failed, setFailed] = useState(null);
  const showImage = url && failed !== url;

  return (
    <Avatar
      src={showImage ? url : null}
      size={size}
      radius="sm"
      color={workspaceColor(workspace)}
      variant="filled"
      imageProps={{ onError: () => setFailed(url) }}
      styles={{ image: { objectFit: "cover" } }}
      alt=""
    >
      {(workspace?.title ?? "W").trim().charAt(0).toUpperCase() || "W"}
    </Avatar>
  );
};

export default WorkspaceAvatar;
