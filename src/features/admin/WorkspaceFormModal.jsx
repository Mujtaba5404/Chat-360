import {
  Select,
  SimpleGrid,
  TagsInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  useCreateWorkspaceMutation,
  useUpdateAdminWorkspaceMutation,
} from "src/api/admin";
import FormModal from "src/components/FormModal";
import WorkspaceImageInput from "src/components/WorkspaceImageInput";
import WORKSPACE, {
  toWorkspacePayload,
  toWorkspaceValues,
} from "src/constants/WORKSPACE";
import ColorNameInput from "../../components/ColorNameInput";
import { workspaceRules } from "../workspace/workspaceValidation";

/** Super admin: create a workspace, or edit any workspace's record. */
const WorkspaceFormModal = ({ workspace, onClose }) => {
  const createMutation = useCreateWorkspaceMutation();
  const updateMutation = useUpdateAdminWorkspaceMutation();
  const form = useForm({
    initialValues: toWorkspaceValues(workspace),
    validate: workspaceRules,
  });

  const submit = form.onSubmit(({ image, ...values }) => {
    const payload = toWorkspacePayload(values, workspace);
    const options = { onSuccess: onClose };

    if (workspace)
      updateMutation.mutate({ payload, image, workspace }, options);
    else createMutation.mutate({ payload, image }, options);
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={workspace ? "Edit workspace" : "Create workspace"}
      submitLabel={workspace ? "Save changes" : "Create workspace"}
      size="lg"
      loading={createMutation.isPending || updateMutation.isPending}
      onSubmit={submit}
    >
      <WorkspaceImageInput
        workspace={workspace}
        title={form.values.title}
        color={form.values.color}
        {...form.getInputProps("image")}
      />
      <TextInput
        label="Workspace name"
        placeholder="Acme Support"
        withAsterisk
        data-autofocus
        {...form.getInputProps("title")}
      />
      <Textarea
        label="Description"
        placeholder="What this workspace is for"
        autosize
        minRows={2}
        maxRows={4}
        {...form.getInputProps("description")}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Contact email"
          type="email"
          placeholder="support@company.com"
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Website"
          placeholder="https://www.company.com"
          {...form.getInputProps("website")}
        />
        <Select
          label="Industry"
          placeholder="Choose an industry"
          data={WORKSPACE.INDUSTRIES}
          {...form.getInputProps("industry")}
        />
        <Select
          label="Company size"
          placeholder="Choose a size"
          data={WORKSPACE.COMPANY_SIZES}
          {...form.getInputProps("companySize")}
        />
        <Select
          label="Status"
          data={WORKSPACE.STATUSES}
          {...form.getInputProps("status")}
        />
        <Select
          label="Timezone"
          data={WORKSPACE.TIMEZONES}
          searchable
          {...form.getInputProps("timezone")}
        />
        <Select
          label="Currency"
          data={WORKSPACE.CURRENCIES}
          searchable
          {...form.getInputProps("currency")}
        />
        <Select
          label="Locale"
          data={WORKSPACE.LOCALES}
          searchable
          {...form.getInputProps("locale")}
        />
      </SimpleGrid>
      <TagsInput
        label="Allowed IPs"
        description="Only these IP addresses or CIDR ranges can open the dashboard. Leave empty to allow all."
        placeholder="e.g. 203.0.113.0/24 — press Enter to add"
        clearable
        splitChars={[",", " "]}
        {...form.getInputProps("allowedIPs")}
      />
      <ColorNameInput label="Theme color" {...form.getInputProps("color")} />
    </FormModal>
  );
};

export default WorkspaceFormModal;
