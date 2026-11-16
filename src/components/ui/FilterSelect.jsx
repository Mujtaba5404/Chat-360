import { Select } from '@mantine/core';

/** Compact, clearable select used in table toolbars. An empty value means "all". */
export default function FilterSelect({ label, value, onChange, data, w = { base: 'calc(50% - 4px)', sm: 150 }, ...rest }) {
  return (
    <Select
      placeholder={label}
      aria-label={label}
      value={value}
      onChange={onChange}
      data={data}
      clearable
      w={w}
      {...rest}
    />
  );
}
