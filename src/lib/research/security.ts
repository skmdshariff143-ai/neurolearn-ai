/**
 * Security & SSRF protections for external research retrieval.
 * Enforces safe protocols, hostname sanitization, prompt-injection defense, and size limits.
 */

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127(?:\.[0-9]+){1,3}$/,
  /^10(?:\.[0-9]+){1,3}$/,
  /^192\.168(?:\.[0-9]+){1,2}$/,
  /^172\.(?:1[6-9]|2[0-9]|3[0-1])(?:\.[0-9]+){1,2}$/,
  /^169\.254(?:\.[0-9]+){1,2}$/,
  /^0\.0\.0\.0$/,
  /^0$/,
  /^2130706433$/, // 127.0.0.1 in decimal integer format
  /^0x7f/i,      // 127.0.0.1 in hex format
  /^\[?::1?\]?$/,
  /^\[?::ffff:(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/i,
  /^\[?fe80:/i,
  /^\[?fc00:/i,
  /^\[?fd00:/i,
  /\.internal$/i,
  /\.local$/i,
  /\.corp$/i,
  /\.onion$/i,
  /\.localhost$/i,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?previous\s+instructions/gi,
  /disregard\s+(?:all\s+)?prior\s+instructions/gi,
  /system\s*:\s*(?:you\s+are|override|instructions)/gi,
  /you\s+are\s+now\s+(?:unrestricted|dan|developer\s+mode|jailbroken)/gi,
  /!\[[^\]]*\]\s*\(\s*https?:\/\/[^\s)]+\)/gi, // Markdown image exfiltration
  /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
];

export function isSafeExternalUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.port && !["443", "8443"].includes(parsed.port)) return false;

    const hostname = parsed.hostname.toLowerCase();
    for (const pattern of BLOCKED_HOST_PATTERNS) {
      if (pattern.test(hostname)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function sanitizeUntrustedExcerpt(rawText: string, maxLength = 1200): string {
  let cleaned = rawText.replace(/\r\n/g, "\n");

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, " [untrusted content redacted] ");
  }

  // Strip excessive repeated whitespace
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");

  return cleaned.trim().slice(0, maxLength);
}

export function extractMeaningfulTerms(text: string): string[] {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
  const stopwords = new Set([
    "the", "and", "for", "from", "with", "that", "this", "what", "which",
    "about", "into", "over", "after", "learn", "learning", "study", "studying",
    "explain", "overview", "introduction", "basics", "concept", "concepts",
  ]);

  return Array.from(
    new Set(
      words
        .filter((w) => !stopwords.has(w))
        .map((w) => w.replace(/s$/, "")),
    ),
  );
}
