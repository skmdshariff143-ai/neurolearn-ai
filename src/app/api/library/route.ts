import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { isSameOrigin } from "@/lib/origin";
import { boundedJSON, HTTPError } from "@/lib/http";
import { verifyAccess, accessCookie } from "@/lib/access";
import { consumeDatabaseBudget, guestTransaction } from "@/lib/postgres";
import {
  libraryWriteSchema,
  loadLibrary,
  saveCourse,
  saveResource,
} from "@/lib/learning-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  try {
    if (!isSameOrigin(request))
      throw new HTTPError("Cross-origin request rejected", 403);
    if (process.env.PERSISTENCE_PROVIDER !== "postgres")
      throw new HTTPError("Hosted library is not enabled", 503);
    const jar = await cookies();
    if (
      process.env.NODE_ENV === "production" &&
      !verifyAccess(jar.get(accessCookie)?.value)
    )
      throw new HTTPError("Unlock hosted storage in Settings first", 401);
    if (!(await consumeDatabaseBudget("library:global", 30)))
      throw new HTTPError("Library request limit reached", 429);
    const raw = jar.get("nl-guest")?.value;
    const token =
      raw && /^[a-f0-9]{64}$/.test(raw) ? raw : randomBytes(32).toString("hex");
    let data: unknown;
    if (request.method === "GET") data = await loadLibrary(token);
    else if (request.method === "DELETE") {
      const id = new URL(request.url).searchParams.get("resource");
      if (!id || !/^[0-9a-f-]{36}$/.test(id))
        throw new HTTPError("Invalid document identifier", 400);
      await guestTransaction(token, (client, owner) =>
        client.query(
          "delete from neurolearn.resources where id=$1 and learner_id=$2",
          [id, owner],
        ),
      );
      data = { deleted: true };
    } else {
      const input = libraryWriteSchema.safeParse(
        await boundedJSON(request, 500000),
      );
      if (!input.success)
        throw new HTTPError("Invalid course or document", 400);
      if (input.data.kind === "course")
        await saveCourse(token, input.data.data);
      else await saveResource(token, input.data.data);
      data = { saved: true };
    }
    const response = NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
    response.cookies.set("nl-guest", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 2592000,
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof HTTPError
            ? e.message
            : "Hosted library unavailable. Browser records remain saved.",
      },
      {
        status: e instanceof HTTPError ? e.status : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
