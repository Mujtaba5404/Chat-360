import { Badge } from "@mantine/core";
import { PRIORITY_META, STATUS_META } from "../constants/STATUS";

/** Consistent status/priority pill. `kind="priority"` uses the priority scale. */
const StatusBadge = ({ status, kind = "status", variant = "dot", ...rest }) => {
  const meta = (kind === "priority" ? PRIORITY_META : STATUS_META)[status];
  if (!meta) return null;
  return (
    <Badge color={meta.color} variant={variant} {...rest}>
      {meta.label}
    </Badge>
  );
};

export default StatusBadge;
