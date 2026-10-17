import { ButtonCornerStyle, ButtonElevationStyle, AppBackgroundStyle, ExtractedImageTheme, ThemePalette } from '../types/theme';

/**
 * Utility to convert RGB to Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Convert Hex to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Extract prominent colors from an Image and generate an aesthetic UI Theme
 */
export async function extractThemeFromImage(imageDataUrl: string): Promise<ExtractedImageTheme> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getFallbackTheme());
          return;
        }

        // Downscale for fast & efficient pixel sampling
        const width = 100;
        const height = 100;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorBuckets: { [bucketKey: string]: { r: number; g: number; b: number; count: number } } = {};

        // Sample pixels (every 4 pixels to be ultra fast)
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Ignore transparent or nearly pure black/white background pixels
          if (a < 128) continue;
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          if (brightness < 15 || brightness > 245) continue;

          // Bucket to reduce colors (round to nearest 32)
          const quantR = Math.floor(r / 32) * 32;
          const quantG = Math.floor(g / 32) * 32;
          const quantB = Math.floor(b / 32) * 32;
          const key = `${quantR}_${quantG}_${quantB}`;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: quantR, g: quantG, b: quantB, count: 0 };
          }
          colorBuckets[key].count++;
        }

        const sortedBuckets = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

        if (sortedBuckets.length === 0) {
          resolve(getFallbackTheme());
          return;
        }

        const dominant = sortedBuckets[0];
        const secondary = sortedBuckets[1] || sortedBuckets[0];
        const accent = sortedBuckets[2] || sortedBuckets[0];

        const dominantHex = rgbToHex(dominant.r, dominant.g, dominant.b);
        const secondaryHex = rgbToHex(secondary.r, secondary.g, secondary.b);
        const accentHex = rgbToHex(accent.r, accent.g, accent.b);

        const hsl = hexToHsl(dominantHex);
        const isDark = hsl.l < 50;

        // Determine style vibe based on hue & saturation
        let suggestedRadius: ButtonCornerStyle = 'rounded-xl';
        let suggestedElevation: ButtonElevationStyle = 'subtle-shadow';
        let suggestedBackground: AppBackgroundStyle = 'mesh-gradient';

        if (hsl.h >= 170 && hsl.h <= 260) {
          // Tech / Blue / Cyan / Cyberpunk
          suggestedRadius = 'rounded-lg';
          suggestedElevation = 'neon-glow';
          suggestedBackground = 'cyberpunk-grid';
        } else if (hsl.h >= 280 && hsl.h <= 340) {
          // Purple / Magenta / Modern Glass
          suggestedRadius = 'rounded-2xl';
          suggestedElevation = 'glass';
          suggestedBackground = 'mesh-gradient';
        } else if (hsl.h >= 25 && hsl.h <= 60) {
          // Amber / Gold / Warm
          suggestedRadius = 'rounded-xl';
          suggestedElevation = 'subtle-shadow';
          suggestedBackground = 'warm-amber';
        } else if (hsl.h >= 80 && hsl.h <= 160) {
          // Green / Emerald / Nature
          suggestedRadius = 'rounded-xl';
          suggestedElevation = 'subtle-shadow';
          suggestedBackground = 'mesh-gradient';
        }

        resolve({
          dominantColor: dominantHex,
          secondaryColor: secondaryHex,
          accentColor: accentHex,
          suggestedButtonRadius: suggestedRadius,
          suggestedElevation: suggestedElevation,
          suggestedBackground: suggestedBackground,
          isDarkPalette: isDark,
        });
      } catch (e) {
        resolve(getFallbackTheme());
      }
    };

    img.onerror = () => {
      resolve(getFallbackTheme());
    };

    img.src = imageDataUrl;
  });
}

function getFallbackTheme(): ExtractedImageTheme {
  return {
    dominantColor: '#10b981',
    secondaryColor: '#064e3b',
    accentColor: '#34d399',
    suggestedButtonRadius: 'rounded-xl',
    suggestedElevation: 'subtle-shadow',
    suggestedBackground: 'mesh-gradient',
    isDarkPalette: false,
  };
}

export const PRESET_THEMES: ThemePalette[] = [
  {
    id: 'darkness-genesis',
    name: '👑 Darkness Genesis (:hk-bridge9 - ดาร์กแฟนตาซีทองคำ)',
    primary: '#d4af37',
    primaryHover: '#f3e5ab',
    accent: '#ffcc00',
    surfaceBg: '#120f0d',
    pageBg: '#070605',
    textPrimary: '#f3e5ab',
    buttonRadius: 'rounded-xl',
    buttonElevation: 'neon-glow',
    backgroundStyle: 'deep-midnight',
  },
  {
    id: 'default-emerald',
    name: 'Default Emerald (คลาสสิก ดั้งเดิม)',
    primary: '#059669',
    primaryHover: '#047857',
    accent: '#10b981',
    surfaceBg: '#ffffff',
    pageBg: '#f8fafc',
    textPrimary: '#0f172a',
    buttonRadius: 'rounded-lg',
    buttonElevation: 'subtle-shadow',
    backgroundStyle: 'default',
  },
  {
    id: 'cyberpunk-matrix',
    name: 'Cyberpunk Matrix (นีออนล้ำยุค)',
    primary: '#00f0ff',
    primaryHover: '#00c3d0',
    accent: '#7000ff',
    surfaceBg: '#0b0f19',
    pageBg: '#05070e',
    textPrimary: '#e0f2fe',
    buttonRadius: 'rounded-md',
    buttonElevation: 'neon-glow',
    backgroundStyle: 'cyberpunk-grid',
  },
  {
    id: 'deep-midnight',
    name: 'Deep Midnight (มิดไนท์น้ำเงินคราม)',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    accent: '#60a5fa',
    surfaceBg: '#0f172a',
    pageBg: '#020617',
    textPrimary: '#f8fafc',
    buttonRadius: 'rounded-xl',
    buttonElevation: 'glass',
    backgroundStyle: 'deep-midnight',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber & Gold (สีทองอบอุ่น)',
    primary: '#d97706',
    primaryHover: '#b45309',
    accent: '#f59e0b',
    surfaceBg: '#fffbeb',
    pageBg: '#fef3c7',
    textPrimary: '#78350f',
    buttonRadius: 'rounded-2xl',
    buttonElevation: 'subtle-shadow',
    backgroundStyle: 'warm-amber',
  },
  {
    id: 'neon-violet',
    name: 'Ultra Violet (ม่วงไซไฟสะกดสายตา)',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    accent: '#a78bfa',
    surfaceBg: '#1e1b4b',
    pageBg: '#0f0c29',
    textPrimary: '#f5f3ff',
    buttonRadius: 'rounded-full',
    buttonElevation: 'neon-glow',
    backgroundStyle: 'mesh-gradient',
  },
];
