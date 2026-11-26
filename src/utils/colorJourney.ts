export interface ColorStop {
  at: number;
  hex: string;
}

/**
 * Four-stage botanical colour journey:
 * 0.00 - 0.16: Stage 1 — Deep Forest Green (Bihar roots)
 * 0.16 - 0.44: Stage 2 — Forest Emerald -> Earthy Sage Green (Sourcing ecosystem)
 * 0.44 - 0.68: Stage 3 — Pale Sage -> Muted Cream-Green (Harvested makhana transition)
 * 0.68 - 1.00: Stage 4 — Warm Ivory / Off-White (Natural makhana brightness)
 */
export const BRAND_COLOR_STOPS: ColorStop[] = [
  { at: 0.0, hex: "#0B3027" },
  { at: 0.14, hex: "#0F382E" },
  { at: 0.28, hex: "#1B4E3F" },
  { at: 0.42, hex: "#3B6C5B" },
  { at: 0.52, hex: "#B9C9BA" },
  { at: 0.64, hex: "#E5E7DA" },
  { at: 0.78, hex: "#F2EDE1" },
  { at: 1.0, hex: "#FAF7EE" },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function interpolateBrandBackground(progress: number): string {
  const p = clampProgress(progress);

  if (p <= BRAND_COLOR_STOPS[0].at) return BRAND_COLOR_STOPS[0].hex;
  const last = BRAND_COLOR_STOPS[BRAND_COLOR_STOPS.length - 1];
  if (p >= last.at) return last.hex;

  for (let i = 0; i < BRAND_COLOR_STOPS.length - 1; i++) {
    const start = BRAND_COLOR_STOPS[i];
    const end = BRAND_COLOR_STOPS[i + 1];
    if (p >= start.at && p <= end.at) {
      const span = end.at - start.at || 1;
      const t = (p - start.at) / span;
      const [r1, g1, b1] = hexToRgb(start.hex);
      const [r2, g2, b2] = hexToRgb(end.hex);
      return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
    }
  }

  return last.hex;
}

export function isLightScrollZone(progress: number): boolean {
  return clampProgress(progress) >= 0.45;
}
