import {
  ColorInput,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { SettingRow } from "../../components/SettingsSection";
import WIDGET from "../../constants/WIDGET";
import WORKSPACE from "../../constants/WORKSPACE";
import LAUNCHER_ICONS from "./launcherIcons";
import classes from "./WidgetSettingsTabs.module.css";

const SWATCHES = [
  "#5E5AE6",
  "#2563EB",
  "#0EA5E9",
  "#16A34A",
  "#F59E0B",
  "#E11D48",
  "#7C3AED",
  "#0F172A",
];

const Field = ({ label, children }) => {
  return (
    <div>
      <Text size="sm" fw={500} mb={4}>
        {label}
      </Text>
      {children}
    </div>
  );
};

const HexInput = (props) => (
  <ColorInput swatches={SWATCHES} swatchesPerRow={8} format="hex" {...props} />
);

const ToggleRow = ({ form, path, label, description }) => (
  <SettingRow label={label} description={description}>
    <Switch
      aria-label={label}
      {...form.getInputProps(path, { type: "checkbox" })}
    />
  </SettingRow>
);

export const AppearanceTab = ({ form }) => {
  const { showBranding } = form.values.settings.branding;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Widget name"
          description="Internal — visitors won't see this."
          withAsterisk
          {...form.getInputProps("title")}
        />
        <Select
          label="Widget language"
          description="Language of the widget's built-in text."
          data={WIDGET.LOCALES}
          searchable
          allowDeselect={false}
          {...form.getInputProps("settings.locale")}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <HexInput
          label="Brand color"
          description="Header, buttons and visitor messages."
          {...form.getInputProps("settings.style.primaryColor")}
        />
        <HexInput
          label="Text color"
          description="Text on the brand and launcher colors."
          {...form.getInputProps("settings.style.textColor")}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Logo URL"
          description="Shown in the widget header."
          placeholder="https://example.com/logo.png"
          {...form.getInputProps("settings.header.logo")}
        />
        <TextInput
          label="Avatar URL"
          description="Shown next to the welcome message."
          placeholder="https://example.com/avatar.png"
          {...form.getInputProps("settings.header.avatar")}
        />
      </SimpleGrid>
      <div>
        <ToggleRow
          form={form}
          path="settings.showAgentAvailability"
          label="Show agent availability"
          description="Display your team in the header while agents are online."
        />
        <ToggleRow
          form={form}
          path="settings.showTypingIndicator"
          label="Show typing indicator"
          description="Let visitors see when an agent is typing."
        />
        <ToggleRow
          form={form}
          path="settings.branding.showBranding"
          label="Show branding"
          description="A small credit line under the conversation."
        />
      </div>
      {showBranding && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <TextInput
            label="Branding text"
            withAsterisk
            maxLength={60}
            {...form.getInputProps("settings.branding.text")}
          />
          <TextInput
            label="Branding link"
            placeholder="https://example.com"
            {...form.getInputProps("settings.branding.url")}
          />
          <TextInput
            label="Branding logo URL"
            placeholder="https://example.com/mark.png"
            {...form.getInputProps("settings.branding.logo")}
          />
        </SimpleGrid>
      )}
    </Stack>
  );
};

export const MessagesTab = ({ form }) => {
  const { welcome, offline } = form.values.settings.message;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Header title"
          withAsterisk
          maxLength={60}
          {...form.getInputProps("settings.header.title")}
        />
        <TextInput
          label="Header subtitle"
          withAsterisk
          maxLength={80}
          {...form.getInputProps("settings.header.subtitle")}
        />
      </SimpleGrid>
      <Textarea
        label="Welcome message"
        withAsterisk
        description={`${welcome.length}/240 characters`}
        autosize
        minRows={3}
        maxRows={6}
        maxLength={240}
        {...form.getInputProps("settings.message.welcome")}
      />
      <Textarea
        label="Offline message"
        withAsterisk
        description={`Shown when no one is available. ${offline.length}/240 characters`}
        autosize
        minRows={2}
        maxRows={5}
        maxLength={240}
        {...form.getInputProps("settings.message.offline")}
      />
      <div>
        <ToggleRow
          form={form}
          path="settings.soundNotification"
          label="Sound notifications"
          description="Play a sound for visitors when a new reply arrives."
        />
        <ToggleRow
          form={form}
          path="settings.fileUploadEnabled"
          label="File uploads"
          description="Let visitors attach files to their messages."
        />
        <ToggleRow
          form={form}
          path="settings.showQuickReplies"
          label="Quick replies"
          description="Offer suggested replies visitors can tap."
        />
      </div>
    </Stack>
  );
};

export const LauncherTab = ({ form }) => {
  const { textEnabled } = form.values.settings.launcher;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <HexInput
          label="Launcher color"
          {...form.getInputProps("settings.style.launcherColor")}
        />
        <Field label="Launcher style">
          <SegmentedControl
            fullWidth
            data={[
              { value: "icon", label: "Icon only" },
              { value: "text", label: "Icon and text" },
            ]}
            value={textEnabled ? "text" : "icon"}
            onChange={(value) =>
              form.setFieldValue(
                "settings.launcher.textEnabled",
                value === "text",
              )
            }
          />
        </Field>
      </SimpleGrid>
      {textEnabled && (
        <TextInput
          label="Launcher text"
          withAsterisk
          maxLength={24}
          maw={320}
          {...form.getInputProps("settings.launcher.text")}
        />
      )}
      <Field label="Icon">
        <SegmentedControl
          data={WIDGET.LAUNCHER_ICONS.map(({ value, label }) => {
            const Icon = LAUNCHER_ICONS[value];
            return {
              value,
              label: (
                <span className={classes.iconOption} aria-label={label}>
                  <Icon size={16} />
                </span>
              ),
            };
          })}
          {...form.getInputProps("settings.launcher.icon")}
        />
      </Field>
      <Field label="Position">
        <SegmentedControl
          data={WIDGET.POSITIONS}
          {...form.getInputProps("settings.style.position")}
        />
      </Field>
      <SimpleGrid cols={{ base: 2 }} spacing="md" maw={420}>
        <NumberInput
          label="Side offset"
          suffix=" px"
          min={0}
          max={200}
          allowDecimal={false}
          {...form.getInputProps("settings.style.offsetX")}
        />
        <NumberInput
          label="Bottom offset"
          suffix=" px"
          min={0}
          max={200}
          allowDecimal={false}
          {...form.getInputProps("settings.style.offsetY")}
        />
      </SimpleGrid>
    </Stack>
  );
};

export const PrechatTab = ({ form }) => {
  const { prechatFields } = form.values;
  const enabled = form.values.settings.preChatForm.enabled;

  return (
    <Stack gap="md">
      <SettingRow
        label="Ask for details before chatting"
        description="Visitors fill in a short form before the conversation starts."
      >
        <Switch
          aria-label="Enable pre-chat form"
          {...form.getInputProps("settings.preChatForm.enabled", {
            type: "checkbox",
          })}
        />
      </SettingRow>
      <div className={classes.fields} data-disabled={!enabled || undefined}>
        <div className={classes.fieldsHeader}>
          <span>Field</span>
          <span>Show</span>
          <span>Required</span>
        </div>
        {prechatFields.map((field, index) => (
          <div key={field.key} className={classes.fieldRow}>
            <TextInput
              aria-label={`${field.key} label`}
              disabled={!enabled}
              {...form.getInputProps(`prechatFields.${index}.label`)}
            />
            <Switch
              aria-label={`Show ${field.label}`}
              disabled={!enabled}
              {...form.getInputProps(`prechatFields.${index}.enabled`, {
                type: "checkbox",
              })}
            />
            <Switch
              aria-label={`${field.label} required`}
              disabled={!enabled || !field.enabled}
              {...form.getInputProps(`prechatFields.${index}.required`, {
                type: "checkbox",
              })}
            />
          </div>
        ))}
      </div>
      {form.errors.prechatFields && (
        <Text size="xs" c="red">
          {form.errors.prechatFields}
        </Text>
      )}
    </Stack>
  );
};

export const BusinessHoursTab = ({ form }) => {
  const { enabled, days } = form.values.settings.businessHours;
  const path = "settings.businessHours";
  const timeProps = (day, edge) => ({
    "aria-label": `${day.label} ${edge === "from" ? "opens" : "closes"}`,
    data: WIDGET.TIMES,
    w: 110,
    allowDeselect: false,
    disabled: !enabled,
    value: String(days[day.key][edge]),
    onChange: (value) =>
      form.setFieldValue(`${path}.days.${day.key}.${edge}`, Number(value)),
  });

  return (
    <Stack gap="md">
      <SettingRow
        label="Enable business hours"
        description="Outside these hours, visitors see the offline message."
      >
        <Switch
          aria-label="Enable business hours"
          {...form.getInputProps(`${path}.enabled`, { type: "checkbox" })}
        />
      </SettingRow>
      <Select
        label="Timezone"
        data={WORKSPACE.TIMEZONES}
        searchable
        allowDeselect={false}
        disabled={!enabled}
        maw={320}
        {...form.getInputProps(`${path}.timezone`)}
      />
      <div>
        <Text size="sm" fw={500} mb="xs">
          Weekly schedule
        </Text>
        {WIDGET.DAYS.map((day) => (
          <div key={day.key} className={classes.dayRow}>
            <Switch
              label={day.label}
              disabled={!enabled}
              {...form.getInputProps(`${path}.days.${day.key}.enabled`, {
                type: "checkbox",
              })}
            />
            {days[day.key].enabled ? (
              <Group gap="xs" wrap="nowrap">
                <Select {...timeProps(day, "from")} />
                <Text size="sm" c="dimmed">
                  to
                </Text>
                <Select {...timeProps(day, "to")} />
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                Closed
              </Text>
            )}
          </div>
        ))}
        {form.errors[`${path}.days`] && (
          <Text size="xs" c="red" mt="xs">
            {form.errors[`${path}.days`]}
          </Text>
        )}
      </div>
    </Stack>
  );
};
