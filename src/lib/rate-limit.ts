const limits = new Map<string, { count: number; reset: number }>();
export function allowRequest(key: string, now = Date.now()) {
  const current = limits.get(key);
  if (!current || current.reset <= now) {
    if (limits.size >= 10000) {
      for (const [id, value] of limits)
        if (value.reset <= now) limits.delete(id);
      if (limits.size >= 10000) return false;
    }
    limits.set(key, { count: 1, reset: now + 60000 });
    return true;
  }
  if (current.count >= 12) return false;
  current.count++;
  return true;
}
