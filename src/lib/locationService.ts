
/**
 * Returns a promise resolving to the user's two-letter country code (e.g. "GB") or undefined.
 */
export async function getCountryCodeFromIP(): Promise<string | undefined> {
  try {
    // Use ipapi.co for an easy, privacy-friendly lookup (no API key needed)
    const resp = await fetch("https://ipapi.co/json/");
    if (!resp.ok) return undefined;
    const data = await resp.json();
    return data && typeof data.country === "string" ? data.country : undefined;
  } catch (e) {
    return undefined;
  }
}
