import { Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import SettingsSection from '../../../components/ui/SettingsSection';

/**
 * Settings section bound to a form with dirty-aware Discard / Save actions.
 * `children` is a render function receiving the form instance.
 */
export default function SettingsForm({ title, description, initialValues, validate, onSave, flush, children }) {
  const form = useForm({ initialValues, validate });
  const dirty = form.isDirty();

  const submit = form.onSubmit((values) => {
    onSave(values);
    form.setInitialValues(values);
    form.resetDirty(values);
    notifications.show({ message: `${title} saved` });
  });

  return (
    <form onSubmit={submit} noValidate>
      <SettingsSection
        title={title}
        description={description}
        flush={flush}
        footer={
          <>
            <Button variant="default" size="xs" disabled={!dirty} onClick={form.reset}>
              Discard
            </Button>
            <Button type="submit" size="xs" disabled={!dirty}>
              Save changes
            </Button>
          </>
        }
      >
        {children(form)}
      </SettingsSection>
    </form>
  );
}
