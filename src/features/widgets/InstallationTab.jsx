import {
  Alert,
  Anchor,
  ColorSwatch,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";
import { useGetAllWidgetsQuery } from "../../api/widget";
import CodeBlock from "../../components/CodeBlock";
import StatusBadge from "../../components/StatusBadge";
import WorkspaceLink from "../../components/WorkspaceLink";
import { widgetWebsiteId } from "../../constants/WIDGET";
import getInstallSnippet from "../../utils/getInstallSnippet";
import { normalizeDomain } from "../../utils/validation";
import classes from "./InstallationTab.module.css";

const NO_WIDGETS = [];

const InstallationTab = ({ widget, website }) => {
  const [platform, setPlatform] = useState("html");
  const { data: widgets = NO_WIDGETS } = useGetAllWidgetsQuery();

  if (!widget?.publicKey || !website) {
    return (
      <Alert
        variant="light"
        icon={<IconInfoCircle size={16} />}
        title="Create the widget first"
      >
        The installation code becomes available once the widget is saved to a
        website.
      </Alert>
    );
  }

  const domain = normalizeDomain(website.domain);
  const siblings = widgets.filter((w) => widgetWebsiteId(w) === website._id);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Add this snippet to <b>{domain}</b> before the closing{" "}
        <code>&lt;/body&gt;</code> tag. It loads this widget by its public key
        and shows it while the widget is active.
      </Text>
      <SegmentedControl
        value={platform}
        onChange={setPlatform}
        data={[
          { value: "html", label: "HTML" },
          { value: "react", label: "React / Next.js" },
        ]}
        w="fit-content"
      />
      <CodeBlock
        code={getInstallSnippet(widget.publicKey, platform)}
        label={platform === "html" ? "HTML" : "JSX"}
      />

      <div>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Widgets on {domain}
          </Text>
          <Anchor
            component={WorkspaceLink}
            to={`/widgets?website=${website._id}`}
            size="xs"
          >
            Manage
          </Anchor>
        </Group>
        <div className={classes.list}>
          {siblings.map((item) => (
            <Group
              key={item._id}
              justify="space-between"
              wrap="nowrap"
              className={classes.row}
            >
              <Group gap="sm" wrap="nowrap" miw={0}>
                <ColorSwatch
                  color={item.settings?.style?.primaryColor}
                  size={12}
                  withShadow={false}
                />
                <Text
                  size="sm"
                  fw={item._id === widget._id ? 600 : 400}
                  truncate
                >
                  {item.title}
                  {item._id === widget._id && (
                    <Text span size="xs" c="dimmed" fw={400}>
                      {" "}
                      · this widget
                    </Text>
                  )}
                </Text>
              </Group>
              <StatusBadge status={item.isActive ? "active" : "inactive"} />
            </Group>
          ))}
        </div>
      </div>
    </Stack>
  );
};

export default InstallationTab;
