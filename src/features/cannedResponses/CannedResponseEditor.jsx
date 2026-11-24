import {
  Button,
  Group,
  Input,
  SegmentedControl,
  Select,
  SimpleGrid,
  Switch,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMemo, useRef } from "react";
import {
  useCreateCannedResponseMutation,
  useUpdateCannedResponseMutation,
} from "../../api/cannedResponse";
import FormModal from "../../components/FormModal";
import CANNED_RESPONSE, {
  cleanTags,
  tagNamesOf,
  toCannedPayload,
  toCannedValues,
  toShortcut,
} from "../../constants/CANNED_RESPONSE";
import TemplateText from "./TemplateText";
import classes from "./CannedResponseEditor.module.css";

const SAMPLE_VALUES = Object.fromEntries(
  CANNED_RESPONSE.VARIABLES.map((v) => [v.key, v.sample]),
);
const isShortcutTaken = (name, responses, response) =>
  responses.some(
    (item) => item._id !== response?._id && item.shortcut === toShortcut(name),
  );

const CannedResponseEditor = ({ response, responses, onClose }) => {
  const messageRef = useRef(null);
  const isEdit = Boolean(response);
  const createMutation = useCreateCannedResponseMutation();
  const updateMutation = useUpdateCannedResponseMutation();
  // Tags are typed freely; ones already used on other responses are suggested.
  const tagSuggestions = useMemo(
    () => cleanTags(responses.flatMap((item) => tagNamesOf(item.tags))),
    [responses],
  );
  const form = useForm({
    initialValues: toCannedValues(response),
    validate: {
      title: (value) => {
        if (!value.trim()) return "Title is required";
        return value.trim().length > CANNED_RESPONSE.TITLE_MAX
          ? `Use at most ${CANNED_RESPONSE.TITLE_MAX} characters`
          : null;
      },
      shortcut: (value) => {
        if (!CANNED_RESPONSE.SHORTCUT_PATTERN.test(value))
          return "Start with a letter or number; use letters, numbers, . _ or -";
        return isShortcutTaken(value, responses, response)
          ? "Another response already uses this shortcut"
          : null;
      },
      content: (value) => (value.trim() ? null : "Message is required"),
    },
  });

  // Inserts a {{variable}} at the cursor, filling empty braces typed around it.
  const insertVariable = (key) => {
    const textarea = messageRef.current;
    const { content } = form.values;
    let start = textarea?.selectionStart ?? content.length;
    let end = textarea?.selectionEnd ?? content.length;
    if (content.slice(0, start).endsWith("{{")) start -= 2;
    if (content.slice(end).startsWith("}}")) end += 2;
    const token = `{{${key}}}`;
    form.setFieldValue(
      "content",
      content.slice(0, start) + token + content.slice(end),
    );
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const submit = form.onSubmit((values) => {
    const payload = toCannedPayload(values);
    const options = { onSuccess: onClose };

    if (isEdit)
      updateMutation.mutate({ id: response._id, ...payload }, options);
    else createMutation.mutate(payload, options);
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={isEdit ? "Edit canned response" : "New canned response"}
      size="xl"
      onSubmit={submit}
      submitLabel={isEdit ? "Save changes" : "Create response"}
      loading={createMutation.isPending || updateMutation.isPending}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
        <TextInput
          label="Title"
          placeholder="Greeting"
          withAsterisk
          data-autofocus
          maxLength={CANNED_RESPONSE.TITLE_MAX}
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Shortcut"
          placeholder="hi"
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
              event.currentTarget.value
                .replace(/^\/+/, "")
                .toLowerCase()
                .replace(/\s+/g, "-"),
            )
          }
        />
        <Select
          label="Category"
          data={CANNED_RESPONSE.CATEGORIES}
          allowDeselect={false}
          {...form.getInputProps("category")}
        />
        <Input.Wrapper label="Visibility">
          <SegmentedControl
            fullWidth
            data={CANNED_RESPONSE.VISIBILITIES}
            {...form.getInputProps("visibility")}
          />
        </Input.Wrapper>
      </SimpleGrid>

      <TagsInput
        label="Tags"
        placeholder={
          form.values.tags.length < CANNED_RESPONSE.TAGS_MAX
            ? "Add tag and press Enter"
            : undefined
        }
        data={tagSuggestions}
        splitChars={[","]}
        maxTags={CANNED_RESPONSE.TAGS_MAX}
        maxLength={CANNED_RESPONSE.TAG_MAX}
        clearable
        acceptValueOnBlur
        value={form.values.tags}
        onChange={(value) => form.setFieldValue("tags", cleanTags(value))}
      />

      <div className={classes.editor}>
        <div className={classes.compose}>
          <Textarea
            ref={messageRef}
            label="Message"
            withAsterisk
            autosize
            minRows={6}
            maxRows={12}
            placeholder="Hi {{customer_name}}, thanks for reaching out…"
            {...form.getInputProps("content")}
          />
          <Group gap={6} mt="xs">
            <Text size="xs" c="dimmed">
              Insert:
            </Text>
            {CANNED_RESPONSE.VARIABLES.map((variable) => (
              <Button
                key={variable.key}
                variant="default"
                size="compact-xs"
                onClick={() => insertVariable(variable.key)}
              >
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
            {form.values.content ? (
              <TemplateText text={form.values.content} values={SAMPLE_VALUES} />
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

      <Switch
        label="Active"
        description="Inactive responses don't show up when agents type /."
        {...form.getInputProps("isActive", { type: "checkbox" })}
      />
    </FormModal>
  );
};

export default CannedResponseEditor;
