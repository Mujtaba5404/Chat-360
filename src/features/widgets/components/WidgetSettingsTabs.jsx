import { ColorInput, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { IconHelp, IconMessage, IconMessageCircle } from '@tabler/icons-react';
import { SettingRow } from '../../../components/ui/SettingsSection';
import { widgetLanguages } from '../../../mocks/widgets';
import { REPLY_TIMES } from '../store';
import classes from './WidgetSettingsTabs.module.css';

const SWATCHES = ['#5E5AE6', '#0EA5E9', '#16A34A', '#F59E0B', '#E11D48', '#7C3AED', '#0F172A', '#DB2777'];

function Field({ label, children }) {
  return (
    <div>
      <Text size="sm" fw={500} mb={4}>
        {label}
      </Text>
      {children}
    </div>
  );
}

export function AppearanceTab({ form }) {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput label="Widget name" description="Internal — visitors won't see this." withAsterisk {...form.getInputProps('name')} />
        <TextInput label="Company name" description="Shown in the widget header." {...form.getInputProps('companyName')} />
      </SimpleGrid>
      <ColorInput label="Brand color" swatches={SWATCHES} swatchesPerRow={8} format="hex" maw={280} {...form.getInputProps('color')} />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Field label="Position">
          <SegmentedControl fullWidth data={[{ value: 'left', label: 'Bottom left' }, { value: 'right', label: 'Bottom right' }]} {...form.getInputProps('position')} />
        </Field>
        <Field label="Widget theme">
          <SegmentedControl fullWidth data={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} {...form.getInputProps('theme')} />
        </Field>
      </SimpleGrid>
      <div>
        <SettingRow label="Show agent avatars" description="Display team avatars in the widget header.">
          <Switch aria-label="Show agent avatars" {...form.getInputProps('showAgentAvatars', { type: 'checkbox' })} />
        </SettingRow>
        <SettingRow label="Show “Powered by Chat Model”" description="Available to remove on Business plans.">
          <Switch aria-label="Show branding" {...form.getInputProps('showBranding', { type: 'checkbox' })} />
        </SettingRow>
      </div>
    </Stack>
  );
}

export function MessagesTab({ form }) {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select label="Widget language" data={widgetLanguages} {...form.getInputProps('language')} />
        <Select label="Expected reply time" data={REPLY_TIMES} {...form.getInputProps('replyTime')} />
      </SimpleGrid>
      <TextInput label="Welcome title" withAsterisk maxLength={60} {...form.getInputProps('welcomeTitle')} />
      <Textarea
        label="Welcome message"
        description={`${form.values.welcomeMessage.length}/240 characters`}
        autosize
        minRows={3}
        maxRows={6}
        maxLength={240}
        {...form.getInputProps('welcomeMessage')}
      />
    </Stack>
  );
}

const LAUNCHER_ICONS = [
  { value: 'message', icon: IconMessage, label: 'Message' },
  { value: 'chat', icon: IconMessageCircle, label: 'Chat bubble' },
  { value: 'help', icon: IconHelp, label: 'Help' },
];

export function LauncherTab({ form }) {
  return (
    <Stack gap="md">
      <Field label="Launcher style">
        <SegmentedControl data={[{ value: 'icon', label: 'Icon only' }, { value: 'icon-text', label: 'Icon and text' }]} {...form.getInputProps('launcherStyle')} />
      </Field>
      {form.values.launcherStyle === 'icon-text' && (
        <TextInput label="Launcher text" maxLength={24} maw={320} withAsterisk {...form.getInputProps('launcherText')} />
      )}
      <Field label="Icon">
        <SegmentedControl
          data={LAUNCHER_ICONS.map(({ value, icon: Icon, label }) => ({
            value,
            label: (
              <span className={classes.iconOption} aria-label={label}>
                <Icon size={16} />
              </span>
            ),
          }))}
          {...form.getInputProps('launcherIcon')}
        />
      </Field>
    </Stack>
  );
}

export function PrechatTab({ form }) {
  const { prechatEnabled, prechatFields } = form.values;

  return (
    <Stack gap="md">
      <SettingRow label="Ask for details before chatting" description="Visitors fill in a short form before the conversation starts.">
        <Switch aria-label="Enable pre-chat form" {...form.getInputProps('prechatEnabled', { type: 'checkbox' })} />
      </SettingRow>
      <div className={classes.fields} data-disabled={!prechatEnabled || undefined}>
        <div className={classes.fieldsHeader}>
          <span>Field</span>
          <span>Show</span>
          <span>Required</span>
        </div>
        {prechatFields.map((field, index) => (
          <div key={field.id} className={classes.fieldRow}>
            <TextInput aria-label={`${field.id} label`} disabled={!prechatEnabled} {...form.getInputProps(`prechatFields.${index}.label`)} />
            <Switch aria-label={`Show ${field.label}`} disabled={!prechatEnabled} {...form.getInputProps(`prechatFields.${index}.enabled`, { type: 'checkbox' })} />
            <Switch
              aria-label={`${field.label} required`}
              disabled={!prechatEnabled || !field.enabled}
              {...form.getInputProps(`prechatFields.${index}.required`, { type: 'checkbox' })}
            />
          </div>
        ))}
      </div>
    </Stack>
  );
}
