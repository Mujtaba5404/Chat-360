import { Badge, Group, Switch, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCreateTagMutation, useUpdateTagMutation } from "../../api/tag";
import FormModal from "../../components/FormModal";
import ColorNameInput from "../../components/ColorNameInput";
import { safeColor } from "../../constants/COLORS";
import TAG, { toTagPayload, toTagValues } from "../../constants/TAG";

/** Case-insensitive duplicate check against the workspace's other tags. */
const isTaken = (title, tags, tag) =>
  tags.some(
    (item) =>
      item._id !== tag?._id &&
      item.title.trim().toLowerCase() === title.trim().toLowerCase(),
  );

const TagFormModal = ({ tag, tags, onClose }) => {
  const isEdit = Boolean(tag);
  const createMutation = useCreateTagMutation();
  const updateMutation = useUpdateTagMutation();
  const form = useForm({
    initialValues: toTagValues(tag),
    validate: {
      title: (value) => {
        if (!value.trim()) return "Tag name is required";
        if (value.trim().length > TAG.TITLE_MAX)
          return `Use at most ${TAG.TITLE_MAX} characters`;
        return isTaken(value, tags, tag) ? "A tag with this name exists" : null;
      },
    },
  });
  const { title, color } = form.values;

  const submit = form.onSubmit((values) => {
    const payload = toTagPayload(values, tag);
    const options = { onSuccess: onClose };

    if (isEdit) updateMutation.mutate({ id: tag._id, ...payload }, options);
    else createMutation.mutate(payload, options);
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={isEdit ? "Edit tag" : "New tag"}
      submitLabel={isEdit ? "Save changes" : "Create tag"}
      loading={createMutation.isPending || updateMutation.isPending}
      onSubmit={submit}
    >
      <TextInput
        label="Tag name"
        placeholder="billing"
        description="Agents add it to conversations to group and find them."
        withAsterisk
        data-autofocus
        maxLength={TAG.TITLE_MAX}
        {...form.getInputProps("title")}
      />
      <ColorNameInput
        value={color}
        onChange={(value) => form.setFieldValue("color", value)}
      />
      <Textarea
        label="Description"
        placeholder="When to use this tag"
        autosize
        minRows={2}
        maxRows={4}
        maxLength={TAG.DESCRIPTION_MAX}
        {...form.getInputProps("description")}
      />
      <Switch
        label="Active"
        description="Inactive tags stay on past conversations but can't be added to new ones."
        {...form.getInputProps("isActive", { type: "checkbox" })}
      />
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          Preview
        </Text>
        <Badge color={safeColor(color)} variant="light" tt="none">
          {title.trim() || "tag name"}
        </Badge>
      </Group>
    </FormModal>
  );
};

export default TagFormModal;
