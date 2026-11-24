import { Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { showNotification } from "../../notifications/showNotification";
import SettingsSection from "../../components/SettingsSection";

/**
 * Settings section bound to a form with dirty-aware Discard / Save actions.
 * `children` is a render function receiving the form instance.
 * `onSave` may return a promise (an API call): the form waits for it, and the API hook
 * shows its own toast. A synchronous `onSave` gets a local "saved" toast.
 * `readOnly` hides the actions for users who can't change these settings.
 */
const SettingsForm = ({
  title,
  description,
  initialValues,
  validate,
  onSave,
  readOnly = false,
  flush,
  children,
}) => {
  const form = useForm({ initialValues, validate });
  const [saving, setSaving] = useState(false);
  const dirty = form.isDirty();

  const submit = form.onSubmit(async (values) => {
    const result = onSave(values);

    if (result instanceof Promise) {
      setSaving(true);
      try {
        await result;
      } catch {
        return; // the API hook already reported the error; keep the edits
      } finally {
        setSaving(false);
      }
    } else {
      showNotification({ message: `${title} saved` });
    }

    form.setInitialValues(values);
    form.resetDirty(values);
  });

  return (
    <form onSubmit={submit} noValidate>
      <SettingsSection
        title={title}
        description={description}
        flush={flush}
        footer={
          !readOnly && (
            <>
              <Button
                variant="default"
                size="xs"
                disabled={!dirty || saving}
                onClick={form.reset}
              >
                Discard
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={!dirty}
                loading={saving}
              >
                Save changes
              </Button>
            </>
          )
        }
      >
        <fieldset
          disabled={readOnly}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          {children(form)}
        </fieldset>
      </SettingsSection>
    </form>
  );
};

export default SettingsForm;
