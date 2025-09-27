import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ccneFormSchema } from "@/lib/validation/ccneFormSchema";
import { generateReportDocument } from "@/lib/langchain/cerebrasClient";
import { putTempReport } from "@/lib/storage/tempStorage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const startedAt = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = ccneFormSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({
      path: issue.path.join("/"),
      message: issue.message,
    }));
    logger.info("generateReport.validation_failed", { requestId, issueCount: issues.length });
    return NextResponse.json({ status: "error", message: "Validation failed.", issues }, { status: 400 });
  }

  const data = parsed.data;
  logger.info("generateReport.accepted", {
    requestId,
    programLevel: data.programInfo.programLevel,
    window: data.reportingWindow.selection,
    cohorts: data.reportingWindow.cohorts.length,
  });

  try {
    const { buffer, filename, contentType } = await generateReportDocument(data);
    const { token, expiresAt } = putTempReport({ buffer, filename, contentType });
    const durationMs = Date.now() - startedAt;
    logger.info("generateReport.success", { requestId, durationMs });
    return NextResponse.json(
      {
        status: "success",
        reportUrl: `/api/generateReport/${token}`,
        filename,
        expiresAt: new Date(expiresAt).toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("generateReport.exception", { requestId, message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ status: "error", message: "Unable to generate report." }, { status: 500 });
  }
}

