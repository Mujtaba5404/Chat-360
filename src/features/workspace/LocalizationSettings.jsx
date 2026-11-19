import { Select, SimpleGrid, Stack } from "@mantine/core";
import { saveSettings, useWorkspaceSettings } from "../../api/workspace";
import { languages, timezones } from "../../mocks/workspace";
import SettingsForm from "./SettingsForm";

const DATE_FORMATS = [
  {
    value: "MMM D, YYYY",
    label: "Jan 31, 2026",
    options: { month: "short", day: "numeric", year: "numeric" },
    locale: "en-US",
  },
  {
    value: "DD/MM/YYYY",
    label: "31/01/2026",
    options: { day: "2-digit", month: "2-digit", year: "numeric" },
    locale: "en-GB",
  },
  {
    value: "MM/DD/YYYY",
    label: "01/31/2026",
    options: { month: "2-digit", day: "2-digit", year: "numeric" },
    locale: "en-US",
  },
  {
    value: "YYYY-MM-DD",
    label: "2026-01-31",
    options: { year: "numeric", month: "2-digit", day: "2-digit" },
    locale: "sv-SE",
  },
];

const WEEK_STARTS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "saturday", label: "Saturday" },
];

const LocalizationSettings = () => {
  const localization = useWorkspaceSettings("localization");

  return (
    <SettingsForm
      title="Localization"
      description="Default language, timezone and formats for your workspace and reports."
      initialValues={localization}
      onSave={(values) => saveSettings("localization", values)}
    >
      {(form) => (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select label="Default language" data={languages} {...form.getInputProps("language")}/>
            <Select label="Timezone" data={timezones} searchable {...form.getInputProps("timezone")}/>
            <Select label="Date format" data={DATE_FORMATS.map(({ value, label }) => ({ value, label }))} {...form.getInputProps("dateFormat")}/>
            <Select label="First day of week" data={WEEK_STARTS} {...form.getInputProps("weekStart")}/>
          </SimpleGrid>
        </Stack>
      )}
    </SettingsForm>
  );
};

export default LocalizationSettings;