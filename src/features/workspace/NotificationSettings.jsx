import { Button, Group, Switch, Text } from "@mantine/core";
import { showNotification } from "../../notifications/showNotification";
import { IconBell } from "@tabler/icons-react";
import { useState } from "react";
import { saveSettings, useWorkspaceSettings } from "../../api/workspace";
import SettingsForm from "./SettingsForm";
import classes from "./WorkspaceSettings.module.css";

const EVENTS = [
  {
    key: "newConversation",
    label: "New conversation",
    description: "A visitor starts a conversation in your team inboxes",
  },
  {
    key: "assignedToMe",
    label: "Assigned to me",
    description: "A conversation is assigned to you",
  },
  {
    key: "newMessage",
    label: "New message",
    description: "A customer replies in a conversation you follow",
  },
  {
    key: "mention",
    label: "Mentions",
    description: "A teammate @mentions you in a private note",
  },
  {
    key: "slaBreach",
    label: "SLA at risk",
    description: "A first reply target is about to be missed",
  },
  {
    key: "dailyDigest",
    label: "Daily digest",
    description: "Summary of yesterday’s conversations",
  },
];
const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "push", label: "Mobile push" },
  { key: "desktop", label: "Desktop" },
];

const supportsDesktop =
  typeof window !== "undefined" && "Notification" in window;

const DesktopPermission = () => {
  const [permission, setPermission] = useState(
    supportsDesktop ? Notification.permission : "unsupported",
  );

  const request = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted")
      showNotification({ message: "Desktop notifications enabled" });
  };

  if (permission === "granted" || permission === "unsupported") return null;
  return (
    <Group justify="space-between" px="lg" py="sm" className={classes.listRow}>
      <Text size="xs" c="dimmed">
        {permission === "denied"
          ? "Desktop notifications are blocked. Allow them in your browser’s site settings."
          : "Allow this browser to show desktop notifications."}
      </Text>
      {permission === "default" && (
        <Button
          size="xs"
          variant="default"
          leftSection={<IconBell size={14} />}
          onClick={request}
        >
          Enable
        </Button>
      )}
    </Group>
  );
};

const NotificationSettings = () => {
  const settings = useWorkspaceSettings("notifications");

  return (
    <SettingsForm
      title="Notifications"
      description="Choose how you're notified about conversation activity."
      initialValues={settings}
      onSave={(values) => saveSettings("notifications", values)}
      flush
    >
      {(form) => (
        <>
          <DesktopPermission />
          <div className={classes.matrix}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  {CHANNELS.map((channel) => (
                    <th key={channel.key}>{channel.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((event) => (
                  <tr key={event.key}>
                    <td>
                      <Text size="sm">{event.label}</Text>
                      <Text size="xs" c="dimmed">
                        {event.description}
                      </Text>
                    </td>
                    {CHANNELS.map((channel) => (
                      <td key={channel.key}>
                        <Switch
                          size="xs"
                          aria-label={`${event.label} via ${channel.label}`}
                          {...form.getInputProps(
                            `${event.key}.${channel.key}`,
                            { type: "checkbox" },
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SettingsForm>
  );
};

export default NotificationSettings;
