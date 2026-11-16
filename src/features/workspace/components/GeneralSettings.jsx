import { Avatar, Badge, Button, FileButton, Group, Progress, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import CopyAction from '../../../components/ui/CopyAction';
import PropertyList from '../../../components/ui/PropertyList';
import SettingsSection from '../../../components/ui/SettingsSection';
import { formatDate, formatNumber } from '../../../lib/format';
import { rules } from '../../../lib/validation';
import { saveSettings, useWorkspaceSettings } from '../store';
import SettingsForm from './SettingsForm';

const INDUSTRIES = [
  { value: 'saas', label: 'Software / SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'finance', label: 'Financial services' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const MAX_LOGO_BYTES = 1024 * 1024;

function LogoField({ value, name, onChange }) {
  const upload = (file) => {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      notifications.show({ color: 'red', message: 'Logo must be smaller than 1 MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <Group gap="md">
      <Avatar src={value} name={name} color="brand" radius="md" size={48} />
      <div>
        <Group gap="xs">
          <FileButton onChange={upload} accept="image/png,image/jpeg,image/svg+xml">
            {(props) => (
              <Button {...props} variant="default" size="xs" leftSection={<IconUpload size={14} />}>
                Upload logo
              </Button>
            )}
          </FileButton>
          {value && (
            <Button variant="subtle" color="gray" size="xs" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </Group>
        <Text size="xs" c="dimmed" mt={4}>
          PNG, JPG or SVG, up to 1 MB. Shown in the widget and emails.
        </Text>
      </div>
    </Group>
  );
}

function Usage({ label, used, total }) {
  const percent = Math.round((used / total) * 100);
  return (
    <div>
      <Group justify="space-between" mb={6}>
        <Text size="sm">{label}</Text>
        <Text size="xs" c="dimmed">
          {formatNumber(used)} / {formatNumber(total)}
        </Text>
      </Group>
      <Progress value={percent} size="sm" color={percent > 85 ? 'orange' : 'brand'} aria-label={`${label} usage`} />
    </div>
  );
}

export default function GeneralSettings() {
  const general = useWorkspaceSettings('general');
  const info = useWorkspaceSettings('info');

  return (
    <Stack gap="lg">
      <SettingsForm
        title="General"
        description="Your workspace identity across the dashboard, widget and emails."
        initialValues={general}
        validate={{ name: rules.name('Workspace name'), supportEmail: rules.email, subdomain: rules.shortcut }}
        onSave={(values) => saveSettings('general', values)}
      >
        {(form) => (
          <Stack gap="md">
            <LogoField value={form.values.logo} name={form.values.name} onChange={(logo) => form.setFieldValue('logo', logo)} />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="Workspace name" withAsterisk {...form.getInputProps('name')} />
              <TextInput label="Subdomain" rightSection={<Text size="xs" c="dimmed" pr="sm">.chatmodel.app</Text>} rightSectionWidth={110} {...form.getInputProps('subdomain')} />
              <TextInput label="Support email" type="email" {...form.getInputProps('supportEmail')} />
              <TextInput label="Company website" {...form.getInputProps('website')} />
              <Select label="Industry" data={INDUSTRIES} {...form.getInputProps('industry')} />
              <Select label="Company size" data={COMPANY_SIZES} {...form.getInputProps('companySize')} />
            </SimpleGrid>
          </Stack>
        )}
      </SettingsForm>

      <SettingsSection title="Workspace information" description="Plan, region and current usage." action={<Badge>{info.plan}</Badge>}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <PropertyList
            items={[
              { label: 'Workspace ID', value: <Group gap={4} wrap="nowrap"><Text size="sm" ff="monospace">{info.id}</Text><CopyAction value={info.id} label="Copy workspace ID" /></Group> },
              { label: 'Data region', value: info.region },
              { label: 'Created', value: formatDate(info.createdAt) },
            ]}
          />
          <Stack gap="md">
            <Usage label="Seats" used={info.seats.used} total={info.seats.total} />
            <Usage label="Conversations this month" used={info.conversations.used} total={info.conversations.total} />
          </Stack>
        </SimpleGrid>
      </SettingsSection>
    </Stack>
  );
}
