/**
 * Conservative sanitization for filesystem path segments.
 * - Removes Windows-illegal characters: < > : " / \ | ? *
 * - Collapses whitespace
 * - Blocks path traversal via "." and ".."
 */
export const sanitizePathSegment = (raw: unknown, fallback: string): string => {
  const value = typeof raw === "string" ? raw.trim() : ""
  if (!value) return fallback

  // Remove illegal characters and normalize spaces
  const cleaned = value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "") // illegal + control chars
    .replace(/\s+/g, "_")

  // Prevent "." / ".." and empty results
  if (cleaned === "." || cleaned === ".." || cleaned.length === 0) return fallback

  return cleaned
}