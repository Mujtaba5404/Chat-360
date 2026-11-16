import { Badge, Button, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClock, IconMail, IconPencil, IconPhone, IconUsersGroup, IconWorld } from '@tabler/icons-react';
import CopyAction from '../../../components/ui/CopyAction';
import DetailDrawer, { DetailSection } from '../../../components/ui/DetailDrawer';
import PropertyList from '../../../components/ui/PropertyList';
import StatusBadge from '../../../components/ui/StatusBadge';
import UserAvatar from '../../../components/ui/UserAvatar';
import { formatDate, formatDuration, formatNumber, formatRelative } from '../../../lib/format';
import { useTeams } from '../../workspace/store';
import { ROLE_OPTIONS, usersStore } from '../store';
import classes from './UserDetailDrawer.module.css';

function Metric({ label, value }) {
  return (
    <div className={classes.metric}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} size="md">
        {value}
      </Text>
    </div>
  );
}

export default function UserDetailDrawer({ user, onClose, onEdit, onToggleActive, onDelete, isCurrentUser }) {
  const teams = useTeams();
  const team = teams.find((t) => t.id === user?.team);
  const isOwner = user?.role === 'owner';

  const changeRole = (role) => {
    usersStore.update(user.id, { role });
    notifications.show({ message: `${user.name} is now ${ROLE_OPTIONS.find((r) => r.value === role).label}` });
  };

  return (
    <DetailDrawer
      opened={Boolean(user)}
      onClose={onClose}
      title="User details"
      summary={
        user && (
          <Group gap="md" wrap="nowrap" align="flex-start">
            <UserAvatar name={user.name} presence={user.presence} size={44} />
            <Stack gap={4} miw={0}>
              <Text fw={600} size="md" truncate>
                {user.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user.title || 'No title'}
              </Text>
              <Group gap={6} mt={4}>
                <StatusBadge status={user.status} />
                <StatusBadge status={user.presence} />
              </Group>
            </Stack>
          </Group>
        )
      }
      footer={
        user && (
          <>
            <Button variant="subtle" color="red" mr="auto" disabled={isOwner || isCurrentUser} onClick={() => onDelete(user)}>
              Delete
            </Button>
            {user.status !== 'invited' && (
              <Button variant="default" disabled={isOwner || isCurrentUser} onClick={() => onToggleActive(user)}>
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            <Button leftSection={<IconPencil size={14} />} onClick={() => onEdit(user)}>
              Edit
            </Button>
          </>
        )
      }
    >
      {user && (
        <>
          <DetailSection title="Contact">
            <PropertyList
              items={[
                { label: 'Email', icon: IconMail, value: <Group gap={4} wrap="nowrap">{user.email}<CopyAction value={user.email} label="Copy email" /></Group> },
                { label: 'Phone', icon: IconPhone, value: user.phone },
                { label: 'Timezone', icon: IconWorld, value: user.timezone },
                { label: 'Team', icon: IconUsersGroup, value: team?.name },
                { label: 'Last active', icon: IconClock, value: user.presence === 'online' ? 'Online now' : formatRelative(user.lastActiveAt) },
              ]}
            />
          </DetailSection>

          <DetailSection title="Role & access">
            <Select
              aria-label="Role"
              data={ROLE_OPTIONS.filter((r) => isOwner || r.value !== 'owner')}
              value={user.role}
              onChange={changeRole}
              disabled={isOwner}
              description={isOwner ? 'Transfer ownership from Workspace → Security.' : 'Changes apply immediately.'}
            />
          </DetailSection>

          <DetailSection title="Performance · last 90 days">
            <SimpleGrid cols={3} spacing="sm">
              <Metric label="Conversations" value={formatNumber(user.stats.conversations)} />
              <Metric label="Avg. first reply" value={user.stats.avgResponse ? formatDuration(user.stats.avgResponse) : '—'} />
              <Metric label="CSAT" value={user.stats.csat ? `${user.stats.csat}%` : '—'} />
            </SimpleGrid>
          </DetailSection>

          <DetailSection title="Account">
            <PropertyList
              items={[
                { label: 'User ID', value: <Badge variant="default" ff="monospace">{user.id}</Badge> },
                { label: 'Created', value: formatDate(user.createdAt) },
              ]}
            />
          </DetailSection>
        </>
      )}
    </DetailDrawer>
  );
}
