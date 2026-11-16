import { Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import FormModal from '../../../components/ui/FormModal';
import { all, rules } from '../../../lib/validation';
import { useTeams } from '../../workspace/store';
import { ROLE_OPTIONS, usersStore } from '../store';

const EMPTY_USER = { name: '', email: '', role: 'agent', team: 'support', title: '' };
const ASSIGNABLE_ROLES = ROLE_OPTIONS.filter((option) => option.value !== 'owner');

/** Create (invite) or edit a user. Mount with a `key` per record so the form resets. */
export default function UserFormModal({ user, onClose }) {
  const teams = useTeams();
  const isEdit = Boolean(user);
  const form = useForm({
    initialValues: user ? { name: user.name, email: user.email, role: user.role, team: user.team, title: user.title } : EMPTY_USER,
    validate: {
      name: rules.name('Name'),
      email: all(rules.email, rules.unique(usersStore.getState(), 'email', user?.id, 'A user with this email already exists')),
      role: rules.required('Role'),
    },
  });

  const submit = form.onSubmit((values) => {
    const data = { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() };
    if (isEdit) {
      usersStore.update(user.id, data);
      notifications.show({ message: `${data.name} updated` });
    } else {
      usersStore.add({
        ...data,
        status: 'invited',
        presence: 'offline',
        phone: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastActiveAt: null,
        stats: { conversations: 0, avgResponse: 0, csat: 0 },
      });
      notifications.show({ title: 'Invitation sent', message: `${data.name} will receive an email at ${data.email}` });
    }
    onClose();
  });

  return (
    <FormModal opened onClose={onClose} title={isEdit ? 'Edit user' : 'Invite user'} submitLabel={isEdit ? 'Save changes' : 'Send invite'} onSubmit={submit}>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <TextInput label="Full name" placeholder="Jane Cooper" withAsterisk data-autofocus {...form.getInputProps('name')} />
        <TextInput label="Job title" placeholder="Support Specialist" {...form.getInputProps('title')} />
      </SimpleGrid>
      <TextInput label="Email" placeholder="jane@company.com" type="email" withAsterisk {...form.getInputProps('email')} />
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <Select
          label="Role"
          data={user?.role === 'owner' ? ROLE_OPTIONS : ASSIGNABLE_ROLES}
          disabled={user?.role === 'owner'}
          withAsterisk
          {...form.getInputProps('role')}
        />
        <Select label="Team" data={teams.map((team) => ({ value: team.id, label: team.name }))} {...form.getInputProps('team')} />
      </SimpleGrid>
    </FormModal>
  );
}
