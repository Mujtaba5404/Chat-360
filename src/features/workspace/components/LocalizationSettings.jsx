import { Alert, SegmentedControl, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useNow } from '../../../hooks/useNow';
import { languages, timezones } from '../../../mocks/workspace';
import { saveSettings, useWorkspaceSettings } from '../store';
import SettingsForm from './SettingsForm';

const DATE_FORMATS = [
  { value: 'MMM D, YYYY', label: 'Jan 31, 2026', options: { month: 'short', day: 'numeric', year: 'numeric' }, locale: 'en-US' },
  { value: 'DD/MM/YYYY', label: '31/01/2026', options: { day: '2-digit', month: '2-digit', year: 'numeric' }, locale: 'en-GB' },
  { value: 'MM/DD/YYYY', label: '01/31/2026', options: { month: '2-digit', day: '2-digit', year: 'numeric' }, locale: 'en-US' },
  { value: 'YYYY-MM-DD', label: '2026-01-31', options: { year: 'numeric', month: '2-digit', day: '2-digit' }, locale: 'sv-SE' },
];

const WEEK_STARTS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' },
];

function preview(values, now) {
  const date = DATE_FORMATS.find((format) => format.value === values.dateFormat);
  const timeZone = values.timezone;
  const datePart = new Intl.DateTimeFormat(date.locale, { ...date.options, timeZone }).format(now);
  const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hourCycle: values.timeFormat === '24h' ? 'h23' : 'h12', timeZone }).format(now);
  return `${datePart} · ${timePart}`;
}

export default function LocalizationSettings() {
  const localization = useWorkspaceSettings('localization');
  const now = useNow();

  return (
    <SettingsForm
      title="Localization"
      description="Default language, timezone and formats for your workspace and reports."
      initialValues={localization}
      onSave={(values) => saveSettings('localization', values)}
    >
      {(form) => (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select label="Default language" data={languages} {...form.getInputProps('language')} />
            <Select label="Timezone" data={timezones} searchable {...form.getInputProps('timezone')} />
            <Select label="Date format" data={DATE_FORMATS.map(({ value, label }) => ({ value, label }))} {...form.getInputProps('dateFormat')} />
            <Select label="First day of week" data={WEEK_STARTS} {...form.getInputProps('weekStart')} />
          </SimpleGrid>
          <div>
            <Text size="sm" fw={500} mb={4}>
              Time format
            </Text>
            <SegmentedControl
              data={[
                { value: '12h', label: '12-hour' },
                { value: '24h', label: '24-hour' },
              ]}
              {...form.getInputProps('timeFormat')}
            />
          </div>
          <Alert variant="light" color="gray" icon={<IconClock size={16} />} title="Preview">
            {preview(form.values, now)}
          </Alert>
        </Stack>
      )}
    </SettingsForm>
  );
}
