import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/origin";
import { boundedJSON, HTTPError } from "@/lib/http";
import {
  accessCookie,
  mintAccess,
  codeMatches,
  requestBudget,
} from "@/lib/access";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  try {
    if (!(await requestBudget("access:global", 30)))
      throw new HTTPError("Access attempts limited. Wait one minute.", 429);
    const input = z
      .object({ code: z.string().min(1).max(128) })
      .safeParse(await boundedJSON(request, 1024));
    if (!input.success) throw new HTTPError("Enter an access code", 400);
    if (!codeMatches(input.data.code))
      throw new HTTPError("Invalid access code", 401);
    const response = NextResponse.json(
      { unlocked: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(accessCookie, mintAccess(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof HTTPError ? e.message : "Access unavailable" },
      {
        status: e instanceof HTTPError ? e.status : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export async function DELETE(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  const response = NextResponse.json(
    { unlocked: false },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(accessCookie, "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
