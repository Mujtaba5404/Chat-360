/**
 * Chat Model design tokens — the single source of truth for the visual system.
 * Mantine's theme (theme.js) and the `--cm-*` CSS variables are both derived from here.
 */

export const palette = {
  // Iris — primary brand color
  brand: ['#F0F0FF', '#E1E0FE', '#C4C2FC', '#A5A2F8', '#8986F3', '#736FEF', '#5E5AE6', '#4F4BCB', '#433FAE', '#36338E'],
  // Zinc — neutral scale for light surfaces and text
  gray: ['#FAFAFA', '#F4F4F5', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A', '#18181B'],
  // Dark scale used by Mantine in dark color scheme (0 = text, 7 = body)
  dark: ['#E4E4E7', '#B4B4BB', '#8B8B93', '#5F5F67', '#34343A', '#2A2A2F', '#1F1F22', '#161618', '#111113', '#0B0B0C'],
};

/** Semantic intent → Mantine color key */
export const semantic = {
  brand: 'brand',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'blue',
  neutral: 'gray',
};

/** Surface, border and text roles per color scheme */
export const surfaces = {
  light: {
    bg: '#FFFFFF',
    bgSubtle: '#FAFAFA',
    bgMuted: '#F4F4F5',
    sidebar: '#FAFAFA',
    hover: '#F4F4F5',
    active: '#EDEDF0',
    border: '#E8E8EB',
    borderStrong: '#D4D4D8',
    text: '#18181B',
    textMuted: '#71717A',
    textSubtle: '#A1A1AA',
    noteBg: '#FFF9EB',
    noteBorder: '#F3E1A6',
    bubbleIn: '#F4F4F5',
  },
  dark: {
    bg: '#161618',
    bgSubtle: '#131315',
    bgMuted: '#1F1F22',
    sidebar: '#111113',
    hover: '#1F1F22',
    active: '#27272B',
    border: '#27272B',
    borderStrong: '#34343A',
    text: '#E4E4E7',
    textMuted: '#8B8B93',
    textSubtle: '#5F5F67',
    noteBg: '#2A2414',
    noteBorder: '#4A3F1E',
    bubbleIn: '#232327',
  },
};

export const typography = {
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  // px — xs: meta, sm: body/controls, md: emphasis, lg/xl: titles
  fontSizes: { xs: 12, sm: 13, md: 14, lg: 16, xl: 18 },
  lineHeights: { xs: 1.4, sm: 1.45, md: 1.5, lg: 1.55, xl: 1.6 },
  fontWeights: { regular: 400, medium: 500, semibold: 600 },
  headings: { h1: 20, h2: 16, h3: 14, h4: 13 },
  // Marketing-style headlines (sign-in screen)
  display: { sm: 28, lg: 34 },
};

/** 4px-based spacing scale (px) */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };

export const radius = { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 };

export const shadows = {
  xs: '0 1px 2px rgb(0 0 0 / 0.04)',
  sm: '0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04)',
  md: '0 4px 16px rgb(0 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.05)',
  lg: '0 12px 32px rgb(0 0 0 / 0.12), 0 2px 6px rgb(0 0 0 / 0.06)',
  xl: '0 24px 48px rgb(0 0 0 / 0.16)',
};

/** Component and layout dimensions (px) */
export const sizes = {
  controlXs: 28,
  control: 32,
  controlLg: 36,
  tableRow: 40,
  header: 52,
  sidebar: 224,
  sidebarCollapsed: 56,
  pagePadding: 20,
  icon: 16,
  iconSm: 14,
};

export const motion = {
  fast: 120,
  base: 180,
  slow: 240,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

/** Z-index layers — Mantine overlay components are aligned to these values in theme.js */
export const zIndex = {
  sticky: 10,
  sidebar: 100,
  header: 110,
  modal: 200,
  popover: 300,
  toast: 400,
};
