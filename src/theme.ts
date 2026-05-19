/** Brand + UI design tokens — change here to retheme the entire app */

export const colors = {
  // Brand
  gold:        '#c9a227',
  goldLight:   '#e8c547',
  navy:        '#0f1419',
  navyMid:     '#1a2332',

  // Surfaces
  background:  '#f3f4f6',
  surface:     '#ffffff',

  // Borders
  border:      '#e5e7eb',
  borderLight: '#f3f4f6',

  // Text
  textPrimary:   '#111827',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  textInverse:   '#ffffff',

  // Semantic
  error:         '#ef4444',
  errorBg:       '#fef2f2',
  errorBorder:   '#fecaca',
  warning:       '#d97706',
  warningBg:     '#fffbeb',
  warningBorder: '#fde68a',
  success:       '#10b981',
  successBg:     '#f0fdf4',
  info:          '#2563eb',
  infoBg:        '#eff6ff',
  infoBorder:    '#bfdbfe',
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
} as const;
