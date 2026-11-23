import { SegmentedControl, useMantineColorScheme } from "@mantine/core";
import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./ThemeSwitcher.module.css";

const OPTIONS = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "dark", label: "Dark", icon: IconMoon },
];

/** Light / Dark segmented switch. */
const ThemeSwitcher = ({ fullWidth = false, withLabels = true }) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      size="xs"
      fullWidth={fullWidth}
      value={colorScheme}
      onChange={setColorScheme}
      aria-label="Color theme"
      data={OPTIONS.map(({ value, label, icon: Icon }) => ({
        value,
        label: (
          <span className={classes.option} aria-label={withLabels ? undefined : label}>
            <Icon size={14} stroke={1.75} />
            {withLabels && label}
          </span>
        ),
      }))}
    />
  );
};

export default ThemeSwitcher;