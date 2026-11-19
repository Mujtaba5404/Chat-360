import {
  Badge,
  Button,
  Center,
  EmptyState,
  Group,
  Select,
  Tabs,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "../notifications/showNotification";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMessageChatbot,
  IconWorld,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Page from "../components/Page";
import useFilters from "../hooks/useFilters";
import StatusBadge from "../components/StatusBadge";
import { rules } from "../utils/validation";
import { websitesStore } from "../api/website";
import InstallationTab from "../features/widgets/InstallationTab";
import {
  AppearanceTab,
  LauncherTab,
  MessagesTab,
  PrechatTab,
} from "../features/widgets/WidgetSettingsTabs";
import WidgetPreview from "../features/widgets/WidgetPreview";
import { createWidget, setActiveWidget, widgetsStore } from "../api/widget";
import WIDGET from "../constants/WIDGET";
import classes from "./WidgetEditorPage.module.css";

const HEX = /^#[0-9a-f]{6}$/i;

const EDITOR_BREADCRUMBS = [
  { label: "Widgets", to: "/widgets" },
  { label: "Editor" },
];

// Which tab holds each validated field, so failed saves reveal the first error.
const FIELD_TABS = {
  name: "appearance",
  color: "appearance",
  welcomeTitle: "messages",
  launcherText: "launcher",
};

const validate = {
  websiteId: (value) =>
    value ? null : "Choose the website this widget belongs to",
  name: rules.name("Widget name"),
  color: (value) =>
    HEX.test(value) ? null : "Use a 6-digit hex color, e.g. #5E5AE6",
  welcomeTitle: rules.required("Welcome title"),
  launcherText: (value, values) =>
    values.launcherStyle === "icon-text" && !value.trim()
      ? "Launcher text is required"
      : null,
};

const WidgetEditor = ({ widget, initialWebsiteId }) => {
  const navigate = useNavigate();
  const websites = websitesStore.useItems();
  const isNew = !widget;
  const [tab, setTab] = useState("appearance");
  const form = useForm({
    initialValues: widget ?? {
      ...WIDGET.DEFAULTS,
      websiteId: initialWebsiteId,
    },
    validate,
  });
  const dirty = form.isDirty();
  const website = websites.find((site) => site.id === form.values.websiteId);
  const active = Boolean(widget) && website?.activeWidgetId === widget.id;

  const activate = () => {
    setActiveWidget(widget);
    showNotification({
      type: "success",
      message: `${widget.name} is now live on ${website.domain}`,
    });
  };

  const submit = form.onSubmit(
    (values) => {
      const data = {
        ...values,
        name: values.name.trim(),
        updatedAt: new Date().toISOString(),
      };
      if (isNew) {
        const { record, activated } = createWidget(data);
        const domain = websitesStore.getItem(record.websiteId)?.domain;
        showNotification({
          title: "Widget created",
          message: activated
            ? `It’s the active widget on ${domain}.`
            : `Set it as active when you want ${domain} to use it.`,
        });
        navigate(`/widgets/${record.id}`, { replace: true });
        return;
      }
      widgetsStore.update(widget.id, data);
      form.setInitialValues(data);
      form.resetDirty(data);
      showNotification({ message: "Widget saved" });
    },
    (errors) => setTab(FIELD_TABS[Object.keys(errors)[0]] ?? tab),
  );

  return (
    <Page
      title={isNew ? "New widget" : widget.name}
      description="Changes appear in the preview instantly and go live when you save."
      breadcrumbs={EDITOR_BREADCRUMBS}
      actions={
        <>
          <Button
            component={Link}
            to="/widgets"
            variant="default"
            leftSection={<IconArrowLeft size={14} />}
          >
            Back
          </Button>
          <Button type="submit" form="widget-form" disabled={!isNew && !dirty}>
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
                  value: site.id,
                  label: `${site.name} · ${site.domain}`,
                }))}
                allowDeselect={false}
                w={{ base: "100%", xs: 300 }}
                {...form.getInputProps("websiteId")}
              />
            ) : (
              <Group gap="sm" wrap="nowrap" miw={0}>
                <IconWorld
                  size={16}
                  stroke={1.75}
                  className={classes.siteIcon}
                />
                <Text size="sm" fw={500} truncate>
                  {website?.domain}
                </Text>
                <StatusBadge status={active ? "active" : "inactive"} />
              </Group>
            )}
            <Group gap="sm">
              {dirty && !isNew && (
                <Badge color="yellow" variant="light">
                  Unsaved changes
                </Badge>
              )}
              {!isNew && !active && (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<IconCircleCheck size={14} />}
                  onClick={activate}
                >
                  Set as active
                </Button>
              )}
            </Group>
          </Group>
          <Tabs value={tab} onChange={setTab} keepMounted={false}>
            <Tabs.List className={classes.tabs}>
              <Tabs.Tab value="appearance">Appearance</Tabs.Tab>
              <Tabs.Tab value="messages">Messages</Tabs.Tab>
              <Tabs.Tab value="launcher">Launcher</Tabs.Tab>
              <Tabs.Tab value="prechat">Pre-chat form</Tabs.Tab>
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
              <Tabs.Panel value="installation">
                <InstallationTab widget={widget} website={website} />
              </Tabs.Panel>
            </div>
          </Tabs>
        </form>

        <aside className={classes.preview} aria-label="Live preview">
          <WidgetPreview widget={form.values} />
        </aside>
      </div>
    </Page>
  );
};

const WidgetEditorPage = () => {
  const { filters } = useFilters();
  const { widgetId } = useParams();
  const widget = widgetsStore.useItem(widgetId);

  if (widgetId !== "new" && !widget) {
    return (
      <Center h="100%" p="lg">
        <EmptyState
          size="sm"
          withIndicatorBackground
          icon={<IconMessageChatbot size={20} />}
          title="Widget not found"
          description="It may have been deleted."
        >
          <Button component={Link} to="/widgets" mt="md">
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
      widget={widget}
      initialWebsiteId={filters.website}
    />
  );
};

export default WidgetEditorPage;
