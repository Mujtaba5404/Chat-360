import { ColorSwatch, UnstyledButton } from "@mantine/core";
import { useTeams } from "../../api/workspace";
import { INBOX_VIEWS, STATUS_VIEWS } from "./inbox";
import classes from "./InboxNav.module.css";

const NavButton = ({ active, onClick, icon, label, count }) => {
  return (
    <UnstyledButton
      className={classes.item}
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {icon}
      <span className={classes.label}>{label}</span>
      {count > 0 && <span className={classes.count}>{count}</span>}
    </UnstyledButton>
  );
};

/** Panel 1: inbox views, status filters and team inboxes. */
const InboxNav = ({
  inbox,
  status,
  inboxCounts,
  statusCounts,
  onInboxChange,
  onStatusChange,
}) => {
  const teams = useTeams();

  return (
    <nav className={classes.root} aria-label="Inboxes">
      <div className={classes.title}>Inbox</div>
      {INBOX_VIEWS.map(({ id, label, icon: Icon }) => (
        <NavButton
          key={id}
          label={label}
          icon={<Icon size={16} stroke={1.75} />}
          count={inboxCounts[id]}
          active={inbox === id}
          onClick={() => onInboxChange(id)}
        />
      ))}

      <div className={classes.heading}>Status</div>
      {STATUS_VIEWS.map(({ id, label, icon: Icon }) => (
        <NavButton
          key={id}
          label={label}
          icon={<Icon size={16} stroke={1.75} />}
          count={id === "resolved" ? 0 : statusCounts[id]}
          active={status === id}
          onClick={() => onStatusChange(id)}
        />
      ))}

      <div className={classes.heading}>Team inboxes</div>
      {teams.map((team) => {
        const id = `team:${team.id}`;
        return (
          <NavButton
            key={team.id}
            label={team.name}
            icon={
              <ColorSwatch
                color={`var(--mantine-color-${team.color}-6)`}
                size={8}
                withShadow={false}
                className={classes.swatch}
              />
            }
            count={inboxCounts[id]}
            active={inbox === id}
            onClick={() => onInboxChange(id)}
          />
        );
      })}
    </nav>
  );
};

export default InboxNav;
