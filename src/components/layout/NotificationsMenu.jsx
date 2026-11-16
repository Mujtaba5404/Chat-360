import { ActionIcon, Button, Group, Indicator, Popover, ScrollArea, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBell } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { markAllNotificationsRead, markNotificationRead, useNotifications } from '../../app/session';
import { useNow } from '../../hooks/useNow';
import { formatRelative } from '../../lib/format';
import classes from './NotificationsMenu.module.css';

export default function NotificationsMenu() {
  const items = useNotifications();
  const navigate = useNavigate();
  const now = useNow();
  const [opened, { close, toggle }] = useDisclosure(false);
  const unread = items.filter((n) => !n.read).length;

  const open = (item) => {
    markNotificationRead(item.id);
    navigate(item.href);
    close();
  };

  return (
    <Popover opened={opened} onDismiss={close}position="bottom-end" width={340} offset={8}>
      <Popover.Target>
        <Indicator disabled={!unread} size={8} offset={7} color="red" withBorder>
          <ActionIcon size="lg" onClick={toggle} aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}>
            <IconBell size={16} stroke={1.75} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Group justify="space-between" className={classes.header}>
          <Text size="sm" fw={600}>
            Notifications
          </Text>
          <Button variant="subtle" size="xs" disabled={!unread} onClick={markAllNotificationsRead}>
            Mark all as read
          </Button>
        </Group>
        <ScrollArea.Autosize mah={360}>
          {items.map((item) => (
            <UnstyledButton key={item.id} className={classes.item} data-unread={!item.read || undefined} onClick={() => open(item)}>
              <span className={classes.dot} />
              <div className={classes.body}>
                <Text size="sm" fw={500} truncate>
                  {item.title}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={2}>
                  {item.body}
                </Text>
              </div>
              <Text size="xs" c="dimmed" className={classes.time}>
                {formatRelative(item.at, now)}
              </Text>
            </UnstyledButton>
          ))}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}
