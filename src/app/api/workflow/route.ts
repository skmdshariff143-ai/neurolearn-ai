import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { workflowRequestSchema } from "@/lib/learning-schemas";
import { runStructuredTask } from "@/lib/workflow";
import { ProviderError } from "@/lib/providers";
import { allowRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/origin";
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  const jar = await cookies();
  const id = jar.get("nl-session")?.value ?? randomUUID();
  if (!allowRequest(id))
    return NextResponse.json(
      { error: "Request limit reached. Wait one minute." },
      { status: 429 },
    );
  try {
    const text = await request.text();
    if (text.length > 12000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = workflowRequestSchema.safeParse(raw);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid learning task input" },
        { status: 400 },
      );
    const response = NextResponse.json(await runStructuredTask(parsed.data), {
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
            : "Learning task unavailable; please retry.",
      },
      { status: e instanceof ProviderError ? e.status : 502 },
    );
  }
}
