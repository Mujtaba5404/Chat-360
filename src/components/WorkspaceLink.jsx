import { forwardRef } from "react";
import { Link } from "react-router";
import useWorkspacePath from "../hooks/useWorkspacePath";

/** A router Link whose `to` is an app path ("/chat"), resolved inside the current workspace. */
const WorkspaceLink = forwardRef(({ to, ...props }, ref) => {
  const toWorkspace = useWorkspacePath();

  return <Link ref={ref} to={toWorkspace(to)} {...props} />;
});

WorkspaceLink.displayName = "WorkspaceLink";

export default WorkspaceLink;
