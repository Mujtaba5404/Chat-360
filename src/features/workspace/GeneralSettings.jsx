import {
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import ColorNameInput from "../../components/ColorNameInput";
import CopyAction from "../../components/CopyAction";
import PropertyList from "../../components/PropertyList";
import SettingsSection from "../../components/SettingsSection";
import StatusBadge from "../../components/StatusBadge";
import WorkspaceImageInput from "../../components/WorkspaceImageInput";
import WORKSPACE, { toWorkspaceValues } from "../../constants/WORKSPACE";
import formatDate from "../../utils/formatDate";
import SettingsForm from "./SettingsForm";
import useWorkspaceRecord from "./useWorkspaceRecord";
import { workspaceRules } from "./workspaceValidation";

const pickGeneral = (workspace) => {
  const values = toWorkspaceValues(workspace);
  return {
    image: values.image,
    title: values.title,
    description: values.description,
    email: values.email,
    website: values.website,
    industry: values.industry,
    companySize: values.companySize,
    color: values.color,
  };
};

const GeneralSettings = () => {
  const { workspace, isLoading, canUpdate, save } = useWorkspaceRecord();

  if (isLoading || !workspace)
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
      </Group>
    );

  return (
    <Stack gap="lg">
      <SettingsForm
        // Re-seed the form whenever the saved record changes.
        key={workspace.updatedAt}
        title="General"
        description={
          canUpdate
            ? "Your workspace identity across the dashboard, widget and emails."
            : "Only workspace owners can change these details."
        }
        initialValues={pickGeneral(workspace)}
        validate={{
          title: workspaceRules.title,
          email: workspaceRules.email,
          website: workspaceRules.website,
          image: workspaceRules.image,
        }}
        readOnly={!canUpdate}
        onSave={save}
      >
        {(form) => (
          <Stack gap="md">
            <WorkspaceImageInput
              workspace={workspace}
              title={form.values.title}
              color={form.values.color}
              disabled={!canUpdate}
              {...form.getInputProps("image")}
            />
            <TextInput
              label="Workspace name"
              withAsterisk
              {...form.getInputProps("title")}
            />
            <Textarea
              label="Description"
              placeholder="What this workspace is for"
              autosize
              minRows={2}
              maxRows={5}
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
            </SimpleGrid>
            <div>
              <ColorNameInput
                label="Theme color"
                {...form.getInputProps("color")}
              />
              <Text size="xs" c="dimmed" mt={6}>
                Buttons, links, highlights and borders across the app use this
                color once you save.
              </Text>
            </div>
          </Stack>
        )}
      </SettingsForm>

      <SettingsSection
        title="Workspace information"
        description="Identity and ownership of this workspace."
        action={<StatusBadge status={workspace.status} />}
      >
        <PropertyList
          items={[
            {
              label: "Workspace ID",
              value: (
                <Group gap={4} wrap="nowrap">
                  <Text size="sm" ff="monospace">
                    {workspace.slug}
                  </Text>
                  <CopyAction
                    value={workspace.slug}
                    label="Copy workspace ID"
                  />
                </Group>
              ),
            },
            {
              label: "Owner",
              value: (
                <Text size="sm" tt="capitalize">
                  {workspace.user?.name ?? "—"}
                  {workspace.user?.email && (
                    <Text span size="sm" c="dimmed" tt="none">
                      {" "}
                      · {workspace.user.email}
                    </Text>
                  )}
                </Text>
              ),
            },
            { label: "Created", value: formatDate(workspace.createdAt) },
            { label: "Last updated", value: formatDate(workspace.updatedAt) },
          ]}
        />
      </SettingsSection>
    </Stack>
  );
};

export default GeneralSettings;
