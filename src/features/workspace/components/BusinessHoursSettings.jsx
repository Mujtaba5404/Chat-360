import { Group, Select, Stack, Switch, Text, Textarea } from '@mantine/core';
import { SettingRow } from '../../../components/ui/SettingsSection';
import { timezones } from '../../../mocks/workspace';
import { saveSettings, useWorkspaceSettings } from '../store';
import SettingsForm from './SettingsForm';
import classes from './WorkspaceSettings.module.css';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 ? '30' : '00';
  return `${hours}:${minutes}`;
});

const validateDays = (days) =>
  days.some((day) => day.open && day.from >= day.to) ? 'Closing time must be after opening time' : null;

export default function BusinessHoursSettings() {
  const businessHours = useWorkspaceSettings('businessHours');

  return (
    <SettingsForm
      title="Business hours"
      description="Outside these hours, visitors see your away message and expected reply time."
      initialValues={businessHours}
      validate={{ days: validateDays }}
      onSave={(values) => saveSettings('businessHours', values)}
    >
      {(form) => (
        <Stack gap="lg">
          <SettingRow label="Enable business hours" description="When disabled, your team is shown as always available.">
            <Switch aria-label="Enable business hours" {...form.getInputProps('enabled', { type: 'checkbox' })} />
          </SettingRow>

          <Select
            label="Timezone"
            data={timezones}
            searchable
            disabled={!form.values.enabled}
            maw={320}
            {...form.getInputProps('timezone')}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Weekly schedule
            </Text>
            {form.values.days.map((day, index) => (
              <div key={day.day} className={classes.dayRow}>
                <Switch
                  label={day.day}
                  disabled={!form.values.enabled}
                  {...form.getInputProps(`days.${index}.open`, { type: 'checkbox' })}
                />
                {day.open ? (
                  <Group gap="xs" wrap="nowrap">
                    <Select aria-label={`${day.day} opens`} data={TIME_OPTIONS} w={110} disabled={!form.values.enabled} {...form.getInputProps(`days.${index}.from`)} />
                    <Text size="sm" c="dimmed">
                      to
                    </Text>
                    <Select aria-label={`${day.day} closes`} data={TIME_OPTIONS} w={110} disabled={!form.values.enabled} {...form.getInputProps(`days.${index}.to`)} />
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    Closed
                  </Text>
                )}
              </div>
            ))}
            {form.errors.days && (
              <Text size="xs" c="red" mt="xs">
                {form.errors.days}
              </Text>
            )}
          </div>

          <Textarea
            label="Away message"
            description="Shown in the widget outside business hours."
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps('awayMessage')}
          />
        </Stack>
      )}
    </SettingsForm>
  );
}
