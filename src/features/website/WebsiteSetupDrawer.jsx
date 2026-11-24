import { Anchor, Badge, Button, Group, Stack, Text } from "@mantine/core";
import { IconExternalLink, IconPencil } from "@tabler/icons-react";
import CopyAction from "../../components/CopyAction";
import DetailDrawer, { DetailSection } from "../../components/DetailDrawer";
import PropertyList from "../../components/PropertyList";
import StatusBadge from "../../components/StatusBadge";
import { displayDomain } from "../../constants/WEBSITE";
import formatDate from "../../utils/formatDate";
import formatDateTime from "../../utils/formatDateTime";

const OnOff = ({ on }) => (
  <Badge variant={on ? "light" : "default"} color={on ? "green" : "gray"}>
    {on ? "On" : "Off"}
  </Badge>
);

const WebsiteSetupDrawer = ({ website, onClose, onEdit, onDelete }) => (
  <DetailDrawer
    opened={Boolean(website)}
    onClose={onClose}
    title="Website details"
    summary={
      website && (
        <Stack gap={6}>
          <Group gap="xs">
            <Text fw={600} size="md">
              {website.title}
            </Text>
            <StatusBadge status={website.status} />
            <StatusBadge status={website.verificationStatus} variant="light" />
          </Group>
          <Anchor
            href={website.domain}
            target="_blank"
            rel="noreferrer"
            size="sm"
            c="dimmed"
          >
            {displayDomain(website.domain)}{" "}
            <IconExternalLink size={12} style={{ verticalAlign: -1 }} />
          </Anchor>
        </Stack>
      )
    }
    footer={
      website && (
        <>
          <Button
            variant="subtle"
            color="red"
            mr="auto"
            onClick={() => onDelete(website)}
          >
            Delete
          </Button>
          <Button
            variant="default"
            leftSection={<IconPencil size={14} />}
            onClick={() => onEdit(website)}
          >
            Edit
          </Button>
        </>
      )
    }
  >
    {website && (
      <>
        <DetailSection title="Allowed domains">
          {website.allowedDomains?.length ? (
            <Group gap={6}>
              {website.allowedDomains.map((domain) => (
                <Badge key={domain} variant="default" tt="none">
                  {displayDomain(domain)}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              Only {displayDomain(website.domain)}.
            </Text>
          )}
        </DetailSection>

        <DetailSection title="Settings">
          <PropertyList
            items={[
              {
                label: "Enforce origin check",
                value: <OnOff on={website.settings?.enforceOriginCheck} />,
              },
              {
                label: "Collect visitor location",
                value: <OnOff on={website.settings?.collectVisitorLocation} />,
              },
            ]}
          />
        </DetailSection>

        <DetailSection title="Verification">
          <PropertyList
            items={[
              {
                label: "Status",
                value: <StatusBadge status={website.verificationStatus} />,
              },
              website.verificationMethod && {
                label: "Method",
                value: website.verificationMethod,
              },
              {
                label: "Verified",
                value: website.verifiedAt
                  ? formatDateTime(website.verifiedAt)
                  : "Not yet",
              },
              website.lastVerificationAttemptAt && {
                label: "Last attempt",
                value: formatDateTime(website.lastVerificationAttemptAt),
              },
              website.lastVerificationError && {
                label: "Last error",
                value: (
                  <Text size="sm" c="red">
                    {website.lastVerificationError}
                  </Text>
                ),
              },
            ].filter(Boolean)}
          />
        </DetailSection>

        <DetailSection title="Details">
          <PropertyList
            items={[
              {
                label: "Website ID",
                value: (
                  <Group gap={4} wrap="nowrap">
                    <Text size="sm" ff="monospace">
                      {website._id}
                    </Text>
                    <CopyAction value={website._id} label="Copy website ID" />
                  </Group>
                ),
              },
              { label: "Added", value: formatDate(website.createdAt) },
              { label: "Last updated", value: formatDate(website.updatedAt) },
            ]}
          />
        </DetailSection>
      </>
    )}
  </DetailDrawer>
);

export default WebsiteSetupDrawer;
