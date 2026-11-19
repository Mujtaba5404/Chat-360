import useNow from "../../hooks/useNow";
import formatElapsed from "../../utils/formatElapsed";

/** Session length; ticks every second while the visitor is still on the site. */
const LiveDuration = ({ start }) => {
  const now = useNow(1000);
  return formatElapsed((now - new Date(start)) / 1000);
};

const SessionDuration = ({ visitor }) => {
  if (visitor.status === "left") {
    return formatElapsed(
      (new Date(visitor.lastSeenAt) - new Date(visitor.sessionStartedAt)) /
        1000,
    );
  }
  return <LiveDuration start={visitor.sessionStartedAt} />;
};

export default SessionDuration;
