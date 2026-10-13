const limits = new Map<string, { count: number; reset: number }>();
export function allowRequest(key: string, now = Date.now()) {
  const current = limits.get(key);
  if (!current || current.reset <= now) {
    if (limits.size >= 10000) limits.clear();
    limits.set(key, { count: 1, reset: now + 60000 });
    return true;
  }
  if (current.count >= 12) return false;
  current.count++;
  return true;
}
