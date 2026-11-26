import { describe, expect, it } from "vitest";
import {
  interpolateBrandBackground,
  isLightScrollZone,
} from "@/utils/colorJourney";

describe("Scroll-based brand colour journey", () => {
  it("starts in deep forest green (#0B3027) at top and ends in warm makhana ivory (#FAF7EE)", () => {
    expect(interpolateBrandBackground(0)).toBe("#0B3027");
    expect(interpolateBrandBackground(-0.5)).toBe("#0B3027");
    expect(interpolateBrandBackground(1)).toBe("#FAF7EE");
    expect(interpolateBrandBackground(1.5)).toBe("#FAF7EE");
  });

  it("progresses monotonically in luminance across the 4 stages", () => {
    const luminance = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const s1 = luminance(interpolateBrandBackground(0.05));
    const s2 = luminance(interpolateBrandBackground(0.32));
    const s3 = luminance(interpolateBrandBackground(0.56));
    const s4 = luminance(interpolateBrandBackground(0.95));

    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
    expect(s3).toBeLessThan(s4);
  });

  it("switches header contrast theme cleanly at the pale-sage threshold", () => {
    expect(isLightScrollZone(0.1)).toBe(false);
    expect(isLightScrollZone(0.35)).toBe(false);
    expect(isLightScrollZone(0.5)).toBe(true);
    expect(isLightScrollZone(0.9)).toBe(true);
  });
});
