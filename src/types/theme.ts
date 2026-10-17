/**
 * Theme & UI Customization Types
 */

export type ButtonCornerStyle = 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full' | 'rounded-none';
export type ButtonElevationStyle = 'flat' | 'subtle-shadow' | 'glass' | 'neon-glow' | 'cyber-border';
export type AppBackgroundStyle = 'default' | 'mesh-gradient' | 'cyberpunk-grid' | 'warm-amber' | 'deep-midnight' | 'custom-image';

export interface ThemePalette {
  id: string;
  name: string;
  primary: string; // Hex e.g. #10b981
  primaryHover: string;
  accent: string;
  surfaceBg: string;
  pageBg: string;
  textPrimary: string;
  buttonRadius: ButtonCornerStyle;
  buttonElevation: ButtonElevationStyle;
  backgroundStyle: AppBackgroundStyle;
  customBgImage?: string; // Base64 data URL
}

export interface ExtractedImageTheme {
  dominantColor: string;
  secondaryColor: string;
  accentColor: string;
  suggestedButtonRadius: ButtonCornerStyle;
  suggestedElevation: ButtonElevationStyle;
  suggestedBackground: AppBackgroundStyle;
  isDarkPalette: boolean;
}
