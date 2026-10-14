import { cookies } from "next/headers";
import { safePreview } from "@/lib/preview";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isSameOrigin } from "@/lib/origin";
import { boundedJSON, HTTPError } from "@/lib/http";
import {
  loadGuest,
  saveGuestProfile,
  saveGuestAssessment,
  deleteGuest,
  assessmentInputSchema,
  consumeDatabaseBudget,
} from "@/lib/postgres";
import { profileSchema } from "@/lib/domain";
import { verifyAccess, accessCookie } from "@/lib/access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookieName = "nl-guest";
async function handle(
  request: Request,
  operation: "load" | "profile" | "assessment" | "delete",
) {
  if (safePreview)
    return NextResponse.json(
      { error: "Hosted persistence disabled in fixture preview" },
      { status: 503 },
    );
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  if (process.env.PERSISTENCE_PROVIDER !== "postgres")
    return NextResponse.json(
      { error: "Hosted persistence is not enabled" },
      { status: 503 },
    );
  const jar = await cookies();
  const raw = jar.get(cookieName)?.value;
  const token =
    raw && /^[a-f0-9]{64}$/.test(raw) ? raw : randomBytes(32).toString("hex");
  try {
    if (
      process.env.NODE_ENV === "production" &&
      !verifyAccess(jar.get(accessCookie)?.value)
    )
      throw new HTTPError(
        "Unlock hosted guest storage in Settings with the organizer access code.",
        401,
      );
    if (!(await consumeDatabaseBudget("progress:global", 120)))
      throw new HTTPError("Progress request limit reached", 429);
    let data: unknown;
    if (operation === "load") data = await loadGuest(token);
    else if (operation === "delete") {
      await deleteGuest(token);
      data = { deleted: true };
    } else {
      const body = await boundedJSON(request, 12000);
      if (operation === "profile") {
        const p = profileSchema.safeParse(body);
        if (!p.success) throw new HTTPError("Invalid learner preferences", 400);
        await saveGuestProfile(token, p.data);
        data = { saved: true };
      } else {
        const input = assessmentInputSchema.safeParse(body);
        if (!input.success)
          throw new HTTPError("Invalid assessment answers", 400);
        data = { activity: await saveGuestAssessment(token, input.data) };
      }
    }
    const response = NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
    response.cookies.set(cookieName, operation === "delete" ? "" : token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: operation === "delete" ? 0 : 2592000,
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof HTTPError
            ? e.message
            : "Hosted progress unavailable. Browser progress remains safe.",
      },
      {
        status: e instanceof HTTPError ? e.status : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export const GET = (r: Request) => handle(r, "load");
export const PUT = (r: Request) => handle(r, "profile");
export const POST = (r: Request) => handle(r, "assessment");
export const DELETE = (r: Request) => handle(r, "delete");
