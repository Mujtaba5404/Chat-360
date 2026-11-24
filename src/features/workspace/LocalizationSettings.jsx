import { Group, Loader, Select, SimpleGrid } from "@mantine/core";
import WORKSPACE, { toWorkspaceValues } from "../../constants/WORKSPACE";
import SettingsForm from "./SettingsForm";
import useWorkspaceRecord from "./useWorkspaceRecord";

const pickLocalization = (workspace) => {
  const { timezone, currency, locale } = toWorkspaceValues(workspace);
  return { timezone, currency, locale };
};

const LocalizationSettings = () => {
  const { workspace, isLoading, canUpdate, save } = useWorkspaceRecord();

  if (isLoading || !workspace)
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
      </Group>
    );

  return (
    <SettingsForm
      key={workspace.updatedAt}
      title="Localization"
      description="Default timezone, currency and locale for your workspace and reports."
      initialValues={pickLocalization(workspace)}
      readOnly={!canUpdate}
      onSave={save}
    >
      {(form) => (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Timezone"
            data={WORKSPACE.TIMEZONES}
            searchable
            allowDeselect={false}
            {...form.getInputProps("timezone")}
          />
          <Select
            label="Currency"
            data={WORKSPACE.CURRENCIES}
            searchable
            allowDeselect={false}
            {...form.getInputProps("currency")}
          />
          <Select
            label="Locale"
            data={WORKSPACE.LOCALES}
            searchable
            allowDeselect={false}
            {...form.getInputProps("locale")}
          />
        </SimpleGrid>
      )}
    </SettingsForm>
  );
};

export default LocalizationSettings;
