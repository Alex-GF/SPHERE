export function getColorForIndex(index: number): string {
  // A pleasant, varied palette — repeatable and vibrant
  const palette = [
    '#5B8CFF', // blue
    '#7C5CFF', // purple
    '#FF7AB6', // pink
    '#FFA657', // orange
    '#4BD5BE', // teal
    '#FFD36E', // yellow
    '#6EE7B7', // greenish
    '#8BD3FF', // light blue
    '#D6A0FF', // light purple
  ];
  return palette[index % palette.length];
}

export function indexFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

