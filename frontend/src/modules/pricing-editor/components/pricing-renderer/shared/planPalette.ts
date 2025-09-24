// planPalette.ts - small palette helper for MUI renderer
const PALETTE: Array<[string, string, string]> = [
  ['#7c3aed', '#6d28d9', '#4c1d95'], // purple
  ['#2563eb', '#1e40af', '#0b61d8'], // blue
  ['#059669', '#047857', '#065f46'], // green
  ['#ec4899', '#be185d', '#9d174d'], // pink
  ['#14b8a6', '#0f766e', '#0b6158'], // teal
  ['#ef4444', '#b91c1c', '#7f1d1d'], // red
  ['#f59e0b', '#d97706', '#92400e'], // amber
  ['#0ea5e9', '#0369a1', '#075985'], // cyan
];

export function getPlanGradient(index: number): string {
  const [a, b] = PALETTE[index % PALETTE.length];
  return `linear-gradient(90deg, ${a}, ${b})`;
}

export function getPlanAccent(index: number): string {
  return PALETTE[index % PALETTE.length][2];
}

export default PALETTE;
