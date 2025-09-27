"use client";

import React, { useMemo } from "react";
import { ELA_OUTCOME_KEYS, type ELAOutcomeKey, deriveDefaultEla } from "@/lib/constants/ccne";
import { useCCNEForm } from "@/lib/context/ccneFormContext";

const OUTCOME_LABELS: Record<ELAOutcomeKey, { title: string; description: string }> = {
  licensure: {
    title: "Licensure",
    description: "First-time NCLEX pass expectations.",
  },
  completion: {
    title: "Program completion",
    description: "Students completing within the expected time frame.",
  },
  employment: {
    title: "Employment",
    description: "Graduates employed in nursing or related fields.",
  },
};

export default function ELAForm() {
  const { data, setData, updateField, onBlurValidateField, errors } = useCCNEForm();

  const defaultEla = useMemo(() => deriveDefaultEla(data.programInfo.programLevel), [data.programInfo.programLevel]);

  const toggleOverride = (key: ELAOutcomeKey, useDefault: boolean, defaultValue: number) => {
    setData((prev) => ({
      ...prev,
      expectedOutcomes: {
        ...prev.expectedOutcomes,
        [key]: {
          ...prev.expectedOutcomes[key],
          useDefault,
          overrideValue:
            useDefault ? null : prev.expectedOutcomes[key].overrideValue ?? defaultValue,
          rationale: useDefault ? "" : prev.expectedOutcomes[key].rationale,
        },
      },
    }));
  };

  const fieldError = (pointer: string) => errors[pointer];

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="ela-heading">
      <h3 id="ela-heading">Expected levels of achievement</h3>
      <p style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>
        Review CCNE default ELAs for your program level and override when institutional benchmarks differ. Provide
        rationale when using a custom value.
      </p>

      <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {ELA_OUTCOME_KEYS.map((key) => {
          const outcome = data.expectedOutcomes[key];
          const defaults = defaultEla[key];
          const overridePointer = `expectedOutcomes/${key}/overrideValue`;
          const rationalePointer = `expectedOutcomes/${key}/rationale`;
          const useDefaultPointer = `expectedOutcomes/${key}/useDefault`;

          return (
            <section key={key} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ margin: 0 }}>{OUTCOME_LABELS[key].title}</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{OUTCOME_LABELS[key].description}</p>
                </div>
                <span className="pill pill-disabled" aria-label="Met status placeholder">
                  Met status TBD
                </span>
              </header>

              <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563" }}>
                CCNE default: <strong>{defaults}%</strong>
              </div>

              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    name={useDefaultPointer}
                    checked={!outcome.useDefault}
                    onChange={(event) => toggleOverride(key, !event.target.checked, defaults)}
                  />
                  Override default
                </label>
              </div>

              {!outcome.useDefault && (
                <div style={{ marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                  <div>
                    <label htmlFor={overridePointer}>Override value (%)</label>
                    <input
                      id={overridePointer}
                      name={overridePointer}
                      type="number"
                      value={outcome.overrideValue ?? ""}
                      onChange={(event) => updateField(overridePointer, event.target.value === "" ? null : Number(event.target.value))}
                      onBlur={(event) => onBlurValidateField(event.target.name, event.target.value === "" ? null : Number(event.target.value))}
                      className="field"
                    />
                    {fieldError(overridePointer) && <div className="field-error">{fieldError(overridePointer)}</div>}
                  </div>
                  <div>
                    <label htmlFor={rationalePointer}>Rationale</label>
                    <textarea
                      id={rationalePointer}
                      name={rationalePointer}
                      value={outcome.rationale ?? ""}
                      onChange={(event) => updateField(rationalePointer, event.target.value)}
                      onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
                      className="field"
                      rows={3}
                    />
                    {fieldError(rationalePointer) && <div className="field-error">{fieldError(rationalePointer)}</div>}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </form>
  );
}
