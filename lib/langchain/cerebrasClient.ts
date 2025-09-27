import type { CCNEFormData } from "@/lib/validation/ccneFormSchema";
import { sanitizeForSubmission } from "@/lib/validation/ccneFormSchema";
import { buildFallbackDocx } from "@/lib/report/reportTemplate";
import { logger } from "@/lib/logger";

type CerebrasResponse = {
  base64: string;
  filename?: string;
  mimeType?: string;
};

export async function generateReportDocument(data: CCNEFormData) {
  const sanitized = sanitizeForSubmission(data);
  const endpoint = process.env.CEREBRAS_API_URL;
  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!endpoint || !apiKey) {
    logger.info("cerebras.fallback", { reason: "missing_env" });
    return buildFallbackDocx(sanitized);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "ccne-iv",
        payload: sanitized,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error("cerebras.http_error", { status: response.status, body: text.slice(0, 200) });
      throw new Error(`Cerebras request failed with status ${response.status}`);
    }

    const json = (await response.json()) as Partial<CerebrasResponse>;
    if (!json?.base64) {
      logger.error("cerebras.malformed_response");
      throw new Error("Cerebras response missing payload");
    }
    const buffer = Buffer.from(json.base64, "base64");
    return {
      buffer,
      filename: json.filename ?? `ccne-standard-iv-report-${Date.now()}.docx`,
      contentType: json.mimeType ?? "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  } catch (error) {
    logger.error("cerebras.exception", { message: error instanceof Error ? error.message : String(error) });
    return buildFallbackDocx(sanitized);
  }
}

