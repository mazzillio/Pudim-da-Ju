/** Mirrors `GET /feature-flags` (Api/src/modules/feature-flags). */
export interface FeatureFlags {
  /** Shows the "frete grátis hoje" banner under the header. */
  freeShipping: boolean;
}

const API_URL = process.env.API_URL || "http://localhost:3333";

const allOff: FeatureFlags = { freeShipping: false };

/**
 * Read fresh on every request so the owner's toggle shows up right away.
 * A flag is never worth breaking the catalog over: any failure means "all off".
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const response = await fetch(`${API_URL}/feature-flags`, { cache: "no-store" });
    if (!response.ok) return allOff;
    const flags = (await response.json()) as Partial<FeatureFlags>;
    return { freeShipping: flags.freeShipping === true };
  } catch {
    return allOff;
  }
}
