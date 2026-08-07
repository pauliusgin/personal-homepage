/**
 * The guard wraps the lookup rather than just the read: `window.localStorage`
 * can throw on the property access itself under an enterprise policy or private
 * mode, and everything `/news` stores is a nicety.
 */
export function resolveGuardedLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}
