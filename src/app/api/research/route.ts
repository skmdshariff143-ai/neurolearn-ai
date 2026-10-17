import { NextResponse, after } from "next/server";
import { z } from "zod";
import { safePreview } from "@/lib/preview";
import { flushTraces } from "@/lib/telemetry";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { defaultResearchCoordinator } from "@/lib/research/coordinator";
import { educationalLevelSchema, researchLanguageSchema } from "@/lib/research/types";
import { allowRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/origin";
import { boundedJSON, HTTPError } from "@/lib/http";
import { authorizeExternal, accessCookie } from "@/lib/access";

export const runtime = "nodejs";

const researchRequestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  level: educationalLevelSchema.default("Beginner"),
  language: researchLanguageSchema.default("English"),
});

export async function POST(request: Request) {
  after(flushTraces);
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  }

  if (Number(request.headers.get("content-length") ?? 0) > 16000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const jar = await cookies();
  const id = jar.get("nl-session")?.value ?? randomUUID();
  if (!allowRequest(id)) {
    return NextResponse.json(
      { error: "Please wait one minute before requesting more research." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const body = await boundedJSON(request);
    const parsed = researchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid topic, level, or language" },
        { status: 400 },
      );
    }

    if (safePreview) {
      throw new HTTPError(
        "Educational research is disabled in the fixture preview",
        503,
      );
    }

    if (!safePreview) {
      await authorizeExternal(jar.get(accessCookie)?.value);
    }

    const result = await defaultResearchCoordinator.coordinateResearch(
      parsed.data.topic,
      parsed.data.level,
      parsed.data.language,
    );

    const response = NextResponse.json(result, {
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
          e instanceof HTTPError
            ? e.message
            : "The research could not be completed. Please retry.",
      },
      {
        status: e instanceof HTTPError ? e.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
