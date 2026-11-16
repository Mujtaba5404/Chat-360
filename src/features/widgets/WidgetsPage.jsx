import { Badge, Button, EmptyState, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCircleCheck, IconCode, IconCopy, IconMessageChatbot, IconPencil, IconPlus, IconTrash, IconWorld } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FilterSelect from '../../components/ui/FilterSelect';
import Page from '../../components/ui/Page';
import RowActions from '../../components/ui/RowActions';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSearchParam } from '../../hooks/useSearchParam';
import { formatRelative, pluralize } from '../../lib/format';
import { widgetLanguages } from '../../mocks/widgets';
import { getInstallSnippet, websitesStore } from '../website/store';
import { createWidget, deleteWidget, readableTextColor, setActiveWidget, widgetsStore } from './store';
import classes from './WidgetsPage.module.css';

const STATUS_SEGMENTS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const languageLabel = (value) => widgetLanguages.find((l) => l.value === value)?.label ?? value;
const stop = (event) => event.stopPropagation();

function WidgetRow({ widget, website, onDelete }) {
  const navigate = useNavigate();
  const editPath = `/widgets/${widget.id}`;
  const active = website.activeWidgetId === widget.id;

  const activate = () => {
    setActiveWidget(widget);
    notifications.show({ color: 'green', message: `${widget.name} is now live on ${website.domain}` });
  };

  const duplicate = () => {
    const { record } = createWidget({ ...widget, name: `${widget.name} (copy)` });
    notifications.show({ message: `Duplicated as “${record.name}”` });
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(getInstallSnippet(website.id));
    notifications.show({ message: 'Installation code copied' });
  };

  return (
    <div className={classes.row} data-active={active || undefined} onClick={() => navigate(editPath)}>
      <div className={classes.widget}>
        <span className={classes.swatch} style={{ background: widget.color, color: readableTextColor(widget.color) }}>
          <IconMessageChatbot size={16} />
        </span>
        <div className={classes.widgetText}>
          <Link to={editPath} className={classes.name} onClick={stop}>
            {widget.name}
          </Link>
          <Text size="xs" c="dimmed" truncate>
            {widget.welcomeTitle}
          </Text>
        </div>
      </div>
      <div>
        <StatusBadge status={active ? 'active' : 'inactive'} />
      </div>
      <Text size="sm" c="dimmed" className={classes.optional}>
        {languageLabel(widget.language)}
      </Text>
      <Text size="sm" c="dimmed" className={classes.optional}>
        Bottom {widget.position}
      </Text>
      <Text size="sm" c="dimmed" className={classes.optional}>
        {formatRelative(widget.updatedAt)}
      </Text>
      <div className={classes.actions}>
        {!active && (
          <Button
            size="xs"
            variant="default"
            className={classes.setActive}
            onClick={(event) => {
              stop(event);
              activate();
            }}
          >
            Set active
          </Button>
        )}
        <RowActions
          items={[
            { label: 'Edit', icon: IconPencil, onClick: () => navigate(editPath) },
            !active && { label: 'Set as active', icon: IconCircleCheck, onClick: activate },
            { label: 'Duplicate', icon: IconCopy, onClick: duplicate },
            { label: 'Copy install code', icon: IconCode, onClick: copyCode },
            { divider: true },
            { label: 'Delete', icon: IconTrash, color: 'red', onClick: () => onDelete(widget) },
          ]}
        />
      </div>
    </div>
  );
}

function WebsiteGroup({ website, widgets, total, onDelete }) {
  const chatOff = total > 0 && !website.activeWidgetId;

  return (
    <section aria-label={website.name}>
      <div className={classes.groupHeader}>
        <Group gap="sm" wrap="nowrap" miw={0}>
          <span className={classes.siteIcon}>
            <IconWorld size={14} stroke={1.75} />
          </span>
          <Text size="sm" fw={600} truncate>
            {website.name}
          </Text>
          <Text size="sm" c="dimmed" truncate className={classes.optional}>
            {website.domain}
          </Text>
          <Text size="xs" c="dimmed" className={classes.count}>
            {total}
          </Text>
          {chatOff && (
            <Tooltip label="No widget is active, so visitors don’t see chat. Set one as active to turn it on." multiline w={240}>
              <Badge color="orange" variant="light" className={classes.flag}>
                Chat off
              </Badge>
            </Tooltip>
          )}
        </Group>
        <Button component={Link} to={`/widgets/new?website=${website.id}`} size="xs" variant="subtle" leftSection={<IconPlus size={14} />}>
          Add widget
        </Button>
      </div>

      {widgets.map((widget) => (
        <WidgetRow key={widget.id} widget={widget} website={website} onDelete={onDelete} />
      ))}

      {total === 0 && (
        <div className={classes.groupEmpty}>
          <Text size="sm" c="dimmed">
            No widgets on {website.domain} yet. The first one you create becomes active automatically.
          </Text>
        </div>
      )}
    </section>
  );
}

export default function WidgetsPage() {
  const widgets = widgetsStore.useItems();
  const websites = websitesStore.useItems();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useSearchParam('website');
  const [deleting, setDeleting] = useState(null);

  const search = query.trim().toLowerCase();
  const isFiltered = Boolean(search) || status !== 'all';
  const activeIds = new Set(websites.map((site) => site.activeWidgetId).filter(Boolean));

  const groups = websites
    .filter((site) => !websiteFilter || site.id === websiteFilter)
    .map((website) => {
      const own = widgets.filter((widget) => widget.websiteId === website.id);
      const visible = own.filter(
        (widget) =>
          widget.name.toLowerCase().includes(search) &&
          (status === 'all' || (status === 'active') === activeIds.has(widget.id)),
      );
      // Active widget first, then most recently updated.
      visible.sort((a, b) => activeIds.has(b.id) - activeIds.has(a.id) || b.updatedAt.localeCompare(a.updatedAt));
      return { website, widgets: visible, total: own.length };
    })
    // While filtering, hide websites with no matching widgets.
    .filter((group) => !isFiltered || group.widgets.length);

  const deletingSite = deleting && websites.find((site) => site.id === deleting.websiteId);
  const deletingActive = Boolean(deletingSite) && deletingSite.activeWidgetId === deleting.id;

  const confirmDelete = () => {
    deleteWidget(deleting);
    notifications.show({ message: `${deleting.name} deleted` });
  };

  return (
    <Page
      title="Widgets"
      description={`${pluralize(widgets.length, 'widget')} across ${pluralize(websites.length, 'website')}. Each website shows its one active widget.`}
      actions={
        <Button component={Link} to={websiteFilter ? `/widgets/new?website=${websiteFilter}` : '/widgets/new'} leftSection={<IconPlus size={14} />}>
          Add widget
        </Button>
      }
    >
      <div className={classes.panel}>
        <div className={classes.toolbar}>
          <SegmentedControl value={status} onChange={setStatus} data={STATUS_SEGMENTS} aria-label="Widget status" />
          <SearchInput value={query} onChange={setQuery} placeholder="Search widgets" />
          <FilterSelect
            label="Website"
            data={websites.map((site) => ({ value: site.id, label: site.domain }))}
            value={websiteFilter}
            onChange={setWebsiteFilter}
            w={{ base: '100%', sm: 180 }}
          />
        </div>

        {groups.length ? (
          <div className={classes.scroll}>
            <div className={classes.table}>
              <div className={classes.head} aria-hidden="true">
                <span>Widget</span>
                <span>Status</span>
                <span className={classes.optional}>Language</span>
                <span className={classes.optional}>Position</span>
                <span className={classes.optional}>Updated</span>
                <span />
              </div>
              {groups.map((group) => (
                <WebsiteGroup key={group.website.id} {...group} onDelete={setDeleting} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            size="sm"
            withIndicatorBackground
            icon={<IconMessageChatbot size={20} />}
            title={isFiltered ? 'No widgets match your filters' : 'No websites yet'}
            description={isFiltered ? 'Try a different search or status.' : 'Add a website first, then design the widgets it shows.'}
            className={classes.empty}
          >
            {!isFiltered && (
              <Button component={Link} to="/website?edit=new" mt="md">
                Add website
              </Button>
            )}
          </EmptyState>
        )}
      </div>

      <ConfirmDialog
        opened={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete widget"
        message={
          deletingActive
            ? `“${deleting.name}” is the active widget on ${deletingSite.domain}. Chat will be turned off there until you set another widget as active.`
            : 'This widget will be permanently deleted.'
        }
        confirmLabel="Delete widget"
      />
    </Page>
  );
}
