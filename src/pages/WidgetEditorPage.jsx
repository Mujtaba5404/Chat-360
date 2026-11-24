import {
  Badge,
  Button,
  Center,
  EmptyState,
  Group,
  Loader,
  Select,
  Switch,
  Tabs,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconMessageChatbot,
  IconWorld,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetAllWebsitesQuery } from "../api/website";
import {
  useCreateWidgetMutation,
  useGetAllWidgetsQuery,
  useGetWidgetQuery,
  useUpdateWidgetMutation,
} from "../api/widget";
import Page from "../components/Page";
import StatusBadge from "../components/StatusBadge";
import WebsiteLogo from "../components/WebsiteLogo";
import WorkspaceLink from "../components/WorkspaceLink";
import {
  isHexColor,
  isUrl,
  toWidgetPayload,
  toWidgetValues,
  widgetWebsiteId,
} from "../constants/WIDGET";
import InstallationTab from "../features/widgets/InstallationTab";
import WidgetPreview from "../features/widgets/WidgetPreview";
import {
  AppearanceTab,
  BusinessHoursTab,
  LauncherTab,
  MessagesTab,
  PrechatTab,
} from "../features/widgets/WidgetSettingsTabs";
import useFilters from "../hooks/useFilters";
import useWorkspacePath from "../hooks/useWorkspacePath";
import { normalizeDomain } from "../utils/validation";
import classes from "./WidgetEditorPage.module.css";

const EDITOR_BREADCRUMBS = [
  { label: "Widgets", to: "/widgets" },
  { label: "Editor" },
];
const NO_WEBSITES = [];

// Which tab holds each validated field, so a failed save reveals the first error.
const FIELD_TABS = [
  ["settings.header.title", "messages"],
  ["settings.header.subtitle", "messages"],
  ["settings.message", "messages"],
  ["settings.launcher", "launcher"],
  ["settings.style.launcherColor", "launcher"],
  ["settings.style.offset", "launcher"],
  ["settings.businessHours", "hours"],
  ["prechatFields", "prechat"],
  ["settings.", "appearance"],
  ["title", "appearance"],
];
const tabFor = (field) =>
  FIELD_TABS.find(([prefix]) => field.startsWith(prefix))?.[1];

const isOffset = (value) =>
  Number.isInteger(value) && value >= 0 && value <= 200;

const validate = (values) => {
  const { settings } = values;
  const { style, header, message, launcher, branding } = settings;
  const errors = {};
  const title = values.title.trim();
  const url = (key, value) => {
    if (value.trim() && !isUrl(value.trim()))
      errors[key] = "Enter a full URL, e.g. https://example.com/image.png";
  };
  const required = (key, value, label) => {
    if (!value.trim()) errors[key] = `${label} is required`;
  };

  if (!values.website)
    errors.website = "Choose the website this widget belongs to";
  if (title.length < 2 || title.length > 80)
    errors.title = "Widget name must be 2–80 characters";
  for (const key of ["primaryColor", "textColor", "launcherColor"])
    if (!isHexColor(style[key]))
      errors[`settings.style.${key}`] = "Use a 6-digit hex color, e.g. #2563EB";
  for (const key of ["offsetX", "offsetY"])
    if (!isOffset(style[key])) errors[`settings.style.${key}`] = "Use 0–200 px";
  url("settings.header.logo", header.logo);
  url("settings.header.avatar", header.avatar);
  required("settings.header.title", header.title, "Header title");
  required("settings.header.subtitle", header.subtitle, "Header subtitle");
  required("settings.message.welcome", message.welcome, "Welcome message");
  required("settings.message.offline", message.offline, "Offline message");
  if (launcher.textEnabled)
    required("settings.launcher.text", launcher.text, "Launcher text");
  if (branding.showBranding) {
    required("settings.branding.text", branding.text, "Branding text");
    url("settings.branding.url", branding.url);
    url("settings.branding.logo", branding.logo);
  }

  if (settings.preChatForm.enabled) {
    const shown = values.prechatFields.filter((field) => field.enabled);
    if (!shown.length) errors.prechatFields = "Show at least one field";
    values.prechatFields.forEach((field, index) => {
      if (field.enabled && !field.label.trim())
        errors[`prechatFields.${index}.label`] = "Label is required";
    });
  }

  const { businessHours } = settings;
  if (
    businessHours.enabled &&
    Object.values(businessHours.days).some(
      (day) => day.enabled && day.from >= day.to,
    )
  )
    errors["settings.businessHours.days"] =
      "Closing time must be after opening time";

  return errors;
};

// A website shows one active widget; activating another switches the current one off
// (the backend does this). So a new widget starts active only on a website without one.
const initialValuesFor = (widget, websites, widgets, initialWebsiteId) => {
  if (widget) return toWidgetValues(widget);

  const websiteId =
    initialWebsiteId ?? (websites.length === 1 ? websites[0]._id : null);
  const values = toWidgetValues(null, websiteId);
  values.isActive = !widgets.some(
    (item) => item.isActive && widgetWebsiteId(item) === websiteId,
  );
  return values;
};

const WidgetEditor = ({ widget, websites, widgets, initialWebsiteId }) => {
  const navigate = useNavigate();
  const toWorkspace = useWorkspacePath();
  const createMutation = useCreateWidgetMutation();
  const updateMutation = useUpdateWidgetMutation();
  const isNew = !widget;
  const [tab, setTab] = useState("appearance");
  const form = useForm({
    initialValues: initialValuesFor(
      widget,
      websites,
      widgets,
      initialWebsiteId,
    ),
    validate,
  });
  const dirty = form.isDirty();
  const website =
    websites.find((site) => site._id === form.values.website) ??
    (widget?.website?._id ? widget.website : null);

  const submit = form.onSubmit(
    (values) => {
      const payload = toWidgetPayload(values);

      if (isNew) {
        createMutation.mutate(
          { website: values.website, ...payload },
          {
            onSuccess: (data) => {
              const created = data?.data ?? data;
              navigate(
                toWorkspace(
                  created?._id ? `/widgets/${created._id}` : "/widgets",
                ),
                { replace: true },
              );
            },
          },
        );
        return;
      }
      updateMutation.mutate(
        { id: widget._id, ...payload },
        { onSuccess: () => form.resetDirty() },
      );
    },
    (errors) => setTab(tabFor(Object.keys(errors)[0]) ?? tab),
  );

  return (
    <Page
      title={isNew ? "New widget" : widget.title}
      description="Changes appear in the preview instantly and go live when you save."
      breadcrumbs={EDITOR_BREADCRUMBS}
      actions={
        <>
          <Button
            component={WorkspaceLink}
            to="/widgets"
            variant="default"
            leftSection={<IconArrowLeft size={14} />}
          >
            Back
          </Button>
          <Button
            type="submit"
            form="widget-form"
            disabled={!isNew && !dirty}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isNew ? "Create widget" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className={classes.layout}>
        <form
          id="widget-form"
          onSubmit={submit}
          noValidate
          className={classes.editor}
        >
          <Group justify="space-between" className={classes.status}>
            {isNew ? (
              <Select
                aria-label="Website"
                placeholder="Choose a website"
                leftSection={<IconWorld size={14} stroke={1.75} />}
                data={websites.map((site) => ({
                  value: site._id,
                  label: `${site.title} · ${normalizeDomain(site.domain)}`,
                }))}
                allowDeselect={false}
                w={{ base: "100%", xs: 300 }}
                {...form.getInputProps("website")}
              />
            ) : (
              <Group gap="sm" wrap="nowrap" miw={0}>
                <WebsiteLogo domain={website?.domain} size={24} />
                <Text size="sm" fw={500} truncate>
                  {website
                    ? normalizeDomain(website.domain)
                    : "Unknown website"}
                </Text>
                <StatusBadge status={widget.isActive ? "active" : "inactive"} />
              </Group>
            )}
            <Group gap="sm">
              {dirty && !isNew && (
                <Badge color="yellow" variant="light">
                  Unsaved changes
                </Badge>
              )}
              <Switch
                label="Active"
                {...form.getInputProps("isActive", { type: "checkbox" })}
              />
            </Group>
          </Group>
          <Tabs value={tab} onChange={setTab} keepMounted={false}>
            <Tabs.List className={classes.tabs}>
              <Tabs.Tab value="appearance">Appearance</Tabs.Tab>
              <Tabs.Tab value="messages">Messages</Tabs.Tab>
              <Tabs.Tab value="launcher">Launcher</Tabs.Tab>
              <Tabs.Tab value="prechat">Pre-chat form</Tabs.Tab>
              <Tabs.Tab value="hours">Business hours</Tabs.Tab>
              <Tabs.Tab value="installation">Installation</Tabs.Tab>
            </Tabs.List>
            <div className={classes.panel}>
              <Tabs.Panel value="appearance">
                <AppearanceTab form={form} />
              </Tabs.Panel>
              <Tabs.Panel value="messages">
                <MessagesTab form={form} />
              </Tabs.Panel>
              <Tabs.Panel value="launcher">
                <LauncherTab form={form} />
              </Tabs.Panel>
              <Tabs.Panel value="prechat">
                <PrechatTab form={form} />
              </Tabs.Panel>
              <Tabs.Panel value="hours">
                <BusinessHoursTab form={form} />
              </Tabs.Panel>
              <Tabs.Panel value="installation">
                <InstallationTab widget={widget} website={website} />
              </Tabs.Panel>
            </div>
          </Tabs>
        </form>

        <aside className={classes.preview} aria-label="Live preview">
          <WidgetPreview values={form.values} />
        </aside>
      </div>
    </Page>
  );
};

const WidgetEditorPage = () => {
  const { filters } = useFilters();
  const { widgetId } = useParams();
  const isNew = widgetId === "new";
  const widgetQuery = useGetWidgetQuery(widgetId);
  const { data: widgets = NO_WEBSITES, isLoading: widgetsLoading } =
    useGetAllWidgetsQuery();
  const { data: websites = NO_WEBSITES, isLoading: websitesLoading } =
    useGetAllWebsitesQuery();

  if (websitesLoading || widgetsLoading || (!isNew && widgetQuery.isLoading)) {
    return (
      <Center h="100%" p="lg">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!isNew && !widgetQuery.data?._id) {
    return (
      <Center h="100%" p="lg">
        <EmptyState
          size="sm"
          withIndicatorBackground
          icon={<IconMessageChatbot size={20} />}
          title="Widget not found"
          description="It may have been deleted."
        >
          <Button component={WorkspaceLink} to="/widgets" mt="md">
            All widgets
          </Button>
        </EmptyState>
      </Center>
    );
  }

  // Remount per widget so the form re-initializes when navigating between widgets.
  return (
    <WidgetEditor
      key={widgetId}
      widget={isNew ? null : widgetQuery.data}
      websites={websites}
      widgets={widgets}
      initialWebsiteId={filters.website}
    />
  );
};

export default WidgetEditorPage;
