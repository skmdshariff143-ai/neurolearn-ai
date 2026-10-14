// Public policy flag is bundled at build time. Rebuild when changing it.
export const safePreview = process.env.NEXT_PUBLIC_SAFE_PREVIEW === "true";
const transient = new Map<string, string>();
export const guestStorage = {
  getItem(key: string): string | null {
    return safePreview
      ? (transient.get(key) ?? null)
      : localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (safePreview) transient.set(key, value);
    else localStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (safePreview) transient.delete(key);
    else localStorage.removeItem(key);
  },
};
