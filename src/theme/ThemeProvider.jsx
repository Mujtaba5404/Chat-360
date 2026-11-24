import { MantineProvider, createTheme } from "@mantine/core";
import { useMemo } from "react";
import mantineTheme, { cssVariablesResolver } from "../../mantine.config.js";
import { brandPalette, useAccent } from "./accent";

/** Mantine theme whose "brand" (primary) palette is the current accent color. */
const ThemeProvider = ({ children }) => {
  const accent = useAccent();
  const theme = useMemo(
    () =>
      createTheme({
        ...mantineTheme,
        colors: { ...mantineTheme.colors, brand: brandPalette(accent) },
      }),
    [accent],
  );

  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      {children}
    </MantineProvider>
  );
};

export default ThemeProvider;
