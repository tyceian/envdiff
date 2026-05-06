/**
 * Masker: partial masking utilities for displaying env values safely
 */

export type MaskMode = "full" | "partial" | "length";

export function maskFull(value: string): string {
  return "***";
}

export function maskPartial(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) return "***";
  const visible = value.slice(-visibleChars);
  const hidden = "*".repeat(Math.min(value.length - visibleChars, 6));
  return `${hidden}${visible}`;
}

export function maskLength(value: string): string {
  return `[${value.length} chars]`;
}

export function maskValue(
  value: string,
  mode: MaskMode = "full"
): string {
  if (value.length === 0) return value;
  switch (mode) {
    case "full":
      return maskFull(value);
    case "partial":
      return maskPartial(value);
    case "length":
      return maskLength(value);
    default:
      return maskFull(value);
  }
}

export function parseMaskMode(raw: string | undefined): MaskMode {
  if (raw === "partial" || raw === "length" || raw === "full") return raw;
  return "full";
}
