import { Avatar, SegmentedControl } from "@mantine/core";
import {
  IconMessageCircle,
  IconPaperclip,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { isHexColor, isUrl } from "../../constants/WIDGET";
import readableTextColor from "../../utils/readableTextColor";
import LAUNCHER_ICONS from "./launcherIcons";
import classes from "./WidgetPreview.module.css";

const PREVIEW_AGENTS = ["Sarah Mitchell", "Lucas Fernández", "Emma Schultz"];
const VISITOR_MESSAGE = "Hi! Do you offer annual billing?";
const QUICK_REPLIES = ["Pricing", "Talk to sales"];
// The stage is small, so very large offsets are capped to keep the widget in view.
const clampOffset = (value) => Math.min(Math.max(Number(value) || 0, 0), 80);

/** Live preview of the chat widget on a mock website, from the editor's form values. */
const WidgetPreview = ({ values }) => {
  const { settings } = values;
  const { style, header, message, launcher, branding } = settings;
  const [selectedView, setView] = useState("conversation");
  const prechat = settings.preChatForm.enabled;
  // Fall back when the pre-chat form gets disabled while it's being previewed.
  const view =
    selectedView === "prechat" && !prechat ? "conversation" : selectedView;
  const color = isHexColor(style.primaryColor) ? style.primaryColor : "#5E5AE6";
  const launcherColor = isHexColor(style.launcherColor)
    ? style.launcherColor
    : color;
  const text = isHexColor(style.textColor)
    ? style.textColor
    : readableTextColor(color);
  const side = style.position === "bottom_left" ? "left" : "right";
  const open = view !== "launcher";
  const fields = values.prechatFields.filter((field) => field.enabled);
  const LauncherIcon = LAUNCHER_ICONS[launcher.icon] ?? IconMessageCircle;
  const launcherText = launcher.textEnabled && launcher.text;

  return (
    <div className={classes.root}>
      <SegmentedControl
        fullWidth
        value={view}
        onChange={setView}
        data={[
          { value: "conversation", label: "Chat" },
          { value: "prechat", label: "Pre-chat", disabled: !prechat },
          { value: "offline", label: "Offline" },
          { value: "launcher", label: "Launcher" },
        ]}
        aria-label="Preview state"
      />

      <div
        className={classes.stage}
        style={{
          "--widget-color": color,
          "--widget-text": text,
          "--launcher-color": launcherColor,
          "--offset-x": `${clampOffset(style.offsetX)}px`,
          "--offset-y": `${clampOffset(style.offsetY)}px`,
        }}
        aria-label="Widget preview"
      >
        <div className={classes.site} aria-hidden="true">
          <div className={classes.siteNav} />
          <div className={classes.siteHero} />
          <div className={classes.siteLine} style={{ width: "70%" }} />
          <div className={classes.siteLine} style={{ width: "55%" }} />
          <div className={classes.siteLine} style={{ width: "62%" }} />
        </div>

        {open && (
          <div className={classes.panel} data-position={side}>
            <div className={classes.panelHeader}>
              <div className={classes.panelBrand}>
                {isUrl(header.logo) && (
                  <img src={header.logo} alt="" className={classes.logo} />
                )}
                <div className={classes.panelTitle}>
                  <strong>
                    {header.title || values.title || "Your company"}
                  </strong>
                  {header.subtitle && <span>{header.subtitle}</span>}
                </div>
              </div>
              {settings.showAgentAvailability && view !== "offline" && (
                <Avatar.Group spacing={8}>
                  {PREVIEW_AGENTS.map((name) => (
                    <Avatar
                      key={name}
                      name={name}
                      color="initials"
                      size={26}
                      className={classes.agent}
                    />
                  ))}
                </Avatar.Group>
              )}
            </div>

            <div className={classes.panelBody}>
              {view === "prechat" ? (
                <div className={classes.prechat}>
                  {fields.map((field) => (
                    <label key={field.key} className={classes.field}>
                      <span>
                        {field.label}
                        {field.required && " *"}
                      </span>
                      <span className={classes.fakeInput} />
                    </label>
                  ))}
                  <span className={classes.primaryButton}>
                    Start conversation
                  </span>
                </div>
              ) : (
                <>
                  <div className={classes.incoming}>
                    <Avatar
                      src={isUrl(header.avatar) ? header.avatar : null}
                      size={24}
                      className={classes.botAvatar}
                    />
                    <div className={classes.bubbleIn}>
                      {view === "offline" ? message.offline : message.welcome}
                    </div>
                  </div>
                  {view !== "offline" && (
                    <>
                      {settings.showQuickReplies && (
                        <div className={classes.quickReplies}>
                          {QUICK_REPLIES.map((reply) => (
                            <span key={reply}>{reply}</span>
                          ))}
                        </div>
                      )}
                      <div className={classes.bubbleOut}>{VISITOR_MESSAGE}</div>
                      {settings.showTypingIndicator && (
                        <div className={classes.typing} aria-label="Typing">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {view !== "prechat" && (
              <div className={classes.composer}>
                <span>Write a message…</span>
                <span className={classes.composerIcons}>
                  {settings.fileUploadEnabled && <IconPaperclip size={16} />}
                  <IconSend size={16} />
                </span>
              </div>
            )}
            {branding.showBranding && branding.text && (
              <div className={classes.branding}>
                {isUrl(branding.logo) && (
                  <img
                    src={branding.logo}
                    alt=""
                    className={classes.brandMark}
                  />
                )}
                {branding.text}
              </div>
            )}
          </div>
        )}

        <div
          className={classes.launcher}
          data-position={side}
          data-with-text={(!open && launcherText) || undefined}
        >
          {open ? <IconX size={20} /> : <LauncherIcon size={20} />}
          {!open && launcherText && <span>{launcherText}</span>}
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;
