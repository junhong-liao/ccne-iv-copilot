"use client";

import { sanitizeForSubmission, type CCNEFormData } from "@/lib/validation/ccneFormSchema";

export type GenerateReportSuccess = {
  status: "success";
  reportUrl: string;
  filename: string;
  expiresAt?: string | null;
};

export type GenerateReportError = {
  status: "error";
  message: string;
};

export type GenerateReportResult = GenerateReportSuccess | GenerateReportError;

type Options = {
  signal?: AbortSignal;
};

export async function generateReport(data: CCNEFormData, options: Options = {}): Promise<GenerateReportResult> {
  const payload = sanitizeForSubmission(data);

  let response: Response;
  try {
    response = await fetch("/api/generateReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: options.signal,
    });
  } catch (error) {
    const message = error instanceof DOMException && error.name === "AbortError" ? "Submission cancelled." : "Network request failed.";
    return { status: "error", message };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { status: "error", message: "Unexpected response payload." };
  }

  if (!response.ok) {
    const message = typeof (json as any)?.message === "string" ? (json as any).message : "Report generation failed.";
    return { status: "error", message };
  }

  if (typeof (json as any)?.status === "success" && typeof (json as any)?.reportUrl === "string") {
    return {
      status: "success",
      reportUrl: (json as any).reportUrl,
      filename: typeof (json as any).filename === "string" ? (json as any).filename : "ccne-standard-iv-report.docx",
      expiresAt: typeof (json as any).expiresAt === "string" ? (json as any).expiresAt : null,
    };
  }

  const message = typeof (json as any)?.message === "string" ? (json as any).message : "Report generation failed.";
  return { status: "error", message };
}

