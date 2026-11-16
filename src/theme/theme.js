import {
  Accordion,
  ActionIcon,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Drawer,
  HoverCard,
  Kbd,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  Pagination,
  Paper,
  PasswordInput,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Switch,
  Tabs,
  TagsInput,
  Textarea,
  TextInput,
  Tooltip,
  createTheme,
  rem,
} from '@mantine/core';
import { motion, palette, radius, shadows, sizes, spacing, surfaces, typography, zIndex } from './tokens';

const toRem = (scale) => Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, rem(value)]));

// Compact control heights. Mantine sizes map onto our 28 / 32 / 36px scale.
const CONTROL_HEIGHTS = { xs: sizes.controlXs, sm: sizes.control, md: sizes.controlLg };

const controlHeight = (size = 'sm') => (CONTROL_HEIGHTS[size] ? rem(CONTROL_HEIGHTS[size]) : undefined);

const inputVars = (_theme, props) => {
  const height = controlHeight(props.size);
  return { wrapper: height ? { '--input-height': height } : {} };
};

const inputDefaults = { defaultProps: { size: 'sm' }, vars: inputVars };

const comboboxDefaults = {
  defaultProps: { size: 'sm', comboboxProps: { shadow: 'md', zIndex: zIndex.popover } },
  vars: inputVars,
};

// Only Select / MultiSelect render check icons.
const selectDefaults = {
  ...comboboxDefaults,
  defaultProps: { ...comboboxDefaults.defaultProps, checkIconPosition: 'right' },
};

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  colors: palette,
  white: '#FFFFFF',
  black: surfaces.light.text,
  fontFamily: typography.fontFamily,
  fontFamilyMonospace: typography.fontFamilyMono,
  fontSizes: toRem(typography.fontSizes),
  lineHeights: Object.fromEntries(Object.entries(typography.lineHeights).map(([k, v]) => [k, String(v)])),
  headings: {
    fontFamily: typography.fontFamily,
    fontWeight: String(typography.fontWeights.semibold),
    sizes: Object.fromEntries(
      Object.entries(typography.headings).map(([h, size]) => [h, { fontSize: rem(size), lineHeight: '1.35' }]),
    ),
  },
  spacing: toRem(spacing),
  radius: toRem(radius),
  defaultRadius: 'sm',
  shadows,
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
  autoContrast: true,

  components: {
    TextInput: TextInput.extend(inputDefaults),
    PasswordInput: PasswordInput.extend(inputDefaults),
    NumberInput: NumberInput.extend(inputDefaults),
    ColorInput: ColorInput.extend(inputDefaults),
    Textarea: Textarea.extend({ defaultProps: { size: 'sm' } }),
    Select: Select.extend({ ...selectDefaults, defaultProps: { ...selectDefaults.defaultProps, allowDeselect: false } }),
    MultiSelect: MultiSelect.extend(selectDefaults),
    TagsInput: TagsInput.extend(comboboxDefaults),
    Autocomplete: Autocomplete.extend(comboboxDefaults),

    Button: Button.extend({
      defaultProps: { size: 'sm' },
      vars: (_theme, props) => {
        const height = controlHeight(props.size);
        return { root: height ? { '--button-height': height, '--button-padding-x': rem(props.size === 'xs' ? 10 : 12) } : {} };
      },
      styles: { root: { fontWeight: typography.fontWeights.medium } },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: 'subtle', color: 'gray', size: 'md' },
      vars: (_theme, props) => {
        const map = { sm: 24, md: sizes.controlXs, lg: sizes.control };
        const value = map[props.size ?? 'md'];
        return { root: value ? { '--ai-size': rem(value) } : {} };
      },
    }),
    Badge: Badge.extend({
      defaultProps: { variant: 'light', radius: 'sm', size: 'md' },
      styles: { root: { textTransform: 'none', fontWeight: typography.fontWeights.medium, letterSpacing: 0 } },
    }),
    Avatar: Avatar.extend({ defaultProps: { radius: 'xl' } }),
    Paper: Paper.extend({ defaultProps: { withBorder: true, radius: 'md' } }),
    Card: Card.extend({ defaultProps: { withBorder: true, radius: 'md', padding: 'md' } }),
    Tooltip: Tooltip.extend({
      defaultProps: { openDelay: 250, zIndex: zIndex.popover, transitionProps: { duration: motion.fast } },
      styles: { tooltip: { fontSize: rem(typography.fontSizes.xs), padding: `${rem(4)} ${rem(8)}` } },
    }),
    Popover: Popover.extend({ defaultProps: { shadow: 'md', radius: 'md', zIndex: zIndex.popover } }),
    HoverCard: HoverCard.extend({ defaultProps: { shadow: 'md', radius: 'md', zIndex: zIndex.popover } }),
    Menu: Menu.extend({
      defaultProps: { shadow: 'md', radius: 'md', position: 'bottom-end', zIndex: zIndex.popover, transitionProps: { duration: motion.fast } },
      styles: {
        dropdown: { padding: rem(4) },
        item: { fontSize: rem(typography.fontSizes.sm), padding: `${rem(6)} ${rem(8)}` },
        label: { fontSize: rem(typography.fontSizes.xs) },
      },
    }),
    Modal: Modal.extend({
      defaultProps: { radius: 'md', zIndex: zIndex.modal, overlayProps: { backgroundOpacity: 0.45 }, transitionProps: { duration: motion.base } },
      styles: { title: { fontWeight: typography.fontWeights.semibold, fontSize: rem(typography.fontSizes.md) } },
    }),
    Drawer: Drawer.extend({
      defaultProps: { position: 'right', size: rem(440), zIndex: zIndex.modal, overlayProps: { backgroundOpacity: 0.35 } },
      styles: { title: { fontWeight: typography.fontWeights.semibold, fontSize: rem(typography.fontSizes.md) } },
    }),
    Tabs: Tabs.extend({ styles: { tab: { fontSize: rem(typography.fontSizes.sm), fontWeight: typography.fontWeights.medium } } }),
    SegmentedControl: SegmentedControl.extend({ defaultProps: { size: 'xs' } }),
    Switch: Switch.extend({ defaultProps: { size: 'sm' } }),
    Checkbox: Checkbox.extend({ defaultProps: { size: 'xs' } }),
    Pagination: Pagination.extend({ defaultProps: { size: 'sm', gap: 4 } }),
    Kbd: Kbd.extend({ defaultProps: { size: 'xs' } }),
    Loader: Loader.extend({ defaultProps: { size: 'sm' } }),
    ScrollArea: ScrollArea.extend({ defaultProps: { scrollbarSize: 8, type: 'hover' } }),
    Accordion: Accordion.extend({ defaultProps: { chevronPosition: 'right' } }),
  },
});

/** Exposes tokens as `--cm-*` CSS variables and aligns Mantine's own surface variables with them. */
export function cssVariablesResolver() {
  const scheme = (s) => ({
    '--cm-bg': s.bg,
    '--cm-bg-subtle': s.bgSubtle,
    '--cm-bg-muted': s.bgMuted,
    '--cm-sidebar-bg': s.sidebar,
    '--cm-hover': s.hover,
    '--cm-active': s.active,
    '--cm-border': s.border,
    '--cm-border-strong': s.borderStrong,
    '--cm-text': s.text,
    '--cm-text-muted': s.textMuted,
    '--cm-text-subtle': s.textSubtle,
    '--cm-note-bg': s.noteBg,
    '--cm-note-border': s.noteBorder,
    '--cm-bubble-in': s.bubbleIn,
    '--mantine-color-body': s.bg,
    '--mantine-color-text': s.text,
    '--mantine-color-dimmed': s.textMuted,
    '--mantine-color-default-border': s.border,
    '--mantine-color-default-hover': s.hover,
    '--mantine-color-placeholder': s.textSubtle,
  });

  return {
    variables: {
      '--cm-header-h': rem(sizes.header),
      '--cm-sidebar-w': rem(sizes.sidebar),
      '--cm-sidebar-w-collapsed': rem(sizes.sidebarCollapsed),
      '--cm-control-h': rem(sizes.control),
      '--cm-row-h': rem(sizes.tableRow),
      '--cm-page-px': rem(sizes.pagePadding),
      '--cm-font-display-sm': rem(typography.display.sm),
      '--cm-font-display-lg': rem(typography.display.lg),
      '--cm-duration-fast': `${motion.fast}ms`,
      '--cm-duration': `${motion.base}ms`,
      '--cm-ease': motion.easing,
      '--cm-z-sticky': String(zIndex.sticky),
      '--cm-z-sidebar': String(zIndex.sidebar),
      '--cm-z-header': String(zIndex.header),
    },
    light: scheme(surfaces.light),
    dark: { ...scheme(surfaces.dark), '--mantine-color-default': surfaces.dark.bgMuted },
  };
}
