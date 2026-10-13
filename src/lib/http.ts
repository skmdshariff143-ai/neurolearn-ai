export class HTTPError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function boundedJSON(
  request: Request,
  maxBytes = 32000,
): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new HTTPError("Request too large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new HTTPError("Invalid JSON", 400);
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HTTPError("Request too large", 413);
    }
    parts.push(value);
  }
  try {
    return JSON.parse(new TextDecoder().decode(Buffer.concat(parts)));
  } catch {
    throw new HTTPError("Invalid JSON", 400);
  }
}
