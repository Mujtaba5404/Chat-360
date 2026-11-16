import { Alert, Anchor, Button, Group, Select, Stack, Text, Timeline } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconExternalLink, IconPencil, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import CodeBlock from '../../../components/ui/CodeBlock';
import DetailDrawer, { DetailSection } from '../../../components/ui/DetailDrawer';
import PropertyList from '../../../components/ui/PropertyList';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDate, formatNumber, formatRelative } from '../../../lib/format';
import { platforms } from '../../../mocks/websites';
import { setActiveWidget, widgetsStore } from '../../widgets/store';
import { getInstallSnippet, verifyWebsite } from '../store';

const PLATFORM_STEPS = {
  html: 'Paste the snippet right before the closing </body> tag on every page.',
  react: 'Add the snippet to your root layout so it loads on every route.',
  wordpress: 'In WordPress, open Appearance → Theme File Editor → footer.php and paste the snippet before </body>.',
  shopify: 'In Shopify, open Online Store → Themes → Edit code → theme.liquid and paste the snippet before </body>.',
};

export default function WebsiteSetupDrawer({ website, onClose, onEdit, onDelete }) {
  const allWidgets = widgetsStore.useItems();
  const [verifying, setVerifying] = useState(false);
  const widgets = allWidgets.filter((w) => w.websiteId === website?.id);
  const widget = widgets.find((w) => w.id === website?.activeWidgetId);
  const verified = website?.verification === 'verified';
  const activeStep = !widget ? 0 : verified ? 3 : 1;

  const changeWidget = (widgetId) => {
    const next = widgets.find((w) => w.id === widgetId);
    setActiveWidget(next);
    notifications.show({ color: 'green', message: `${next.name} is now live on ${website.domain}` });
  };

  const verify = async () => {
    setVerifying(true);
    const result = await verifyWebsite(website.id);
    setVerifying(false);
    notifications.show(
      result === 'verified'
        ? { color: 'green', title: 'Installation verified', message: `${website.domain} is connected.` }
        : { color: 'red', title: 'Widget not detected', message: 'Set an active widget and check that the snippet is published.' },
    );
  };

  return (
    <DetailDrawer
      opened={Boolean(website)}
      onClose={onClose}
      title="Website setup"
      summary={
        website && (
          <Stack gap={6}>
            <Group gap="xs">
              <Text fw={600} size="md">
                {website.name}
              </Text>
              <StatusBadge status={website.verification} />
            </Group>
            <Anchor href={`https://${website.domain}`} target="_blank" rel="noreferrer" size="sm" c="dimmed">
              {website.domain} <IconExternalLink size={12} style={{ verticalAlign: -1 }} />
            </Anchor>
          </Stack>
        )
      }
      footer={
        website && (
          <>
            <Button variant="subtle" color="red" mr="auto" onClick={() => onDelete(website)}>
              Delete
            </Button>
            <Button variant="default" leftSection={<IconPencil size={14} />} onClick={() => onEdit(website)}>
              Edit
            </Button>
          </>
        )
      }
    >
      {website && (
        <>
          <DetailSection title="Installation">
            <Timeline active={activeStep - 1} bulletSize={22} lineWidth={2}>
              <Timeline.Item bullet={activeStep > 0 ? <IconCheck size={12} /> : <Text size="xs">1</Text>} title="Active widget">
                <Text size="xs" c="dimmed" mb="xs">
                  A website can have several widgets; visitors see the active one.
                </Text>
                {widgets.length ? (
                  <Group gap="xs" wrap="nowrap">
                    <Select
                      aria-label="Active widget"
                      placeholder="Choose the active widget"
                      data={widgets.map((w) => ({ value: w.id, label: w.name }))}
                      value={website.activeWidgetId}
                      onChange={changeWidget}
                      allowDeselect={false}
                      flex={1}
                    />
                    <Button component={Link} to={`/widgets?website=${website.id}`} variant="default">
                      Manage
                    </Button>
                  </Group>
                ) : (
                  <Button component={Link} to={`/widgets/new?website=${website.id}`} size="xs" leftSection={<IconPlus size={14} />}>
                    Create widget
                  </Button>
                )}
              </Timeline.Item>
              <Timeline.Item bullet={activeStep > 1 ? <IconCheck size={12} /> : <Text size="xs">2</Text>} title="Add the snippet">
                <Text size="xs" c="dimmed" mb="xs">
                  {PLATFORM_STEPS[website.platform]} It always loads the active widget, so switching widgets needs no reinstall.
                </Text>
                <CodeBlock code={getInstallSnippet(website.id, website.platform === 'react' ? 'react' : 'html')} label={website.platform === 'react' ? 'JSX' : 'HTML'} />
              </Timeline.Item>
              <Timeline.Item bullet={verified ? <IconCheck size={12} /> : <Text size="xs">3</Text>} title="Verify installation">
                {website.verification === 'failed' && (
                  <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />} p="xs" mb="xs">
                    <Text size="xs">We couldn't find the widget on {website.domain}.</Text>
                  </Alert>
                )}
                <Text size="xs" c="dimmed" mb="xs">
                  {verified ? `Verified — last activity ${formatRelative(website.lastActivityAt)}.` : 'We’ll load your site and look for the widget script.'}
                </Text>
                <Button size="xs" variant={verified ? 'default' : 'filled'} leftSection={<IconRefresh size={14} />} loading={verifying} disabled={!widget} onClick={verify}>
                  {verified ? 'Re-check' : 'Verify now'}
                </Button>
              </Timeline.Item>
            </Timeline>
          </DetailSection>

          <DetailSection title="Details">
            <PropertyList
              items={[
                { label: 'Platform', value: platforms.find((p) => p.value === website.platform)?.label },
                { label: 'Connection', value: <StatusBadge status={website.connection} /> },
                { label: 'Monthly visitors', value: formatNumber(website.monthlyVisitors) },
                { label: 'Last activity', value: formatRelative(website.lastActivityAt) },
                { label: 'Added', value: formatDate(website.createdAt) },
              ]}
            />
          </DetailSection>
        </>
      )}
    </DetailDrawer>
  );
}
