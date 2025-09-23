// PlanColorPalette.ts
// Generates a palette of up to 20 visually distinct Tailwind gradient color classes for plan columns

const PALETTE = [
  'from-purple-400 to-purple-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-pink-400 to-pink-600',
  'from-teal-400 to-teal-600',
  'from-red-400 to-red-600',
  'from-yellow-400 to-yellow-600',
  'from-indigo-400 to-indigo-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-emerald-400 to-emerald-600',
  'from-cyan-400 to-cyan-600',
  'from-orange-400 to-orange-600',
  'from-lime-400 to-lime-600',
  'from-amber-400 to-amber-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-sky-400 to-sky-600',
  'from-stone-400 to-stone-600',
  'from-gray-400 to-gray-600',
  'from-neutral-400 to-neutral-600',
];

export function getPlanColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}
