export function isSameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const supplied = new URL(origin);
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    return supplied.protocol === url.protocol && supplied.host === host;
  } catch {
    return false;
  }
}
