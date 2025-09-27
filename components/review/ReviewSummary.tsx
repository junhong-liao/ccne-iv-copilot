"use client";

import React, { useMemo } from "react";
import {
  PROGRAM_LEVELS,
  REPORTING_WINDOWS,
  EXCLUSION_CATEGORIES,
  DATA_SOURCES,
  deriveDefaultEla,
  ELA_OUTCOME_KEYS,
} from "@/lib/constants/ccne";
import { useCCNEForm } from "@/lib/context/ccneFormContext";
import EditableSection from "@/components/review/EditableSection";

const programLevelLabels = new Map(PROGRAM_LEVELS.map((item) => [item.value, item.label]));
const reportingWindowLabels = new Map(REPORTING_WINDOWS.map((item) => [item.id, item.label]));
const exclusionLabels = new Map(EXCLUSION_CATEGORIES.map((item) => [item.value, item.label]));
const dataSourceLabels = new Map(DATA_SOURCES.map((item) => [item.value, item.label]));

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) return "–";
  const pct = (numerator / denominator) * 100;
  if (!Number.isFinite(pct)) return "–";
  return `${pct.toFixed(1)}%`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function adjustedDenominator(denominator: number, exclusions: ReadonlyArray<{ count: number }>) {
  const exclusionTotal = exclusions.reduce((sum, item) => sum + item.count, 0);
  return Math.max(0, denominator - exclusionTotal);
}

export default function ReviewSummary() {
  const { data } = useCCNEForm();

  const defaultEla = useMemo(() => deriveDefaultEla(data.programInfo.programLevel), [data.programInfo.programLevel]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <EditableSection
        title="Program information"
        editPath="/step1"
        description="Verify leadership and contact details before submission."
      >
        <dl className="summary-grid">
          <div>
            <dt>Institution</dt>
            <dd>{data.programInfo.institutionName || "—"}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{data.programInfo.programName || "—"}</dd>
          </div>
          <div>
            <dt>Program level</dt>
            <dd>{programLevelLabels.get(data.programInfo.programLevel) ?? data.programInfo.programLevel}</dd>
          </div>
          <div>
            <dt>Accreditation cycle</dt>
            <dd>{data.programInfo.accreditationCycle || "—"}</dd>
          </div>
          <div>
            <dt>Dean/Director</dt>
            <dd>{data.programInfo.deanName || "—"}</dd>
          </div>
          <div>
            <dt>Primary contact email</dt>
            <dd>{data.programInfo.contactEmail || "—"}</dd>
          </div>
        </dl>
      </EditableSection>

      <EditableSection
        title="Reporting window & cohorts"
        editPath="/step2"
        description="Confirm cohorts, exclusion rationale, and derived outcome rates."
      >
        <dl className="summary-grid">
          <div>
            <dt>Window selection</dt>
            <dd>{reportingWindowLabels.get(data.reportingWindow.selection) ?? data.reportingWindow.selection}</dd>
          </div>
          <div>
            <dt>Start year</dt>
            <dd>{data.reportingWindow.startYear || "—"}</dd>
          </div>
          <div>
            <dt>End year</dt>
            <dd>{data.reportingWindow.endYear || "—"}</dd>
          </div>
        </dl>

        <div style={{ display: "grid", gap: 12 }}>
          {data.reportingWindow.cohorts.map((cohort, index) => {
            const adjusted = adjustedDenominator(cohort.completion.denominator, cohort.completion.exclusions);
            const completionRate = formatPercent(cohort.completion.numerator, adjusted || cohort.completion.denominator);
            const licensureRate = formatPercent(
              cohort.licensure.firstTimePasses,
              cohort.licensure.firstTimeCandidates
            );
            const employmentRate = formatPercent(cohort.employment.employed, cohort.employment.seekers);

            return (
              <article
                key={cohort.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                }}
              >
                <header style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <h4 style={{ margin: 0 }}>Cohort {cohort.year || "(year TBD)"}</h4>
                  {cohort.notes ? <span style={{ fontSize: 13, color: "#6b7280" }}>{cohort.notes}</span> : null}
                </header>
                <dl className="summary-grid" style={{ marginTop: 12 }}>
                  <div>
                    <dt>Licensure</dt>
                    <dd>
                      {cohort.licensure.firstTimePasses}/{cohort.licensure.firstTimeCandidates} • {licensureRate}
                    </dd>
                  </div>
                  <div>
                    <dt>Completion</dt>
                    <dd>
                      {cohort.completion.numerator}/{cohort.completion.denominator}
                      {adjusted !== cohort.completion.denominator ? ` (adjusted ${adjusted})` : ""} • {completionRate}
                    </dd>
                  </div>
                  <div>
                    <dt>Employment</dt>
                    <dd>
                      {cohort.employment.employed}/{cohort.employment.seekers} • {employmentRate}
                    </dd>
                  </div>
                  <div>
                    <dt>Employment source</dt>
                    <dd>
                      {dataSourceLabels.get(cohort.employment.dataSource) ?? cohort.employment.dataSource}
                      {cohort.employment.otherSourceLabel ? ` — ${cohort.employment.otherSourceLabel}` : ""}
                    </dd>
                  </div>
                </dl>

                {cohort.completion.exclusions.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <h5 style={{ margin: "0 0 8px", fontSize: 14 }}>Exclusions</h5>
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                      {cohort.completion.exclusions.map((exclusion) => (
                        <li key={`${exclusion.category}-${exclusion.count}`} style={{ fontSize: 14 }}>
                          <strong>{exclusion.count}</strong> — {exclusionLabels.get(exclusion.category) ?? exclusion.category}
                          {exclusion.note ? ` (${exclusion.note})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </EditableSection>

      <EditableSection
        title="Expected levels of achievement"
        editPath="/step3"
        description="Ensure overrides include rationale and match institutional benchmarks."
      >
        <div style={{ display: "grid", gap: 12 }}>
          {ELA_OUTCOME_KEYS.map((key) => {
            const outcome = data.expectedOutcomes[key];
            const defaults = defaultEla[key];
            const usingDefault = outcome.useDefault;
            const value = usingDefault ? defaults : outcome.overrideValue;
            return (
              <article key={key} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                <header style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <h4 style={{ margin: 0, textTransform: "capitalize" }}>{key}</h4>
                  <span className="pill" style={{ backgroundColor: usingDefault ? "#e0f2fe" : "#ede9fe" }}>
                    {usingDefault ? "Using default" : "Using override"}
                  </span>
                </header>
                <dl className="summary-grid" style={{ marginTop: 12 }}>
                  <div>
                    <dt>Default ELA</dt>
                    <dd>{defaults}%</dd>
                  </div>
                  <div>
                    <dt>Selected ELA</dt>
                    <dd>{value ?? "—"}%</dd>
                  </div>
                </dl>
                {!usingDefault ? (
                  <div style={{ marginTop: 12 }}>
                    <h5 style={{ margin: "0 0 4px", fontSize: 14 }}>Rationale</h5>
                    <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>{outcome.rationale || "—"}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </EditableSection>

      <EditableSection
        title="IV-A evidence"
        editPath="/step4"
        description="Verify certification status, narrative, and supporting documents."
      >
        <dl className="summary-grid">
          <div>
            <dt>Certification status</dt>
            <dd style={{ textTransform: "capitalize" }}>{data.ivaEvidence.certificationStatus.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt>Certification note</dt>
            <dd>{data.ivaEvidence.certificationNote || "—"}</dd>
          </div>
        </dl>

        <div>
          <h4 style={{ margin: "8px 0" }}>Narrative</h4>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{data.ivaEvidence.ivaNarrative || "—"}</p>
        </div>

        <div>
          <h4 style={{ margin: "16px 0 8px" }}>MEP evidence</h4>
          {data.ivaEvidence.mepEvidence.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>No files attached.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {data.ivaEvidence.mepEvidence.map((file) => (
                <li key={file.id} style={{ fontSize: 14 }}>
                  {file.name} • {formatBytes(file.size)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 style={{ margin: "16px 0 8px" }}>Supporting evidence</h4>
          {data.ivaEvidence.supportingEvidence.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>No supporting items recorded.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {data.ivaEvidence.supportingEvidence.map((item) => (
                <li key={item.id} style={{ fontSize: 14 }}>
                  {item.kind === "file" ? (
                    <span>
                      {item.name} • {formatBytes(item.size)}
                    </span>
                  ) : (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                      {item.title}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </EditableSection>
    </div>
  );
}

