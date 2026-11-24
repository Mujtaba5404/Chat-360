// The colors the backend accepts wherever a record stores a color name (workspaces,
// tags). Same as the backend's COLORS constant; each is a Mantine palette name.
const COLORS = Object.freeze({
  GRAY: "gray",
  RED: "red",
  PINK: "pink",
  GRAPE: "grape",
  VIOLET: "violet",
  INDIGO: "indigo",
  BLUE: "blue",
  CYAN: "cyan",
  TEAL: "teal",
  GREEN: "green",
  LIME: "lime",
  YELLOW: "yellow",
  ORANGE: "orange",
});

export const COLOR_OPTIONS = Object.values(COLORS);

/** A stored color name, or gray when it isn't one of COLORS. */
export const safeColor = (color) =>
  COLOR_OPTIONS.includes(color) ? color : COLORS.GRAY;

export default COLORS;
