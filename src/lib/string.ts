/**
 * Converts a string to a slug format (lowercase, no spaces, no special characters)
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '') // Remove spaces, underscores, hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
