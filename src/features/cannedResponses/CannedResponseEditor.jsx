import {
  Button,
  Group,
  SegmentedControl,
  Select,
  SimpleGrid,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "../../notifications/showNotification";
import { useRef } from "react";
import FormModal from "../../components/FormModal";
import { all, rules } from "../../utils/validation";
import {
  cannedCategories,
  templateVariables,
} from "../../mocks/cannedResponses";
import { cannedStore } from "../../api/cannedResponse";
import TemplateText from "./TemplateText";
import classes from "./CannedResponseEditor.module.css";

const EMPTY = {
  title: "",
  shortcut: "",
  category: "general",
  visibility: "public",
  tags: [],
  message: "",
};
const SAMPLE_VALUES = Object.fromEntries(
  templateVariables.map((v) => [v.key, v.sample]),
);

const CannedResponseEditor = ({ response, ownerId, onClose }) => {
  const messageRef = useRef(null);
  const isEdit = Boolean(response);
  const form = useForm({
    initialValues: response
      ? {
          title: response.title,
          shortcut: response.shortcut,
          category: response.category,
          visibility: response.visibility,
          tags: response.tags,
          message: response.message,
        }
      : EMPTY,
  });

  // Inserts a {{variable}} at the cursor and restores focus after it.
  const insertVariable = (key) => {
    const textarea = messageRef.current;
    const token = `{{${key}}}`;
    const { message } = form.values;
    const start = textarea?.selectionStart ?? message.length;
    const end = textarea?.selectionEnd ?? message.length;
    form.setFieldValue(
      "message",
      message.slice(0, start) + token + message.slice(end),
    );
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const submit = form.onSubmit((values) => {
    const data = {
      ...values,
      title: values.title.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (isEdit) {
      cannedStore.update(response.id, data);
      showNotification({ message: `“${data.title}” saved` });
    } else {
      cannedStore.add({ ...data, ownerId, usageCount: 0, lastUsedAt: null });
      showNotification({ message: `Created /${data.shortcut}` });
    }
    onClose();
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={isEdit ? "Edit canned response" : "New canned response"}
      size="xl"
      onSubmit={submit}
      submitLabel={isEdit ? "Save changes" : "Create response"}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput label="Title" placeholder="Refund confirmation" withAsterisk data-autofocus {...form.getInputProps("title")}/>
        <TextInput
          label="Shortcut"
          placeholder="refund"
          leftSection={
            <Text size="sm" c="dimmed">
              /
            </Text>
          }
          withAsterisk
          {...form.getInputProps("shortcut")}
          onChange={(event) =>
            form.setFieldValue(
              "shortcut",
              event.currentTarget.value.toLowerCase().replace(/\s+/g, "-"),
            )
          }
        />
        <Select label="Category" data={cannedCategories} {...form.getInputProps("category")}/>
        <div>
          <Text size="sm" fw={500} mb={4}>
            Visibility
          </Text>
          <SegmentedControl
            fullWidth
            data={[
              { value: "public", label: "Shared with team" },
              { value: "private", label: "Only me" },
            ]}
            {...form.getInputProps("visibility")}
          />
        </div>
      </SimpleGrid>
      <TagsInput label="Tags" placeholder="Add tag and press Enter" maxTags={5} {...form.getInputProps("tags")}/>

      <div className={classes.editor}>
        <div className={classes.compose}>
          <Textarea ref={messageRef} label="Message" withAsterisk autosize minRows={6} maxRows={12}
            placeholder="Hi {{customer_name}}, thanks for reaching out…"
            {...form.getInputProps("message")}
          />
          <Group gap={6} mt="xs">
            <Text size="xs" c="dimmed">
              Insert:
            </Text>
            {templateVariables.map((variable) => (
              <Button key={variable.key} variant="default" size="compact-xs" onClick={() => insertVariable(variable.key)}>
                {variable.label}
              </Button>
            ))}
          </Group>
        </div>
        <div className={classes.preview}>
          <Text size="sm" fw={500} mb={4}>
            Preview
          </Text>
          <div className={classes.bubble}>
            {form.values.message ? (
              <TemplateText text={form.values.message} values={SAMPLE_VALUES} />
            ) : (
              <Text size="sm" c="dimmed">
                Your message preview appears here.
              </Text>
            )}
          </div>
          <Text size="xs" c="dimmed" mt="xs">
            Variables are filled with sample data.
          </Text>
        </div>
      </div>
    </FormModal>
  );
};

export default CannedResponseEditor;