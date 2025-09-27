import { ELA_OUTCOME_KEYS } from "@/lib/constants/ccne";
import type { CCNEFormData } from "@/lib/validation/ccneFormSchema";

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) return "0%";
  const pct = (numerator / denominator) * 100;
  if (!Number.isFinite(pct)) return "0%";
  return `${pct.toFixed(1)}%`;
}

export function createReportSynopsis(data: CCNEFormData): string {
  const lines: string[] = [];

  lines.push(`# CCNE Standard IV Report`);
  lines.push("");
  lines.push(`Institution: ${data.programInfo.institutionName}`);
  lines.push(`Program: ${data.programInfo.programName} (${data.programInfo.programLevel})`);
  lines.push(`Accreditation cycle: ${data.programInfo.accreditationCycle}`);
  lines.push(`Dean/Director: ${data.programInfo.deanName}`);
  lines.push(`Primary contact: ${data.programInfo.contactEmail}`);
  lines.push("");

  lines.push(`Reporting window: ${data.reportingWindow.selection} — ${data.reportingWindow.startYear} to ${data.reportingWindow.endYear}`);
  lines.push("");

  data.reportingWindow.cohorts.forEach((cohort, index) => {
    lines.push(`## Cohort ${index + 1}: ${cohort.year}`);
    lines.push(`Licensure: ${cohort.licensure.firstTimePasses}/${cohort.licensure.firstTimeCandidates} (${formatPercent(cohort.licensure.firstTimePasses, cohort.licensure.firstTimeCandidates)})`);
    lines.push(
      `Completion: ${cohort.completion.numerator}/${cohort.completion.denominator} (${formatPercent(
        cohort.completion.numerator,
        cohort.completion.denominator
      )})`
    );
    lines.push(
      `Employment: ${cohort.employment.employed}/${cohort.employment.seekers} (${formatPercent(
        cohort.employment.employed,
        cohort.employment.seekers
      )})`
    );
    if (cohort.completion.exclusions.length > 0) {
      lines.push(`Exclusions:`);
      cohort.completion.exclusions.forEach((exclusion) => {
        lines.push(`- ${exclusion.category}: ${exclusion.count}${exclusion.note ? ` — ${exclusion.note}` : ""}`);
      });
    }
    if (cohort.notes) {
      lines.push(`Notes: ${cohort.notes}`);
    }
    lines.push("");
  });

  lines.push(`## Expected Levels of Achievement`);
  ELA_OUTCOME_KEYS.forEach((key) => {
    const outcome = data.expectedOutcomes[key];
    lines.push(`- ${key}: ${outcome.useDefault ? "Default" : `Override ${outcome.overrideValue ?? ""}%`}`);
    if (!outcome.useDefault && outcome.rationale) {
      lines.push(`  Rationale: ${outcome.rationale}`);
    }
  });
  lines.push("");

  lines.push(`## IV-A Narrative`);
  lines.push(data.ivaEvidence.ivaNarrative);
  lines.push("");

  lines.push(`Certification status: ${data.ivaEvidence.certificationStatus}`);
  if (data.ivaEvidence.certificationNote) {
    lines.push(`Certification note: ${data.ivaEvidence.certificationNote}`);
  }

  lines.push("");
  lines.push(`MEP Evidence count: ${data.ivaEvidence.mepEvidence.length}`);
  lines.push(`Supporting evidence count: ${data.ivaEvidence.supportingEvidence.length}`);

  return lines.join("\n");
}

export function buildFallbackDocx(data: CCNEFormData) {
  const synopsis = createReportSynopsis(data);
  const buffer = Buffer.from(synopsis, "utf-8");
  const filename = `ccne-standard-iv-report-${Date.now()}.docx`;
  return {
    buffer,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename,
  };
}

