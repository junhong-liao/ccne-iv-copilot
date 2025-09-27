"use client";

import React from "react";
import { DATA_SOURCES, EXCLUSION_CATEGORIES, MAX_COHORTS, REPORTING_WINDOWS } from "@/lib/constants/ccne";
import { useCCNEForm } from "@/lib/context/ccneFormContext";
import { defaultCohort, type ReportingCohort } from "@/lib/validation/ccneFormSchema";

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) return "–";
  const pct = (numerator / denominator) * 100;
  if (!Number.isFinite(pct)) return "–";
  return `${pct.toFixed(1)}%`;
}

function cohortAdjustedDenominator(cohort: ReportingCohort) {
  const exclusionTotal = cohort.completion.exclusions.reduce((sum, exclusion) => sum + exclusion.count, 0);
  return Math.max(0, cohort.completion.denominator - exclusionTotal);
}

const numberValue = (value: string) => {
  if (value === "") return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function CohortWindowForm() {
  const { data, setData, updateField, errors, onBlurValidateField } = useCCNEForm();
  const { reportingWindow } = data;

  const fieldError = (pointer: string) => errors[pointer];

  const handleHeaderChange = (
    pointer: string
  ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateField(pointer, event.target.value);
  };

  const handleNumberChange = (pointer: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField(pointer, numberValue(event.target.value));
  };

  const removeCohort = (index: number) => {
    setData((prev) => ({
      ...prev,
      reportingWindow: {
        ...prev.reportingWindow,
        cohorts: prev.reportingWindow.cohorts.filter((_, i) => i !== index),
      },
    }));
  };

  const addCohort = () => {
    setData((prev) => ({
      ...prev,
      reportingWindow: {
        ...prev.reportingWindow,
        cohorts: [...prev.reportingWindow.cohorts, defaultCohort()],
      },
    }));
  };

  const addExclusion = (cohortIndex: number, category: string) => {
    updateField(`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/-`, {
      category,
      count: 0,
      note: "",
    });
  };

  const removeExclusion = (cohortIndex: number, exclusionIndex: number) => {
    setData((prev) => ({
      ...prev,
      reportingWindow: {
        ...prev.reportingWindow,
        cohorts: prev.reportingWindow.cohorts.map((cohort, idx) => {
          if (idx !== cohortIndex) return cohort;
          return {
            ...cohort,
            completion: {
              ...cohort.completion,
              exclusions: cohort.completion.exclusions.filter((_, exIdx) => exIdx !== exclusionIndex),
            },
          };
        }),
      },
    }));
  };

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="cohort-window-heading">
      <h3 id="cohort-window-heading">Reporting window & cohorts</h3>
      <p style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>
        Select your reporting window and capture outcome data for each cohort year. Exclusions should only cover
        allowable CCNE categories.
      </p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 16 }}>
        <div>
          <label htmlFor="reportingWindow/selection">Window preference</label>
          <select
            id="reportingWindow/selection"
            name="reportingWindow/selection"
            value={reportingWindow.selection}
            onChange={handleHeaderChange("reportingWindow/selection")}
            onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
            className="field"
          >
            {REPORTING_WINDOWS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reportingWindow/startYear">Start year</label>
          <input
            id="reportingWindow/startYear"
            name="reportingWindow/startYear"
            value={reportingWindow.startYear}
            onChange={handleHeaderChange("reportingWindow/startYear")}
            onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
            className="field"
            placeholder="e.g., 2021"
          />
          {fieldError("reportingWindow/startYear") && (
            <div className="field-error">{fieldError("reportingWindow/startYear")}</div>
          )}
        </div>
        <div>
          <label htmlFor="reportingWindow/endYear">End year</label>
          <input
            id="reportingWindow/endYear"
            name="reportingWindow/endYear"
            value={reportingWindow.endYear}
            onChange={handleHeaderChange("reportingWindow/endYear")}
            onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
            className="field"
            placeholder="e.g., 2023"
          />
          {fieldError("reportingWindow/endYear") && (
            <div className="field-error">{fieldError("reportingWindow/endYear")}</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Cohort outcomes</h4>
        <button
          type="button"
          className="btn"
          onClick={addCohort}
          disabled={reportingWindow.cohorts.length >= MAX_COHORTS}
        >
          Add cohort
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {reportingWindow.cohorts.map((cohort, cohortIndex) => {
          const adjusted = cohortAdjustedDenominator(cohort);
          const completionRate = formatPercent(cohort.completion.numerator, adjusted || cohort.completion.denominator);
          const licensureRate = formatPercent(cohort.licensure.firstTimePasses, cohort.licensure.firstTimeCandidates);
          const employmentRate = formatPercent(cohort.employment.employed, cohort.employment.seekers);

          const usedCategories = cohort.completion.exclusions.map((item) => item.category);
          const availableCategories = EXCLUSION_CATEGORIES.filter((category) => !usedCategories.includes(category.value));

          return (
            <section key={cohort.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/year`}>Cohort year</label>
                  <input
                    id={`reportingWindow/cohorts/${cohortIndex}/year`}
                    name={`reportingWindow/cohorts/${cohortIndex}/year`}
                    value={cohort.year}
                    onChange={handleHeaderChange(`reportingWindow/cohorts/${cohortIndex}/year`)}
                    onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                    className="field"
                    placeholder="YYYY"
                    style={{ maxWidth: 180 }}
                  />
                  {fieldError(`reportingWindow/cohorts/${cohortIndex}/year`) && (
                    <div className="field-error">{fieldError(`reportingWindow/cohorts/${cohortIndex}/year`)}</div>
                  )}
                </div>

                {reportingWindow.cohorts.length > 1 && (
                  <button type="button" className="btn btn-text" onClick={() => removeCohort(cohortIndex)}>
                    Remove
                  </button>
                )}
              </header>

              <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                <div>
                  <h5 style={{ margin: "0 0 8px" }}>Licensure</h5>
                  <div>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`}>First-time candidates</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`}
                      name={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`}
                      type="number"
                      value={cohort.licensure.firstTimeCandidates}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimeCandidates`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`}>First-time passes</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`}
                      name={`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`}
                      type="number"
                      value={cohort.licensure.firstTimePasses}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/licensure/firstTimePasses`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "#4b5563" }}>First-time pass rate: {licensureRate}</div>
                </div>

                <div>
                  <h5 style={{ margin: "0 0 8px" }}>Program completion</h5>
                  <div>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/completion/denominator`}>Total admitted denominator</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/completion/denominator`}
                      name={`reportingWindow/cohorts/${cohortIndex}/completion/denominator`}
                      type="number"
                      value={cohort.completion.denominator}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/completion/denominator`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/denominator`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/denominator`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/completion/numerator`}>Completed numerator</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/completion/numerator`}
                      name={`reportingWindow/cohorts/${cohortIndex}/completion/numerator`}
                      type="number"
                      value={cohort.completion.numerator}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/completion/numerator`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/numerator`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/numerator`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "#4b5563" }}>
                    Adjusted denominator: {adjusted} • Completion rate: {completionRate}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Exclusions</span>
                      {availableCategories.length > 0 && (
                        <select
                          name={`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/-`}
                          value=""
                          onChange={(event) => {
                            if (!event.target.value) return;
                            addExclusion(cohortIndex, event.target.value);
                            event.target.value = "";
                          }}
                          className="field"
                        >
                          <option value="">Add exclusion…</option>
                          {availableCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                      {cohort.completion.exclusions.map((exclusion, exclusionIndex) => (
                        <div
                          key={`${exclusion.category}-${exclusionIndex}`}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            padding: 8,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{EXCLUSION_CATEGORIES.find((cat) => cat.value === exclusion.category)?.label ?? exclusion.category}</div>
                            <input
                              name={`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/count`}
                              type="number"
                              value={exclusion.count}
                              onChange={handleNumberChange(
                                `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/count`
                              )}
                              onBlur={(event) =>
                                onBlurValidateField(event.target.name, numberValue(event.target.value))
                              }
                              className="field"
                              min={0}
                            />
                            {fieldError(
                              `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/count`
                            ) && (
                              <div className="field-error">
                                {fieldError(
                                  `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/count`
                                )}
                              </div>
                            )}
                          </div>
                          {exclusion.category === "other" && (
                            <div>
                              <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`}>
                                Note
                              </label>
                              <input
                                id={`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`}
                                name={`reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`}
                                value={exclusion.note ?? ""}
                                onChange={handleHeaderChange(
                                  `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`
                                )}
                                onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                                className="field"
                              />
                              {fieldError(
                                `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`
                              ) && (
                                <div className="field-error">
                                  {fieldError(
                                    `reportingWindow/cohorts/${cohortIndex}/completion/exclusions/${exclusionIndex}/note`
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <button
                            type="button"
                            className="btn btn-text"
                            onClick={() => removeExclusion(cohortIndex, exclusionIndex)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/exclusions`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/completion/exclusions`)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 style={{ margin: "0 0 8px" }}>Employment</h5>
                  <div>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/employment/seekers`}>Job seekers</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/employment/seekers`}
                      name={`reportingWindow/cohorts/${cohortIndex}/employment/seekers`}
                      type="number"
                      value={cohort.employment.seekers}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/employment/seekers`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/employment/seekers`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/employment/seekers`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/employment/employed`}>Employed</label>
                    <input
                      id={`reportingWindow/cohorts/${cohortIndex}/employment/employed`}
                      name={`reportingWindow/cohorts/${cohortIndex}/employment/employed`}
                      type="number"
                      value={cohort.employment.employed}
                      onChange={handleNumberChange(`reportingWindow/cohorts/${cohortIndex}/employment/employed`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, numberValue(event.target.value))}
                      className="field"
                    />
                    {fieldError(`reportingWindow/cohorts/${cohortIndex}/employment/employed`) && (
                      <div className="field-error">
                        {fieldError(`reportingWindow/cohorts/${cohortIndex}/employment/employed`)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/employment/dataSource`}>Data source</label>
                    <select
                      id={`reportingWindow/cohorts/${cohortIndex}/employment/dataSource`}
                      name={`reportingWindow/cohorts/${cohortIndex}/employment/dataSource`}
                      value={cohort.employment.dataSource}
                      onChange={handleHeaderChange(`reportingWindow/cohorts/${cohortIndex}/employment/dataSource`)}
                      onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                      className="field"
                    >
                      {DATA_SOURCES.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {cohort.employment.dataSource === "other" && (
                    <div style={{ marginTop: 12 }}>
                      <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`}>
                        Describe other source
                      </label>
                      <input
                        id={`reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`}
                        name={`reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`}
                        value={cohort.employment.otherSourceLabel ?? ""}
                        onChange={handleHeaderChange(
                          `reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`
                        )}
                        onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                        className="field"
                      />
                      {fieldError(
                        `reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`
                      ) && (
                        <div className="field-error">
                          {fieldError(
                            `reportingWindow/cohorts/${cohortIndex}/employment/otherSourceLabel`
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 12, color: "#4b5563" }}>Employment rate: {employmentRate}</div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label htmlFor={`reportingWindow/cohorts/${cohortIndex}/notes`}>Notes (optional)</label>
                <textarea
                  id={`reportingWindow/cohorts/${cohortIndex}/notes`}
                  name={`reportingWindow/cohorts/${cohortIndex}/notes`}
                  value={cohort.notes ?? ""}
                  onChange={handleHeaderChange(`reportingWindow/cohorts/${cohortIndex}/notes`)}
                  onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                  className="field"
                  rows={2}
                />
                {fieldError(`reportingWindow/cohorts/${cohortIndex}/notes`) && (
                  <div className="field-error">{fieldError(`reportingWindow/cohorts/${cohortIndex}/notes`)}</div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {fieldError("reportingWindow/cohorts") && (
        <div className="field-error" style={{ marginTop: 12 }}>
          {fieldError("reportingWindow/cohorts")}
        </div>
      )}
    </form>
  );
}
