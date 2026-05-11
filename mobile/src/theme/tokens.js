/**
 * Design tokens from DESIGN.md — used across all components via ThemeContext.
 */

// ── Colors ────────────────────────────────────────────────────────────────────

export const lightColors = {
  // Surfaces
  surface:                  '#f8f9fa',
  surfaceDim:               '#d9dadb',
  surfaceBright:            '#f8f9fa',
  surfaceContainerLowest:   '#ffffff',
  surfaceContainerLow:      '#f3f4f5',
  surfaceContainer:         '#edeeef',
  surfaceContainerHigh:     '#e7e8e9',
  surfaceContainerHighest:  '#e1e3e4',

  // Content
  onSurface:                '#191c1d',
  onSurfaceVariant:         '#4d4354',
  inverseSurface:           '#2e3132',
  inverseOnSurface:         '#f0f1f2',

  // Outline
  outline:                  '#7e7385',
  outlineVariant:           '#cfc2d6',

  // Brand — primary lavender
  surfaceTint:              '#842bd2',
  primary:                  '#8127cf',
  onPrimary:                '#ffffff',
  primaryContainer:         '#9c48ea',
  onPrimaryContainer:       '#fffbff',
  inversePrimary:           '#ddb7ff',

  // Secondary
  secondary:                '#635b6e',
  onSecondary:              '#ffffff',
  secondaryContainer:       '#e9def5',
  onSecondaryContainer:     '#696174',

  // Tertiary
  tertiary:                 '#7b5500',
  onTertiary:               '#ffffff',
  tertiaryContainer:        '#9b6b00',
  onTertiaryContainer:      '#fffbff',

  // Semantic
  error:                    '#ba1a1a',
  onError:                  '#ffffff',
  errorContainer:           '#ffdad6',
  onErrorContainer:         '#93000a',

  // Fixed
  primaryFixed:             '#f0dbff',
  primaryFixedDim:          '#ddb7ff',
  onPrimaryFixed:           '#2c0051',
  onPrimaryFixedVariant:    '#6900b3',

  // Background
  background:               '#f8f9fa',
  onBackground:             '#191c1d',
  surfaceVariant:           '#e1e3e4',
};

export const darkColors = {
  // Surfaces
  surface:                  '#131416',
  surfaceDim:               '#131416',
  surfaceBright:            '#393a3c',
  surfaceContainerLowest:   '#0e0f11',
  surfaceContainerLow:      '#1b1c1e',
  surfaceContainer:         '#1f2022',
  surfaceContainerHigh:     '#292b2c',
  surfaceContainerHighest:  '#343637',

  // Content
  onSurface:                '#e2e2e5',
  onSurfaceVariant:         '#cac4cf',
  inverseSurface:           '#e2e2e5',
  inverseOnSurface:         '#2e3132',

  // Outline
  outline:                  '#948e99',
  outlineVariant:           '#4a454e',

  // Brand — primary lavender (dimmed for dark)
  surfaceTint:              '#ddb7ff',
  primary:                  '#ddb7ff',
  onPrimary:                '#430080',
  primaryContainer:         '#6900b3',
  onPrimaryContainer:       '#eedcff',
  inversePrimary:           '#8127cf',

  // Secondary
  secondary:                '#cdc2d9',
  onSecondary:              '#352d40',
  secondaryContainer:       '#4c4457',
  onSecondaryContainer:     '#e9def5',

  // Tertiary
  tertiary:                 '#fabc4e',
  onTertiary:               '#412d00',
  tertiaryContainer:        '#5d4200',
  onTertiaryContainer:      '#ffdead',

  // Semantic
  error:                    '#ffb4ab',
  onError:                  '#690005',
  errorContainer:           '#93000a',
  onErrorContainer:         '#ffdad6',

  // Fixed (same as light — fixed tokens don't change with scheme)
  primaryFixed:             '#f0dbff',
  primaryFixedDim:          '#ddb7ff',
  onPrimaryFixed:           '#2c0051',
  onPrimaryFixedVariant:    '#6900b3',

  // Background
  background:               '#131416',
  onBackground:             '#e2e2e5',
  surfaceVariant:           '#4a454e',
};

// ── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 32,
  containerPadding: 16,
  sidebarWidth: 280,
};

// ── Border radius ─────────────────────────────────────────────────────────────
export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 24,
  full: 9999,
};

// ── Typography ────────────────────────────────────────────────────────────────
export const fontSize = {
  displayXl:  48,
  headlineLg: 32,
  headlineMd: 24,
  bodyLg:     18,
  bodyMd:     15,
  labelMd:    13,
  caption:    12,
};

export const fontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
};

export const lineHeight = {
  tight:    1.1,
  snug:     1.2,
  normal:   1.5,
  relaxed:  1.6,
};

export const fontFamily = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};
