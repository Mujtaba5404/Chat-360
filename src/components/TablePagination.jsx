import { Group, Pagination, Select, Text } from "@mantine/core";
import PAGE_SIZES from "../constants/PAGE_SIZES";
import classes from "./TablePagination.module.css";

const SIZE_DATA = PAGE_SIZES.map(String);

/** Footer for `useTableQuery` lists: "1 - 10 / 18", records-per-page select and page controls. */
const TablePagination = ({ state }) => {
  const { page, pageCount, pageSize, total, setPage, setPageSize } = state;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={classes.root}>
      <Text size="sm" className={classes.range} aria-live="polite">
        {from} - {to} / {total}
      </Text>
      <Group gap="md" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Text size="sm" visibleFrom="sm">
            Records per page
          </Text>
          <Select
            size="xs"
            w={72}
            data={SIZE_DATA}
            value={String(pageSize)}
            onChange={(value) => setPageSize(Number(value))}
            aria-label="Records per page"
            comboboxProps={{ width: 80 }}
          />
        </Group>
        <Pagination
          total={pageCount}
          value={page}
          onChange={setPage}
          size="sm"
        />
      </Group>
    </div>
  );
};

export default TablePagination;
