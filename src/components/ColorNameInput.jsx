import {
  CheckIcon,
  ColorSwatch,
  Group,
  Input,
  UnstyledButton,
} from "@mantine/core";
import { COLOR_OPTIONS } from "../constants/COLORS";

/** Picks one of the backend's color names (COLORS), e.g. for a workspace or a tag. */
const ColorNameInput = ({ value, onChange, label = "Color", error }) => (
  <Input.Wrapper label={label} error={error}>
    <Group gap={6} mt={4}>
      {COLOR_OPTIONS.map((color) => (
        <UnstyledButton
          key={color}
          onClick={() => onChange(color)}
          aria-label={color}
          aria-pressed={value === color}
        >
          <ColorSwatch
            color={`var(--mantine-color-${color}-6)`}
            size={22}
            withShadow={false}
          >
            {value === color && <CheckIcon size={10} color="white" />}
          </ColorSwatch>
        </UnstyledButton>
      ))}
    </Group>
  </Input.Wrapper>
);

export default ColorNameInput;
