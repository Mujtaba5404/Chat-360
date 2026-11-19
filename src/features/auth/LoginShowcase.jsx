import { Avatar } from "@mantine/core";
import {
  IconBolt,
  IconCircleCheckFilled,
  IconLock,
  IconMessages,
  IconRadar2,
  IconSend,
} from "@tabler/icons-react";
import StatusBadge from "../../components/StatusBadge";
import UserAvatar from "../../components/UserAvatar";
import classes from "./LoginShowcase.module.css";

// Presentational sample content for the product preview (not live data).
const PREVIEW_CONVERSATIONS = [
  {
    name: "Marcus Chen",
    preview: "Do you offer SSO on Business?",
    time: "2m",
    unread: 2,
    online: true,
    active: true,
  },
  {
    name: "Olivia Park",
    preview: "I was charged twice this month",
    time: "9m",
    unread: 1,
    online: true,
  },
  {
    name: "Sofia Martínez",
    preview: "Webhooks are working again 🎉",
    time: "1h",
    online: false,
  },
  {
    name: "Lukas Weber",
    preview: "Updated to SDK v3.4.2, thanks!",
    time: "3h",
    online: false,
  },
];

const FEATURES = [
  {
    icon: IconMessages,
    title: "Shared inbox",
    text: "Assign, prioritise and resolve together.",
  },
  {
    icon: IconBolt,
    title: "Canned responses",
    text: "Reply in seconds with saved answers.",
  },
  {
    icon: IconRadar2,
    title: "Live visitors",
    text: "See who is on your site right now.",
  },
];

const ProductPreview = () => {
  return (
    <div className={classes.window}>
      <div className={classes.windowBar}>
        <span className={classes.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={classes.url}>
          <IconLock size={10} /> app.chatmodel.app/chat
        </span>
      </div>

      <div className={classes.windowBody}>
        <div className={classes.list}>
          <div className={classes.listTitle}>Open · 6</div>
          {PREVIEW_CONVERSATIONS.map((c) => (
            <div
              key={c.name}
              className={classes.row}
              data-active={c.active || undefined}
            >
              <UserAvatar
                name={c.name}
                presence={c.online ? "online" : undefined}
                size={26}
              />
              <div className={classes.rowText}>
                <div className={classes.rowTop}>
                  <strong>{c.name}</strong>
                  <span>{c.time}</span>
                </div>
                <div className={classes.rowBottom}>
                  <span>{c.preview}</span>
                  {c.unread && <b>{c.unread}</b>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={classes.chat}>
          <div className={classes.chatHeader}>
            <UserAvatar name="Marcus Chen" presence="online" size={26} />
            <div className={classes.rowText}>
              <strong>Marcus Chen</strong>
              <span>Online · /pricing</span>
            </div>
            <StatusBadge status="open" size="sm" />
          </div>
          <div className={classes.thread}>
            <div className={classes.bubbleIn}>
              Hi! Do you offer SSO on the Business plan?
            </div>
            <div className={classes.bubbleOut}>
              Yes — SSO is included. I can enable a 30-day trial for your team
              today.
            </div>
            <div className={classes.note}>
              <IconLock size={10} /> <b>@Oliver</b> can we extend their trial?
            </div>
            <div className={classes.typing}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={classes.composer}>
            <span>Write a reply… type / for canned responses</span>
            <i>
              <IconSend size={12} />
            </i>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Brand panel on the sign-in screen: value proposition and a product preview. */
const LoginShowcase = () => {
  return (
    <aside className={classes.root}>
      <div className={classes.glow} aria-hidden="true" />

      <div className={classes.copy}>
        <span className={classes.eyebrow}>
          Live chat · Help desk · Visitor insights
        </span>
        <h2 className={classes.headline}>
          Every customer conversation, in one calm inbox.
        </h2>
        <p className={classes.lead}>
          Chat with visitors in real time, route work to the right team and
          resolve faster — all from one workspace.
        </p>
      </div>

      <div className={classes.stage} aria-hidden="true">
        <ProductPreview />

        <div className={`${classes.float} ${classes.floatResolved}`}>
          <IconCircleCheckFilled size={18} className={classes.success} />
          <div>
            <strong>Conversation resolved</strong>
            <span>First reply in 1m 14s</span>
          </div>
        </div>

        <div className={`${classes.float} ${classes.floatLive}`}>
          <span className={classes.pulse} />
          <div>
            <strong>8 visitors live</strong>
            <span>acme.io · docs.acme.io</span>
          </div>
          <Avatar.Group spacing={6}>
            {["Ana Ruiz", "Ben Cole", "Chen Wu"].map((name) => (
              <Avatar key={name} name={name} color="initials" size={22} />
            ))}
          </Avatar.Group>
        </div>
      </div>

      <ul className={classes.features}>
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <span className={classes.featureIcon}>
              <Icon size={16} stroke={1.75} />
            </span>
            <strong>{title}</strong>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LoginShowcase;
