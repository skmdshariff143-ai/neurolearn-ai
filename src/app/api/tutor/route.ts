import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { requestSchema } from "@/lib/domain";
import { generateLesson, ProviderError } from "@/lib/providers";
import { allowRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/origin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 10000)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const jar = await cookies();
  const id = jar.get("nl-session")?.value ?? randomUUID();
  if (!allowRequest(id))
    return NextResponse.json(
      { error: "Please wait one minute before requesting more lessons." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  try {
    const raw = await request.text();
    if (raw.length > 10000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid topic, language, or teaching strategy" },
        { status: 400 },
      );
    const response = NextResponse.json(await generateLesson(parsed.data), {
      headers: { "Cache-Control": "no-store" },
    });
    response.cookies.set("nl-session", id, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400,
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof ProviderError
            ? e.message
            : "The lesson could not be generated. Your saved progress is safe.",
      },
      { status: e instanceof ProviderError ? e.status : 502 },
    );
  }
}
