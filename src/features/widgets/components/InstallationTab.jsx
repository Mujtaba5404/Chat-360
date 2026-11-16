import { Alert, Anchor, ColorSwatch, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import CodeBlock from '../../../components/ui/CodeBlock';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getInstallSnippet } from '../../website/store';
import { widgetsStore } from '../store';
import classes from './InstallationTab.module.css';

export default function InstallationTab({ widget, website }) {
  const [platform, setPlatform] = useState(website?.platform === 'react' ? 'react' : 'html');
  const widgets = widgetsStore.useItems();

  if (!widget || !website) {
    return (
      <Alert variant="light" icon={<IconInfoCircle size={16} />} title="Create the widget first">
        The installation code becomes available once the widget is saved to a website.
      </Alert>
    );
  }

  const siblings = widgets.filter((w) => w.websiteId === website.id);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Add this snippet to <b>{website.domain}</b> before the closing <code>&lt;/body&gt;</code> tag. It loads whichever widget is active on the
        website, so switching widgets never requires reinstalling.
      </Text>
      <SegmentedControl
        value={platform}
        onChange={setPlatform}
        data={[
          { value: 'html', label: 'HTML' },
          { value: 'react', label: 'React / Next.js' },
        ]}
        w="fit-content"
      />
      <CodeBlock code={getInstallSnippet(website.id, platform)} label={platform === 'html' ? 'HTML' : 'JSX'} />

      <div>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Widgets on {website.domain}
          </Text>
          <Anchor component={Link} to={`/widgets?website=${website.id}`} size="xs">
            Manage
          </Anchor>
        </Group>
        <div className={classes.list}>
          {siblings.map((item) => (
            <Group key={item.id} justify="space-between" wrap="nowrap" className={classes.row}>
              <Group gap="sm" wrap="nowrap" miw={0}>
                <ColorSwatch color={item.color} size={12} withShadow={false} />
                <Text size="sm" fw={item.id === widget.id ? 600 : 400} truncate>
                  {item.name}
                  {item.id === widget.id && (
                    <Text span size="xs" c="dimmed" fw={400}>
                      {' '}
                      · this widget
                    </Text>
                  )}
                </Text>
              </Group>
              <StatusBadge status={website.activeWidgetId === item.id ? 'active' : 'inactive'} />
            </Group>
          ))}
        </div>
      </div>
    </Stack>
  );
}
