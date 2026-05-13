export function parseJsonSafe<T = any>(
  content: string | undefined | null,
): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
