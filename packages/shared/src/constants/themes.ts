/**
 * Storefront Theme Presets
 *
 * Centralized theme definitions for storefront customization.
 * Each preset includes colors, fonts, and metadata for preview.
 *
 * To add a new theme:
 * 1. Add the preset key to ThemePresetKey type
 * 2. Add the theme definition to THEME_PRESETS
 * 3. Theme will automatically appear in the dropdown
 */

/**
 * Theme color configuration
 */
export interface ThemeColors {
  /** Primary brand color (buttons, links, accents) */
  primary: string;
  /** Secondary color (cards, sections) */
  secondary: string;
  /** Accent color (highlights, badges) */
  accent: string;
  /** Page background color */
  background: string;
  /** Main text color */
  text: string;
  /** Header/navigation background color (optional, defaults to transparent) */
  headerBg?: string;
  /** Header/navigation text color (optional, defaults to text color) */
  headerText?: string;
}

/**
 * Theme font configuration
 */
export interface ThemeFonts {
  /** Font for headings (h1, h2, etc.) */
  heading: string;
  /** Font for body text */
  body: string;
}

/**
 * Complete theme preset definition
 */
export interface ThemePreset {
  /** Unique identifier for the preset */
  key: string;
  /** Display name for the preset */
  name: string;
  /** Short description of the theme style */
  description: string;
  /** Color palette */
  colors: ThemeColors;
  /** Typography settings */
  fonts: ThemeFonts;
  /** Whether this is a light or dark theme (for contrast calculations) */
  mode: 'light' | 'dark';
  /** Preview colors for the dropdown (shows a mini color palette) */
  preview: {
    /** Primary preview color */
    primary: string;
    /** Background preview color */
    background: string;
  };
}

/**
 * Available theme preset keys
 */
export type ThemePresetKey =
  | 'dark'
  | 'light'
  | 'horror'
  | 'vintage'
  | 'neon'
  | 'blood-moon'
  | 'forest'
  | 'carnival';

/**
 * Theme presets organized by category for the UI
 */
export interface ThemeCategory {
  name: string;
  description: string;
  presets: ThemePresetKey[];
}

/**
 * All available theme presets
 *
 * Design Notes:
 * - Dark themes: High contrast, dark backgrounds, vibrant accents
 * - Light themes: Clean, bright, accessible
 * - Horror themes: Atmospheric, moody, genre-appropriate
 * - Specialty themes: Unique styles for specific aesthetics
 */
export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  // ============================================
  // CORE THEMES
  // ============================================

  dark: {
    key: 'dark',
    name: 'Dark',
    description: 'Clean dark theme with red accents. Professional and modern.',
    colors: {
      primary: '#dc2626', // Red-600
      secondary: '#1f2937', // Gray-800
      accent: '#f59e0b', // Amber-500
      background: '#0a0a0a', // Near black
      text: '#f5f5f5', // Gray-100
      headerBg: '#0a0a0a', // Same as background
      headerText: '#f5f5f5', // Same as text
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#dc2626',
      background: '#0a0a0a',
    },
  },

  light: {
    key: 'light',
    name: 'Light',
    description: 'Bright and clean theme. Great for daytime events.',
    colors: {
      primary: '#7c3aed', // Violet-600
      secondary: '#f3f4f6', // Gray-100
      accent: '#f59e0b', // Amber-500
      background: '#ffffff', // White
      text: '#1f2937', // Gray-800
      headerBg: '#ffffff', // Same as background
      headerText: '#1f2937', // Same as text
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    mode: 'light',
    preview: {
      primary: '#7c3aed',
      background: '#ffffff',
    },
  },

  // ============================================
  // HORROR THEMES
  // ============================================

  horror: {
    key: 'horror',
    name: 'Horror',
    description: 'Dark and sinister with blood red accents. Classic haunted house.',
    colors: {
      primary: '#b91c1c', // Red-700 (deeper, bloodier)
      secondary: '#18181b', // Zinc-900
      accent: '#a3e635', // Lime-400 (toxic green)
      background: '#09090b', // Zinc-950
      text: '#e4e4e7', // Zinc-200
      headerBg: '#18181b', // Slightly lighter than background
      headerText: '#e4e4e7', // Same as text
    },
    fonts: {
      heading: 'Creepster',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#b91c1c',
      background: '#09090b',
    },
  },

  'blood-moon': {
    key: 'blood-moon',
    name: 'Blood Moon',
    description: 'Deep crimson and black. Intense and foreboding.',
    colors: {
      primary: '#991b1b', // Red-800
      secondary: '#1c1917', // Stone-900
      accent: '#fbbf24', // Amber-400
      background: '#0c0a09', // Stone-950
      text: '#fafaf9', // Stone-50
      headerBg: '#1c1917', // Secondary color for header
      headerText: '#fafaf9', // Same as text
    },
    fonts: {
      heading: 'Nosifer',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#991b1b',
      background: '#0c0a09',
    },
  },

  // ============================================
  // SPECIALTY THEMES
  // ============================================

  vintage: {
    key: 'vintage',
    name: 'Vintage',
    description: 'Sepia-toned with warm browns. Old-timey carnival feel.',
    colors: {
      primary: '#b45309', // Amber-700
      secondary: '#292524', // Stone-800
      accent: '#d97706', // Amber-600
      background: '#1c1917', // Stone-900
      text: '#fef3c7', // Amber-100
      headerBg: '#292524', // Secondary color for header
      headerText: '#fef3c7', // Same as text
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#b45309',
      background: '#1c1917',
    },
  },

  neon: {
    key: 'neon',
    name: 'Neon',
    description: 'Vibrant neon colors on dark. Cyberpunk meets haunted arcade.',
    colors: {
      primary: '#e11d48', // Rose-600
      secondary: '#0f172a', // Slate-900
      accent: '#06b6d4', // Cyan-500
      background: '#020617', // Slate-950
      text: '#f8fafc', // Slate-50
      headerBg: '#0f172a', // Secondary color for header
      headerText: '#f8fafc', // Same as text
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#e11d48',
      background: '#020617',
    },
  },

  forest: {
    key: 'forest',
    name: 'Haunted Forest',
    description: 'Deep greens and earth tones. Perfect for outdoor trails.',
    colors: {
      primary: '#15803d', // Green-700
      secondary: '#1a2e05', // Dark forest green
      accent: '#ca8a04', // Yellow-600 (lantern light)
      background: '#0f1a0a', // Deep forest
      text: '#d1fae5', // Emerald-100
      headerBg: '#1a2e05', // Secondary color for header
      headerText: '#d1fae5', // Same as text
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#15803d',
      background: '#0f1a0a',
    },
  },

  carnival: {
    key: 'carnival',
    name: 'Dark Carnival',
    description: 'Circus-inspired with purple and gold. Creepy carnival vibes.',
    colors: {
      primary: '#7c3aed', // Violet-600
      secondary: '#1e1b4b', // Indigo-950
      accent: '#fbbf24', // Amber-400 (gold)
      background: '#0f0d1a', // Deep purple-black
      text: '#ede9fe', // Violet-100
      headerBg: '#1e1b4b', // Secondary color for header
      headerText: '#ede9fe', // Same as text
    },
    fonts: {
      heading: 'Eater',
      body: 'Inter',
    },
    mode: 'dark',
    preview: {
      primary: '#7c3aed',
      background: '#0f0d1a',
    },
  },
};

/**
 * Theme categories for organized display in UI
 */
export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    name: 'Essentials',
    description: 'Clean, versatile themes that work for any attraction',
    presets: ['dark', 'light'],
  },
  {
    name: 'Horror',
    description: 'Dark and atmospheric themes for haunted attractions',
    presets: ['horror', 'blood-moon'],
  },
  {
    name: 'Specialty',
    description: 'Unique themes for specific aesthetics',
    presets: ['vintage', 'neon', 'forest', 'carnival'],
  },
];

/**
 * Default theme for new storefronts
 */
export const DEFAULT_THEME_KEY: ThemePresetKey = 'dark';

/**
 * Get a theme preset by key
 */
export function getThemePreset(key: string): ThemePreset | undefined {
  return THEME_PRESETS[key as ThemePresetKey];
}

/**
 * Get the default theme preset
 */
export function getDefaultTheme(): ThemePreset {
  return THEME_PRESETS[DEFAULT_THEME_KEY];
}

/**
 * Get all theme presets as an array (for iteration)
 */
export function getAllThemePresets(): ThemePreset[] {
  return Object.values(THEME_PRESETS);
}

/**
 * Check if a key is a valid theme preset
 */
export function isValidThemeKey(key: string): key is ThemePresetKey {
  return key in THEME_PRESETS;
}

/**
 * Available font options for custom themes
 * Includes web-safe fonts and Google Fonts
 */
export const THEME_FONT_OPTIONS = [
  // Modern sans-serif
  { value: 'Inter', label: 'Inter', category: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'sans-serif' },

  // Elegant serif
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'serif' },

  // Horror/Display fonts
  { value: 'Creepster', label: 'Creepster', category: 'horror' },
  { value: 'Nosifer', label: 'Nosifer', category: 'horror' },
  { value: 'Eater', label: 'Eater', category: 'horror' },
  { value: 'Butcherman', label: 'Butcherman', category: 'horror' },
  { value: 'Metal Mania', label: 'Metal Mania', category: 'horror' },
] as const;

export type ThemeFontOption = (typeof THEME_FONT_OPTIONS)[number];
