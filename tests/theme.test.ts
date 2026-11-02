import { describe, it, expect } from 'vitest';
import {
  regentStBlue,
  defaultTheme,
  generatePalette,
  paletteFor,
  shades,
  foreground,
  contrast,
  themeSchema,
  themeVariables,
  presets,
} from '@/theme/palette';
describe('theme palette and accessibility', () => {
  it('uses the exact Regent St Blue default scale', () => {
    expect(defaultTheme).toEqual({ themePreset: 'regent-st-blue', primaryColor: '#397e90' });
    expect(Object.values(regentStBlue)).toEqual([
      '#f4f9fb',
      '#e8f2f6',
      '#cde4ea',
      '#b0d6df',
      '#6db4c3',
      '#4b9bac',
      '#397e90',
      '#2f6575',
      '#2a5662',
      '#274953',
      '#1a2f37',
    ]);
    expect(paletteFor(defaultTheme)).toEqual(regentStBlue);
  });
  it.each([
    '#ffffff',
    '#000000',
    '#ffff00',
    '#00ffff',
    '#ff0000',
    '#123456',
    ...Object.values(presets),
  ])('generates valid accessible colors from %s', (color) => {
    const p = generatePalette(color);
    expect(Object.keys(p)).toHaveLength(11);
    for (const shade of shades) {
      expect(p[shade]).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrast(p[shade], foreground(p[shade]))).toBeGreaterThanOrEqual(4.5);
    }
    expect(p[600]).toBe(color);
    expect(contrast(p[700], '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(contrast(p[300], '#101a20')).toBeGreaterThanOrEqual(3);
  });
  it.each(['red', '#123', '#12345g', 'var(--x)', '";color:red', ''])(
    'rejects invalid custom color %s',
    (value) => {
      expect(themeSchema.safeParse({ themePreset: 'custom', primaryColor: value }).success).toBe(
        false,
      );
      expect(() => generatePalette(value)).toThrow();
    },
  );
  it('rejects preset spoofing and unknown presets', () => {
    expect(
      themeSchema.safeParse({ themePreset: 'regent-st-blue', primaryColor: '#ffffff' }).success,
    ).toBe(false);
    expect(themeSchema.safeParse({ themePreset: 'bad', primaryColor: '#397e90' }).success).toBe(
      false,
    );
  });
  it('does not override operational status colors', () => {
    const vars = themeVariables({ themePreset: 'custom', primaryColor: '#ff0000' });
    for (const semantic of ['success', 'warning', 'danger', 'info', 'background', 'foreground'])
      expect(vars).not.toHaveProperty(`--${semantic}`);
    expect(vars['--primary-hover-foreground']).toBe(foreground(vars['--primary-hover']));
  });
});
