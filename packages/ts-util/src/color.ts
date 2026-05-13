// Convert sRGB value to Linear sRGB space (Remove Gamma)
const toLinear = (c: number) =>
  c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;

// Convert Linear sRGB space to sRGB value (Apply Gamma)
const toSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

// Clamp to prevent out-of-bounds values after Oklab conversion
const clampSrgb = (val: number) => Math.max(0, Math.min(255, Math.round(val)));

// Clamp amount between 0 and 1
const clampAmount = (amount: number) => Math.max(0, Math.min(1, amount));

export class RGBColor {
  /** 0-255 sRGB red value */
  public readonly r: number;
  /** 0-255 sRGB green value */
  public readonly g: number;
  /** 0-255 sRGB blue value */
  public readonly b: number;

  public constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Converts a hex color string to an RGB object.
   * @param hex 3-digit (#FFF) or 6-digit (#FFFFFF) hex string
   */
  public static fromHex(hex: string): RGBColor {
    let cleaned = hex.replace("#", "");

    if (cleaned.length === 3) {
      cleaned = cleaned
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const num = parseInt(cleaned, 16);
    if (isNaN(num)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }

    return new RGBColor((num >> 16) & 255, (num >> 8) & 255, num & 255);
  }

  /**
   * Converts an Oklab color back to an RGB color.
   */
  public static fromOKLab(okLab: OKLabColor): RGBColor {
    // 1. Oklab to Non-linear LMS (Inverse Matrix M2)
    const l_ = okLab.l + 0.3963377774 * okLab.a + 0.2158037573 * okLab.b;
    const m_ = okLab.l - 0.1055613458 * okLab.a - 0.0638541728 * okLab.b;
    const s_ = okLab.l - 0.0894841775 * okLab.a - 1.291485548 * okLab.b;

    // 2. Linear LMS (cube)
    const lmsL = l_ * l_ * l_;
    const lmsM = m_ * m_ * m_;
    const lmsS = s_ * s_ * s_;

    // 3. LMS to Linear RGB (Inverse Matrix M1)
    const lr = 4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS;
    const lg = -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS;
    const lb = -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS;

    // 4. Linear RGB to sRGB (apply Gamma) & Scale back to [0, 255]
    return new RGBColor(toSrgb(lr) * 255, toSrgb(lg) * 255, toSrgb(lb) * 255);
  }

  /**
   * Linearly interpolates (Lerps) between two sRGB colors based on an amount (0~1).
   */
  public static lerp(from: RGBColor, to: RGBColor, amount: number): RGBColor {
    const t = clampAmount(amount);
    if (t === 0) return from;
    if (t === 1) return to;

    // Linear interpolation for each color component
    const r = Math.round(from.r + (to.r - from.r) * t);
    const g = Math.round(from.g + (to.g - from.g) * t);
    const b = Math.round(from.b + (to.b - from.b) * t);
    return new RGBColor(r, g, b);
  }

  /**
   * Convert to a hex color string.
   */
  public toHex(): string {
    const r = clampSrgb(this.r).toString(16).padStart(2, "0");
    const g = clampSrgb(this.g).toString(16).padStart(2, "0");
    const b = clampSrgb(this.b).toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
  }

  /**
   * Convert to a OKLab color.
   */
  public toOKLab(): OKLabColor {
    return OKLabColor.fromRGB(this);
  }
}

export class OKLabColor {
  /** Lightness */
  public readonly l: number;
  /**  Green-Red component */
  public readonly a: number;
  /** Blue-Yellow component */
  public readonly b: number;

  public constructor(l: number, a: number, b: number) {
    this.l = l;
    this.a = a;
    this.b = b;
  }

  /**
   * Converts an RGB color to an Oklab color.
   * Note: Uses Björn Ottosson's standard Oklab transformation matrices.
   */
  public static fromRGB(rgb: RGBColor): OKLabColor {
    // 1. Normalize sRGB to [0, 1] & Convert to Linear RGB
    const lr = toLinear(rgb.r / 255);
    const lg = toLinear(rgb.g / 255);
    const lb = toLinear(rgb.b / 255);

    // 2. Linear RGB to LMS space (Matrix M1)
    const lmsL = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const lmsM = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const lmsS = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    // 3. Non-linear LMS (cube root)
    const l_ = Math.cbrt(lmsL);
    const m_ = Math.cbrt(lmsM);
    const s_ = Math.cbrt(lmsS);

    // 4. LMS to Oklab (Matrix M2)
    return new OKLabColor(
      0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
      1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
      0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
    );
  }

  /**
   * Converts an Hex color to an Oklab color.
   * Note: Uses Björn Ottosson's standard Oklab transformation matrices.
   */
  public static fromHex(hex: string): OKLabColor {
    return OKLabColor.fromRGB(RGBColor.fromHex(hex));
  }

  /**
   * Linearly interpolates (Lerps) between two Oklab colors based on an amount (0~1).
   */
  public static lerp(
    from: OKLabColor,
    to: OKLabColor,
    amount: number,
  ): OKLabColor {
    // Clamp amount between 0 and 1
    const t = clampAmount(amount);
    if (t === 0) return from;
    if (t === 1) return to;

    return new OKLabColor(
      from.l + (to.l - from.l) * t,
      from.a + (to.a - from.a) * t,
      from.b + (to.b - from.b) * t,
    );
  }

  public toHex(): string {
    return RGBColor.fromOKLab(this).toHex();
  }

  public toRGB(): RGBColor {
    return RGBColor.fromOKLab(this);
  }
}

/**
 * Naturally interpolates between two hex colors in the Oklab color space, then returns the resulting hex color.
 * @param fromHex Start color (e.g., "#FF0000")
 * @param toHex Target color (e.g., "#0000FF")
 * @param amount Transition value (0.0 ~ 1.0)
 * @returns Interpolated hex color string
 */
export function lerpHexColorInOKLab(
  fromHex: string,
  toHex: string,
  amount: number,
): string {
  // 1. Clamp amount
  const t = clampAmount(amount);
  if (t === 0) return fromHex;
  if (t === 1) return toHex;

  // 2. Convert RGB to Oklab color space
  const oklab1 = OKLabColor.fromHex(fromHex);
  const oklab2 = OKLabColor.fromHex(toHex);

  // 3. Safely interpolate (Lerp) in the Oklab space
  const lerpedOklab = OKLabColor.lerp(oklab1, oklab2, t);

  // 5. Assemble final RGB values back to a hex string (includes clamping)
  return lerpedOklab.toHex();
}

/**
 * sRGB interpolates between two hex color, then returns the resulting hex color.
 * @param fromHex Start color (e.g., "#FF0000")
 * @param toHex Target color (e.g., "#0000FF")
 * @param amount Transition value (0.0 ~ 1.0)
 * @returns Interpolated hex color string
 */
export function lerpHexColorInSRGB(
  fromHex: string,
  toHex: string,
  amount: number,
): string {
  const t = clampAmount(amount);
  if (t === 0) return fromHex;
  if (t === 1) return toHex;

  const rgb1 = RGBColor.fromHex(fromHex);
  const rgb2 = RGBColor.fromHex(toHex);

  const lerpedRgb = RGBColor.lerp(rgb1, rgb2, t);

  return lerpedRgb.toHex();
}
