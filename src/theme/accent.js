import { DEFAULT_THEME } from "@mantine/core";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useGetWorkspaceQuery } from "../api/workspace";
import COLORS, { COLOR_OPTIONS } from "../constants/COLORS";
import { palette } from "../constants/TOKENS";
import { workspaceColor } from "../constants/WORKSPACE";
import { createStore } from "../libs/store";

// The app's accent follows the open workspace's color: everything drawn with the
// "brand" palette (primary buttons, links, focus rings, highlights) switches with it.
// Violet keeps the app's own Iris palette; it is the default everywhere else.

const STORAGE_KEY = "cm-accent";
export const DEFAULT_ACCENT = COLORS.VIOLET;

const valid = (color) =>
  COLOR_OPTIONS.includes(color) ? color : DEFAULT_ACCENT;

// Remembered, so a reload starts in the workspace's color instead of flashing violet.
const stored = () => {
  try {
    return valid(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_ACCENT;
  }
};

const accentStore = createStore(stored());

export const useAccent = () => accentStore.useStore();

export const setAccent = (color) => {
  const next = valid(color);
  if (next === accentStore.getState()) return;
  accentStore.setState(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not remembered; it still applies for this visit.
  }
};

/** The 10-shade palette used as "brand" for an accent color name. */
export const brandPalette = (color) => {
  if (color === COLORS.VIOLET) return palette.brand;
  if (color === COLORS.GRAY) return palette.gray;
  return DEFAULT_THEME.colors[color] ?? palette.brand;
};

/**
 * Keeps the accent on the open workspace's color (violet outside a workspace).
 * While the workspace loads, the current accent stays.
 */
export const useWorkspaceAccent = () => {
  const { workspaceId } = useParams();
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  const color = !workspaceId
    ? DEFAULT_ACCENT
    : workspace
      ? workspaceColor(workspace)
      : null;

  useEffect(() => {
    if (color) setAccent(color);
  }, [color]);
};

/** For screens outside the app (sign-in, sign-up): the default accent. */
export const useDefaultAccent = () => {
  useEffect(() => setAccent(DEFAULT_ACCENT), []);
};
