import {
  Accordion,
  ActionIcon,
  Badge,
  Group,
  Select,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBrowser,
  IconBuilding,
  IconClock,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPointer,
  IconWorldWww,
  IconX,
} from "@tabler/icons-react";
import CopyAction from "../../components/CopyAction";
import PropertyList from "../../components/PropertyList";
import StatusBadge from "../../components/StatusBadge";
import UserAvatar from "../../components/UserAvatar";
import useNow from "../../hooks/useNow";
import formatListTime from "../../utils/formatListTime";
import { useTeams } from "../../api/workspace";
import { PRIORITY_OPTIONS } from "../../constants/STATUS";
import {
  assignConversation,
  getLastActivity,
  getLastMessage,
  setConversationPriority,
} from "../../api/chat";
import classes from "./ContactPanel.module.css";

const localTime = (timezone, now) => {
  if (!timezone) return null;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(now);
};

/** Right-hand customer context: conversation settings, profile, device and history. */
const ContactPanel = ({
  conversation,
  contact,
  history,
  agents,
  currentUser,
  onOpenConversation,
  onClose,
}) => {
  const teams = useTeams();
  const now = useNow();
  const DeviceIcon =
    contact.device === "Mobile" ? IconDeviceMobile : IconDeviceDesktop;

  const assign = (agentId) => {
    const agent = agents.find((a) => a.id === agentId) ?? null;
    assignConversation(conversation.id, agent, currentUser.name);
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Text fw={600} size="sm">
          Customer details
        </Text>
        <ActionIcon onClick={onClose} aria-label="Close details">
          <IconX size={16} />
        </ActionIcon>
      </div>

      <div className={classes.scroll}>
        <div className={classes.profile}>
          <UserAvatar
            name={contact.name}
            presence={contact.online ? "online" : "offline"}
            size={44}
          />
          <div style={{ minWidth: 0 }}>
            <Text fw={600} truncate>
              {contact.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {contact.company || "No company"}
            </Text>
            <Group gap={6} mt={6}>
              <StatusBadge status={contact.online ? "online" : "offline"} />
              {contact.attributes.Plan && (
                <Badge variant="light">{contact.attributes.Plan}</Badge>
              )}
            </Group>
          </div>
        </div>

        <Accordion
          multiple
          defaultValue={["conversation", "contact", "device", "history"]}
          classNames={{
            item: classes.item,
            control: classes.control,
            content: classes.content,
            label: classes.label,
          }}
        >
          <Accordion.Item value="conversation">
            <Accordion.Control>Conversation</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Select
                  label="Assignee"
                  placeholder="Unassigned"
                  data={agents.map((agent) => ({
                    value: agent.id,
                    label: agent.name,
                  }))}
                  value={conversation.assigneeId}
                  onChange={assign}
                  clearable
                  searchable
                  size="xs"
                />
                <Select
                  label="Priority"
                  placeholder="No priority"
                  data={PRIORITY_OPTIONS}
                  value={conversation.priority}
                  onChange={(value) =>
                    setConversationPriority(conversation.id, value)
                  }
                  clearable
                  size="xs"
                />
                <PropertyList
                  items={[
                    {
                      label: "Team",
                      value: teams.find((t) => t.id === conversation.team)
                        ?.name,
                    },
                    { label: "Channel", value: conversation.channel },
                    {
                      label: "Tags",
                      value: conversation.tags.length
                        ? conversation.tags.map((tag) => `#${tag}`).join("  ")
                        : null,
                    },
                  ]}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="contact">
            <Accordion.Control>Contact</Accordion.Control>
            <Accordion.Panel>
              <PropertyList
                items={[
                  {
                    label: "Email",
                    icon: IconMail,
                    value: contact.email && (
                      <Group gap={2} wrap="nowrap">
                        <Text size="sm" truncate>
                          {contact.email}
                        </Text>
                        <CopyAction value={contact.email} label="Copy email" />
                      </Group>
                    ),
                  },
                  { label: "Phone", icon: IconPhone, value: contact.phone },
                  {
                    label: "Company",
                    icon: IconBuilding,
                    value: contact.company,
                  },
                  {
                    label: "Location",
                    icon: IconMapPin,
                    value: [contact.city, contact.country]
                      .filter(Boolean)
                      .join(", "),
                  },
                  {
                    label: "Local time",
                    icon: IconClock,
                    value: localTime(contact.timezone, now),
                  },
                ]}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="device">
            <Accordion.Control>Browser & device</Accordion.Control>
            <Accordion.Panel>
              <PropertyList
                items={[
                  {
                    label: "Browser",
                    icon: IconBrowser,
                    value: contact.browser,
                  },
                  {
                    label: "OS",
                    icon: DeviceIcon,
                    value: `${contact.os} · ${contact.device}`,
                  },
                  {
                    label: "IP address",
                    icon: IconWorldWww,
                    value: contact.ip,
                  },
                  {
                    label: "Current page",
                    icon: IconPointer,
                    value: contact.online ? contact.currentPage : null,
                  },
                ]}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="history">
            <Accordion.Control>
              Previous conversations ({history.length})
            </Accordion.Control>
            <Accordion.Panel>
              {history.length ? (
                <Stack gap={4}>
                  {history.map((item) => (
                    <UnstyledButton
                      key={item.id}
                      className={classes.history}
                      onClick={() => onOpenConversation(item.id)}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <StatusBadge status={item.status} size="xs" />
                        <Text size="xs" c="dimmed">
                          {formatListTime(getLastActivity(item), now)}
                        </Text>
                      </Group>
                      <Text size="xs" lineClamp={2} mt={4}>
                        {getLastMessage(item)?.body}
                      </Text>
                    </UnstyledButton>
                  ))}
                </Stack>
              ) : (
                <Text size="xs" c="dimmed">
                  This is their first conversation.
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

export default ContactPanel;
