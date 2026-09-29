/**
 * Locale-independent number formatter that avoids SSR/client hydration mismatches.
 * Always uses "en-US" style formatting (1,234,567).
 */
export function formatNumber(n: number): string {
  const str = Math.abs(n).toString()
  const parts: string[] = []
  for (let i = str.length; i > 0; i -= 3) {
    parts.unshift(str.slice(Math.max(0, i - 3), i))
  }
  return (n < 0 ? "-" : "") + parts.join(",")
}
