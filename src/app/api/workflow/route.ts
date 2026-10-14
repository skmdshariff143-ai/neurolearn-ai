import { NextResponse, after } from "next/server";
import { safePreview } from "@/lib/preview";
import { flushTraces } from "@/lib/telemetry";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { workflowRequestSchema } from "@/lib/learning-schemas";
import { runStructuredTask } from "@/lib/workflow";
import { ProviderError } from "@/lib/providers";
import { allowRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/origin";
import { boundedJSON, HTTPError } from "@/lib/http";
import { authorizeExternal, accessCookie } from "@/lib/access";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (safePreview)
    return NextResponse.json(
      { error: "Live learning tasks disabled in fixture preview" },
      { status: 503 },
    );
  after(flushTraces);
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
    const raw = await boundedJSON(request);
    const parsed = workflowRequestSchema.safeParse(raw);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid learning task input" },
        { status: 400 },
      );
    if ((process.env.AI_PROVIDER ?? "fixture") !== "fixture")
      await authorizeExternal(jar.get(accessCookie)?.value);
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
          e instanceof ProviderError || e instanceof HTTPError
            ? e.message
            : "Learning task unavailable; please retry.",
      },
      {
        status:
          e instanceof ProviderError || e instanceof HTTPError ? e.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
