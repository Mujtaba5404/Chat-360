import { Table, UnstyledButton, VisuallyHidden } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconSelector } from '@tabler/icons-react';
import TablePagination from './TablePagination';
import classes from './DataTable.module.css';

function SortHeader({ column, sort, onSort }) {
  const active = sort?.key === column.key;
  const Icon = !active ? IconSelector : sort.direction === 'asc' ? IconArrowUp : IconArrowDown;
  return (
    <UnstyledButton className={classes.sort} data-active={active || undefined} onClick={() => onSort(column.key)}>
      {column.header}
      <Icon size={12} stroke={2} />
    </UnstyledButton>
  );
}

/**
 * Compact table driven by `useTableQuery` state.
 * columns: [{ key, header, render?, sortable?, width?, align?, hideHeader? }]
 */
export default function DataTable({ columns, state, onRowClick, toolbar, emptyState, minWidth = 760, rowKey = 'id' }) {
  const { pageItems, sort, toggleSort, total } = state;

  const handleRowKeyDown = (event, row) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) onRowClick(row);
  };

  return (
    <div className={classes.root}>
      {toolbar && <div className={classes.toolbar}>{toolbar}</div>}

      <div className={classes.scroll}>
        <Table className={classes.table} miw={minWidth} highlightOnHover={Boolean(onRowClick)} horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  w={column.width}
                  ta={column.align}
                  aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.hideHeader ? (
                    <VisuallyHidden>{column.header}</VisuallyHidden>
                  ) : column.sortable ? (
                    <SortHeader column={column} sort={sort} onSort={toggleSort} />
                  ) : (
                    column.header
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map((row) => (
              <Table.Tr
                key={row[rowKey]}
                className={classes.row}
                data-clickable={onRowClick ? true : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
              >
                {columns.map((column) => (
                  <Table.Td key={column.key} ta={column.align}>
                    {column.render ? column.render(row) : row[column.key]}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {total === 0 && <div className={classes.empty}>{emptyState}</div>}

      {total > 0 && <TablePagination state={state} />}
    </div>
  );
}
