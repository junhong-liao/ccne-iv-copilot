import { NextRequest, NextResponse } from "next/server";
import { getTempReport } from "@/lib/storage/tempStorage";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  const entry = getTempReport(token);
  if (!entry) {
    return NextResponse.json({ status: "error", message: "Report link expired or invalid." }, { status: 404 });
  }

  return new NextResponse(entry.buffer, {
    headers: {
      "Content-Type": entry.contentType,
      "Content-Disposition": `attachment; filename="${entry.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

