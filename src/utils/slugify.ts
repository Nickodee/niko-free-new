/**
 * Converts a string to a URL-friendly slug
 * Example: "Summer Music Festival 2024" -> "summer-music-festival-2024"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Generates an event slug from title and ID
 * Example: "Summer Festival", 25 -> "summer-festival-25"
 */
export function generateEventSlug(title: string, id: string | number): string {
  const slug = slugify(title);
  return `${slug}-${id}`;
}

/**
 * Extracts event ID from slug
 * Example: "summer-festival-25" -> "25"
 */
export function extractEventIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  // Check if last part is a number
  if (/^\d+$/.test(lastPart)) {
    return lastPart;
  }
  // Fallback: return the slug as-is (might be a direct ID)
  return slug;
}
