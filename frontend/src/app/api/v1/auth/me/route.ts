import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/server-auth";

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export async function GET(request: Request) {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const phone = verifySessionToken(token);
  if (!phone) {
    return NextResponse.json({ detail: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({ phone });
}
