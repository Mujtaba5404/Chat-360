import { Badge, Button, EmptyState, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import { IconEye, IconMessage, IconRadar2 } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import FilterSelect from '../../components/ui/FilterSelect';
import Page from '../../components/ui/Page';
import RowActions from '../../components/ui/RowActions';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import UserAvatar from '../../components/ui/UserAvatar';
import { useNow } from '../../hooks/useNow';
import { useSearchParam } from '../../hooks/useSearchParam';
import { useTableQuery } from '../../hooks/useTableQuery';
import { formatDate, formatRelative } from '../../lib/format';
import VisitorDrawer from './components/VisitorDrawer';
import { subscribeToVisitorActivity, visitorKind, visitorName, visitorsStore } from './store';
import { useStartConversation } from './useStartConversation';
import classes from './VisitorsPage.module.css';

const SEARCH_FIELDS = ['displayName', 'email', 'city', 'country', 'currentPath', 'referrer'];
const SEGMENTS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'identified', label: 'Identified' },
  { value: 'anonymous', label: 'Anonymous' },
];

function Stat({ label, value, live }) {
  return (
    <div className={classes.stat}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Group gap={6}>
        {live && <span className={classes.pulse} aria-hidden="true" />}
        <Text fw={600} size="lg">
          {value}
        </Text>
      </Group>
    </div>
  );
}

export default function VisitorsPage() {
  const visitors = visitorsStore.useItems();
  const now = useNow();
  const startConversation = useStartConversation();
  const [viewId, setViewId] = useSearchParam('view');

  // Realtime page views (simulated feed; see store).
  useEffect(() => subscribeToVisitorActivity(), []);

  const rows = useMemo(
    () =>
      visitors.map((visitor) => ({
        ...visitor,
        displayName: visitorName(visitor),
        kind: visitorKind(visitor),
        currentPath: visitor.pages[0]?.path,
      })),
    [visitors],
  );
  const table = useTableQuery(rows, {
    searchFields: SEARCH_FIELDS,
    initialFilters: { status: null, kind: null, website: null },
    initialSort: { key: 'lastSeenAt', direction: 'desc' },
  });

  const live = visitors.filter((v) => v.status === 'live');
  const identified = visitors.filter((v) => visitorKind(v) === 'identified').length;
  const websites = [...new Set(visitors.map((v) => v.website))].map((value) => ({ value, label: value }));
  const segment = table.filters.status === 'live' ? 'live' : (table.filters.kind ?? 'all');
  const viewing = visitors.find((v) => v.id === viewId);

  const selectSegment = (value) => {
    table.setFilter('status', value === 'live' ? 'live' : null);
    table.setFilter('kind', value === 'identified' || value === 'anonymous' ? value : null);
  };

  const columns = [
    {
      key: 'displayName',
      header: 'Visitor',
      sortable: true,
      render: (v) => (
        <Group gap="sm" wrap="nowrap">
          <UserAvatar name={v.displayName} presence={v.status} size={28} />
          <div>
            <Text size="sm" fw={500} lh={1.3}>
              {v.displayName}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {v.email ?? `${v.visits} ${v.visits === 1 ? 'visit' : 'visits'}`}
            </Text>
          </div>
        </Group>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (v) => <StatusBadge status={v.status} /> },
    {
      key: 'currentPath',
      header: 'Current page',
      render: (v) => (
        <div className={classes.page}>
          <Text size="sm" truncate c={v.status === 'left' ? 'dimmed' : undefined}>
            {v.pages[0]?.title}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {v.website}
            {v.currentPath}
          </Text>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Location',
      sortable: true,
      render: (v) => (
        <Group gap={6} wrap="nowrap">
          <Badge variant="default" size="xs" ff="monospace" style={{ flexShrink: 0 }}>
            {v.countryCode}
          </Badge>
          <Text size="sm">{v.city}</Text>
        </Group>
      ),
    },
    { key: 'referrer', header: 'Referrer', sortable: true, render: (v) => <Text size="sm" c="dimmed">{v.referrer}</Text> },
    {
      key: 'browser',
      header: 'Browser / OS',
      render: (v) => (
        <Text size="sm" c="dimmed">
          {v.browser} · {v.os}
        </Text>
      ),
    },
    {
      key: 'lastSeenAt',
      header: 'Last seen',
      sortable: true,
      render: (v) => (
        <Tooltip label={`First seen ${formatDate(v.firstSeenAt)}`}>
          <Text size="sm" c="dimmed">
            {v.status === 'left' ? formatRelative(v.lastSeenAt, now) : 'Now'}
          </Text>
        </Tooltip>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideHeader: true,
      width: 48,
      align: 'right',
      render: (v) => (
        <RowActions
          items={[
            { label: 'View details', icon: IconEye, onClick: () => setViewId(v.id) },
            { label: 'Start conversation', icon: IconMessage, onClick: () => startConversation(v) },
          ]}
        />
      ),
    },
  ];

  return (
    <Page
      title="Visitors"
      description="Real-time activity across your connected websites."
      actions={
        <Badge variant="light" color="green" size="lg" leftSection={<span className={classes.pulse} />}>
          {live.length} live now
        </Badge>
      }
    >
      <div className={classes.stats}>
        <Stat label="Live now" value={live.length} live />
        <Stat label="Identified" value={identified} />
        <Stat label="Anonymous" value={visitors.length - identified} />
      </div>

      <DataTable
        columns={columns}
        state={table}
        onRowClick={(v) => setViewId(v.id)}
        minWidth={1000}
        toolbar={
          <>
            <SegmentedControl value={segment} onChange={selectSegment} data={SEGMENTS} aria-label="Visitor segment" />
            <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search name, location or page" />
            <FilterSelect label="Website" data={websites} value={table.filters.website} onChange={(value) => table.setFilter('website', value)} w={{ base: '100%', sm: 170 }} />
          </>
        }
        emptyState={
          <EmptyState
            size="sm"
            withIndicatorBackground
            icon={<IconRadar2 size={20} />}
            title="No visitors match"
            description="Try another segment or search."
          >
            <Button variant="default" size="xs" mt="sm" onClick={table.reset}>
              Reset filters
            </Button>
          </EmptyState>
        }
      />

      <VisitorDrawer visitor={viewing} onClose={() => setViewId(null)} onStartConversation={startConversation} />
    </Page>
  );
}
