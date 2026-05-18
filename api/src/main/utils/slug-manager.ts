export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single
}

export function generateUniqueSlug(text: string, existingSlugs: number): string {
  const baseSlug = generateSlug(text);
  if (existingSlugs === 0) {
    return baseSlug;
  }
  return `${baseSlug}--${existingSlugs + 1}`;
}

export function generateTextFromSlug(slug: string): string {
  return slug
    .replace(/--\d+$/, '') // Remove trailing --number
    .replace(/-/g, ' ') // Replace - with space
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}