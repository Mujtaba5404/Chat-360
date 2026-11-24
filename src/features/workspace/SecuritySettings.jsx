import {
  Badge,
  Button,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "../../notifications/showNotification";
import { IconDeviceDesktop, IconDeviceMobile } from "@tabler/icons-react";
import SettingsSection, { SettingRow } from "../../components/SettingsSection";
import useNow from "../../hooks/useNow";
import formatRelative from "../../utils/formatRelative";
import {
  revokeSession,
  saveSettings,
  useWorkspaceSettings,
} from "../../api/workspace";
import { toWorkspaceValues } from "../../constants/WORKSPACE";
import SettingsForm from "./SettingsForm";
import useWorkspaceRecord from "./useWorkspaceRecord";
import { workspaceRules } from "./workspaceValidation";
import classes from "./WorkspaceSettings.module.css";

const SESSION_TIMEOUTS = [
  { value: "1h", label: "1 hour" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];
const PASSWORD_POLICIES = [
  { value: "basic", label: "Basic — 8+ characters" },
  { value: "strong", label: "Strong — 12+ characters, mixed case & number" },
  { value: "strict", label: "Strict — 16+ characters, rotated every 90 days" },
];
// The workspace's saved allowlist (settings.allowedIPs).
const IpAllowlist = () => {
  const { workspace, canUpdate, save } = useWorkspaceRecord();
  if (!workspace) return null;

  return (
    <SettingsForm
      key={workspace.updatedAt}
      title="IP allowlist"
      description={
        canUpdate
          ? "Restrict dashboard access to these IP addresses or CIDR ranges. Leave empty to allow all."
          : "Only workspace owners can change the allowlist."
      }
      initialValues={{ allowedIPs: toWorkspaceValues(workspace).allowedIPs }}
      validate={{ allowedIPs: workspaceRules.allowedIPs }}
      readOnly={!canUpdate}
      onSave={save}
    >
      {(form) => (
        <TagsInput
          aria-label="Allowed IP addresses"
          placeholder="e.g. 203.0.113.0/24 — press Enter to add"
          clearable
          splitChars={[",", " "]}
          {...form.getInputProps("allowedIPs")}
        />
      )}
    </SettingsForm>
  );
};

const ActiveSessions = ({ sessions }) => {
  const now = useNow();
  const revoke = (session) => {
    revokeSession(session.id);
    showNotification({ message: `Signed out ${session.device}` });
  };

  return (
    <SettingsSection
      title="Active sessions"
      description="Devices currently signed in to your account."
      flush
    >
      {sessions.map((session) => {
        const mobile = /iphone|android/i.test(session.device);
        return (
          <div key={session.id} className={classes.listRow}>
            <ThemeIcon variant="default" size={32} radius="sm">
              {mobile ? (
                <IconDeviceMobile size={16} />
              ) : (
                <IconDeviceDesktop size={16} />
              )}
            </ThemeIcon>
            <div className={classes.listText}>
              <Text size="sm" fw={500} component="div">
                {session.device}{" "}
                {session.current && (
                  <Badge size="xs" color="green" ml={4}>
                    This device
                  </Badge>
                )}
              </Text>
              <Text size="xs" c="dimmed">
                {session.location} · {session.ip} ·{" "}
                {session.current
                  ? "Active now"
                  : formatRelative(session.lastActiveAt, now)}
              </Text>
            </div>
            {!session.current && (
              <Button
                variant="default"
                size="xs"
                onClick={() => revoke(session)}
              >
                Revoke
              </Button>
            )}
          </div>
        );
      })}
    </SettingsSection>
  );
};

const SecuritySettings = () => {
  // The IP allowlist is saved on the workspace record (see IpAllowlist).
  // eslint-disable-next-line no-unused-vars
  const { sessions, ipAllowlist, ...security } =
    useWorkspaceSettings("security");

  return (
    <Stack gap="lg">
      <SettingsForm
        title="Security"
        description="Authentication and access policies for every member."
        initialValues={security}
        onSave={(values) => saveSettings("security", values)}
      >
        {(form) => (
          <Stack gap="lg">
            <div>
              <SettingRow
                label="Require two-factor authentication"
                description="Members must set up 2FA before accessing the workspace."
              >
                <Switch
                  aria-label="Require two-factor authentication"
                  {...form.getInputProps("enforce2fa", { type: "checkbox" })}
                />
              </SettingRow>
              <SettingRow
                label="Single sign-on (SAML)"
                description="Allow members to sign in with your identity provider."
              >
                <Switch
                  aria-label="Single sign-on"
                  {...form.getInputProps("sso", { type: "checkbox" })}
                />
              </SettingRow>
            </div>
            <Select
              label="Session timeout"
              description="Inactive sessions are signed out after this period."
              data={SESSION_TIMEOUTS}
              maw={320}
              {...form.getInputProps("sessionTimeout")}
            />
            <Select
              label="Password policy"
              data={PASSWORD_POLICIES}
              maw={420}
              {...form.getInputProps("passwordPolicy")}
            />
          </Stack>
        )}
      </SettingsForm>

      <IpAllowlist />

      <ActiveSessions sessions={sessions} />
    </Stack>
  );
};

export default SecuritySettings;
