import { Badge, Button, Group, Stack, Text, Timeline } from "@mantine/core";
import {
  IconBrowser,
  IconClock,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconEye,
  IconLink,
  IconMail,
  IconMessage,
  IconPointer,
  IconWorldWww,
} from "@tabler/icons-react";
import DetailDrawer, { DetailSection } from "../../components/DetailDrawer";
import PropertyList from "../../components/PropertyList";
import StatusBadge from "../../components/StatusBadge";
import UserAvatar from "../../components/UserAvatar";
import useNow from "../../hooks/useNow";
import formatDate from "../../utils/formatDate";
import formatRelative from "../../utils/formatRelative";
import { useActiveConversationId } from "../../api/chat";
import { visitorKind, visitorName } from "../../api/visitor";
import SessionDuration from "./SessionDuration";

/** Pages and events merged into a single newest-first timeline. */
// const buildTimeline = (visitor) =>
//   [
//     ...visitor.pages.map((page) => ({
//       kind: "page",
//       at: page.at,
//       title: page.title,
//       detail: page.path,
//     })),
//     ...visitor.events.map((event) => ({
//       kind: "event",
//       at: event.at,
//       title: event.label,
//     })),
//   ].sort((a, b) => b.at.localeCompare(a.at));

const VisitorDrawer = ({ visitor, onClose, onStartConversation }) => {
  const now = useNow();
  const activeConversationId = useActiveConversationId(visitor?.contactId);
  const DeviceIcon =
    visitor?.device === "Mobile" ? IconDeviceMobile : IconDeviceDesktop;

  return (
    <DetailDrawer
      opened={Boolean(visitor)}
      onClose={onClose}
      title="Visitor"
      summary={
        visitor && (
          <Group gap="md" wrap="nowrap" align="flex-start">
            <UserAvatar
              name={visitorName(visitor)}
              presence={visitor.status}
              size={44}
            />
            <Stack gap={4} miw={0}>
              <Text fw={600} size="md" truncate>
                {visitorName(visitor)}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {visitor.city}, {visitor.country} · {visitor.website}
              </Text>
              <Group gap={6} mt={4}>
                <StatusBadge status={visitor.status} />
                <Badge variant="default">
                  {visitorKind(visitor) === "identified"
                    ? "Identified"
                    : "Anonymous"}
                </Badge>
              </Group>
            </Stack>
          </Group>
        )
      }
      footer={
        visitor && (
          <Button
            leftSection={<IconMessage size={14} />}
            onClick={() => onStartConversation(visitor)}
          >
            {activeConversationId ? "Open conversation" : "Start conversation"}
          </Button>
        )
      }
    >
      {visitor && (
        <>
          <DetailSection title="Session">
            <PropertyList
              items={[
                {
                  label:
                    visitor.status === "left" ? "Last page" : "Current page",
                  icon: IconPointer,
                  value: visitor.pages[0]?.path,
                },
                { label: "Referrer", icon: IconLink, value: visitor.referrer },
                {
                  label: "Session length",
                  icon: IconClock,
                  value: <SessionDuration visitor={visitor} />,
                },
                {
                  label: "Pages viewed",
                  icon: IconEye,
                  value: String(visitor.pages.length),
                },
              ]}
            />
          </DetailSection>

          <DetailSection title="Device">
            <PropertyList
              items={[
                { label: "Browser", icon: IconBrowser, value: visitor.browser },
                {
                  label: "OS",
                  icon: DeviceIcon,
                  value: `${visitor.os} · ${visitor.device}`,
                },
                { label: "IP address", icon: IconWorldWww, value: visitor.ip },
              ]}
            />
          </DetailSection>

          <DetailSection title="History">
            <PropertyList
              items={[
                { label: "Email", icon: IconMail, value: visitor.email },
                { label: "First seen", value: formatDate(visitor.firstSeenAt) },
                {
                  label: "Last seen",
                  value:
                    visitor.status === "left"
                      ? formatRelative(visitor.lastSeenAt, now)
                      : "Now",
                },
                { label: "Total visits", value: String(visitor.visits) },
              ]}
            />
          </DetailSection>

          {/* <DetailSection title="Activity">
            <Timeline bulletSize={10} lineWidth={1} active={0}>
              {buildTimeline(visitor).map((item) => (
                <Timeline.Item
                  key={`${item.kind}-${item.at}-${item.title}`}
                  title={
                    <Text size="sm" fw={500}>
                      {item.title}
                    </Text>
                  }
                >
                  <Text size="xs" c="dimmed">
                    {item.detail && `${item.detail} · `}
                    {formatRelative(item.at, now)}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </DetailSection> */}
        </>
      )}
    </DetailDrawer>
  );
};

export default VisitorDrawer;