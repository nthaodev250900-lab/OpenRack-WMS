import { converter, formatHex, clampRgb } from 'culori';
import { z } from 'zod';

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Palette = Record<(typeof shades)[number], string>;
export const regentStBlue: Palette = {
  50: '#f4f9fb',
  100: '#e8f2f6',
  200: '#cde4ea',
  300: '#b0d6df',
  400: '#6db4c3',
  500: '#4b9bac',
  600: '#397e90',
  700: '#2f6575',
  800: '#2a5662',
  900: '#274953',
  950: '#1a2f37',
};
export const presets = {
  'regent-st-blue': '#397e90',
  ocean: '#2563eb',
  emerald: '#047857',
  purple: '#7c3aed',
  orange: '#c2410c',
  custom: '#397e90',
} as const;
export const themeSchema = z
  .object({
    themePreset: z.enum(['regent-st-blue', 'ocean', 'emerald', 'purple', 'orange', 'custom']),
    primaryColor: z.string().regex(/^#[\da-fA-F]{6}$/),
  })
  .superRefine((value, ctx) => {
    if (
      value.themePreset !== 'custom' &&
      value.primaryColor.toLowerCase() !== presets[value.themePreset]
    )
      ctx.addIssue({ code: 'custom', path: ['primaryColor'], message: 'invalidPreset' });
  });
export type ThemeConfig = z.infer<typeof themeSchema>;
export const defaultTheme: ThemeConfig = {
  themePreset: 'regent-st-blue',
  primaryColor: regentStBlue[600],
};

export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = hex
      .replace('#', '')
      .match(/../g)!
      .map((part) => parseInt(part, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function foreground(background: string) {
  return contrast(background, '#ffffff') >= contrast(background, '#000000') ? '#ffffff' : '#000000';
}
export function generatePalette(color: string): Palette {
  if (!/^#[\da-fA-F]{6}$/.test(color)) throw new Error('invalidColor');
  const base = converter('oklch')(color)!;
  const lightness = [
    0.98,
    0.95,
    0.9,
    0.83,
    0.72,
    0.63,
    base.l,
    Math.min(base.l * 0.85, 0.48),
    Math.min(base.l * 0.7, 0.4),
    Math.min(base.l * 0.55, 0.31),
    Math.min(base.l * 0.4, 0.22),
  ];
  return Object.fromEntries(
    shades.map((shade, i) => [
      shade,
      shade === 600
        ? color.toLowerCase()
        : formatHex(
            clampRgb({
              mode: 'oklch',
              l: lightness[i],
              c: (base.c ?? 0) * (i < 4 ? [0.12, 0.2, 0.35, 0.55][i] : 0.85),
              h: base.h ?? 0,
            }),
          )!,
    ]),
  ) as Palette;
}
export function paletteFor(theme: ThemeConfig): Palette {
  return theme.themePreset === 'regent-st-blue'
    ? regentStBlue
    : generatePalette(theme.primaryColor);
}
export function themeVariables(theme: ThemeConfig): Record<string, string> {
  const p = paletteFor(theme);
  return {
    ...Object.fromEntries(shades.map((s) => [`--brand-${s}`, p[s]])),
    '--primary': p[600],
    '--primary-foreground': foreground(p[600]),
    '--primary-hover': p[700],
    '--primary-hover-foreground': foreground(p[700]),
    '--sidebar': p[950],
    '--sidebar-foreground': '#ffffff',
    '--sidebar-primary': p[600],
    '--sidebar-primary-foreground': foreground(p[600]),
    '--sidebar-accent': p[800],
    '--chart-1': p[600],
    '--chart-2': p[400],
    '--chart-3': p[700],
    '--chart-4': p[300],
    '--chart-5': p[900],
  };
}
