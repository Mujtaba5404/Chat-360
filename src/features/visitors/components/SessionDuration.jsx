import { useNow } from '../../../hooks/useNow';
import { formatDuration } from '../../../lib/format';

/** Session length; ticks every second while the visitor is still on the site. */
function LiveDuration({ start }) {
  const now = useNow(1000);
  return formatDuration((now - new Date(start)) / 1000);
}

export default function SessionDuration({ visitor }) {
  if (visitor.status === 'left') {
    return formatDuration((new Date(visitor.lastSeenAt) - new Date(visitor.sessionStartedAt)) / 1000);
  }
  return <LiveDuration start={visitor.sessionStartedAt} />;
}
