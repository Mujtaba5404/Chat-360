import { CloseButton, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const SearchInput = ({ value, onChange, placeholder = "Search…", w = { base: "100%", sm: 240 }, ...rest
}) => {
  return (
    <TextInput
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      leftSection={<IconSearch size={14} stroke={1.75} />}
      rightSection={
        value ? (
          <CloseButton size="sm" aria-label="Clear search" onClick={() => onChange("")}/>
        ) : null
      }
      w={w}
      {...rest}
    />
  );
};

export default SearchInput;