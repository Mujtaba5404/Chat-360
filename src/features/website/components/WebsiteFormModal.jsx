import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import FormModal from '../../../components/ui/FormModal';
import { all, normalizeDomain, rules } from '../../../lib/validation';
import { createWidget, NEW_WIDGET } from '../../widgets/store';
import { websitesStore } from '../store';

export default function WebsiteFormModal({ website, onClose, onCreated }) {
  const isEdit = Boolean(website);
  const form = useForm({
    initialValues: website ? { name: website.name, domain: website.domain, platform: website.platform } : { name: '', domain: '', platform: 'html' },
    validate: {
      name: rules.name('Website name'),
      domain: all(rules.domain, (value) =>
        rules.unique(websitesStore.getState(), 'domain', website?.id, 'This domain is already connected')(normalizeDomain(value)),
      ),
    },
  });

  const submit = form.onSubmit((values) => {
    const data = { ...values, name: values.name.trim(), domain: normalizeDomain(values.domain) };
    if (isEdit) {
      const domainChanged = data.domain !== website.domain;
      websitesStore.update(website.id, { ...data, ...(domainChanged && { verification: 'pending', connection: 'disconnected' }) });
      notifications.show({ message: domainChanged ? 'Domain updated — verify the installation again' : 'Website updated' });
      onClose();
      return;
    }
    const record = websitesStore.add({ ...data, activeWidgetId: null, verification: 'pending', connection: 'disconnected', lastActivityAt: null, monthlyVisitors: 0 });
    // Start every website with a default widget so it can be installed right away.
    createWidget({ ...NEW_WIDGET, websiteId: record.id, name: `${data.name} widget`, companyName: data.name });
    notifications.show({ title: 'Website added', message: 'A default widget was created. Follow the setup steps to install it.' });
    onCreated(record);
  });

  return (
    <FormModal opened onClose={onClose} title={isEdit ? 'Edit website' : 'Add website'} submitLabel={isEdit ? 'Save changes' : 'Add website'} onSubmit={submit}>
      <TextInput label="Website name" placeholder="Marketing site" withAsterisk data-autofocus {...form.getInputProps('name')} />
      <TextInput
        label="Domain"
        placeholder="example.com"
        description="Subdomains need to be added separately."
        leftSection={<span style={{ fontSize: 12 }}>https://</span>}
        leftSectionWidth={60}
        withAsterisk
        {...form.getInputProps('domain')}
      />
      {/* <Select label="Platform" data={platforms} allowDeselect={false} {...form.getInputProps('platform')} /> */}
    </FormModal>
  );
}
