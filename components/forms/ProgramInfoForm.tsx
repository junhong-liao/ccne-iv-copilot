"use client";

import React from "react";
import { PROGRAM_LEVELS } from "@/lib/constants/ccne";
import { useCCNEForm } from "@/lib/context/ccneFormContext";

export default function ProgramInfoForm() {
  const { data, updateField, onBlurValidateField, errors } = useCCNEForm();

  const handleChange = (pointer: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateField(pointer, event.target.value);
  };

  const fieldError = (pointer: string) => errors[pointer];

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="program-info-heading">
      <h3 id="program-info-heading">Program Information</h3>
      <p style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>
        Provide the institutional context and contact information used across the report.
      </p>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/institutionName">Institution name</label>
        <input
          id="programInfo/institutionName"
          name="programInfo/institutionName"
          value={data.programInfo.institutionName}
          onChange={handleChange("programInfo/institutionName")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/institutionName")) || undefined}
          aria-describedby={fieldError("programInfo/institutionName") ? "programInfo-institutionName-error" : undefined}
          className="field"
        />
        {fieldError("programInfo/institutionName") && (
          <div id="programInfo-institutionName-error" className="field-error">
            {fieldError("programInfo/institutionName")}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/programName">Program name</label>
        <input
          id="programInfo/programName"
          name="programInfo/programName"
          value={data.programInfo.programName}
          onChange={handleChange("programInfo/programName")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/programName")) || undefined}
          aria-describedby={fieldError("programInfo/programName") ? "programInfo-programName-error" : undefined}
          className="field"
        />
        {fieldError("programInfo/programName") && (
          <div id="programInfo-programName-error" className="field-error">
            {fieldError("programInfo/programName")}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/programLevel">Program level</label>
        <select
          id="programInfo/programLevel"
          name="programInfo/programLevel"
          value={data.programInfo.programLevel}
          onChange={handleChange("programInfo/programLevel")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/programLevel")) || undefined}
          aria-describedby={fieldError("programInfo/programLevel") ? "programInfo-programLevel-error" : undefined}
          className="field"
        >
          {PROGRAM_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {fieldError("programInfo/programLevel") && (
          <div id="programInfo-programLevel-error" className="field-error">
            {fieldError("programInfo/programLevel")}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/accreditationCycle">Accreditation cycle</label>
        <input
          id="programInfo/accreditationCycle"
          name="programInfo/accreditationCycle"
          value={data.programInfo.accreditationCycle}
          onChange={handleChange("programInfo/accreditationCycle")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/accreditationCycle")) || undefined}
          aria-describedby={fieldError("programInfo/accreditationCycle") ? "programInfo-accreditationCycle-error" : undefined}
          className="field"
          placeholder="e.g., 2025-2030"
        />
        {fieldError("programInfo/accreditationCycle") && (
          <div id="programInfo-accreditationCycle-error" className="field-error">
            {fieldError("programInfo/accreditationCycle")}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/contactEmail">Primary contact email</label>
        <input
          id="programInfo/contactEmail"
          name="programInfo/contactEmail"
          type="email"
          value={data.programInfo.contactEmail}
          onChange={handleChange("programInfo/contactEmail")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/contactEmail")) || undefined}
          aria-describedby={fieldError("programInfo/contactEmail") ? "programInfo-contactEmail-error" : undefined}
          className="field"
          placeholder="name@example.edu"
        />
        {fieldError("programInfo/contactEmail") && (
          <div id="programInfo-contactEmail-error" className="field-error">
            {fieldError("programInfo/contactEmail")}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="programInfo/deanName">Dean/Director name</label>
        <input
          id="programInfo/deanName"
          name="programInfo/deanName"
          value={data.programInfo.deanName}
          onChange={handleChange("programInfo/deanName")}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          aria-invalid={Boolean(fieldError("programInfo/deanName")) || undefined}
          aria-describedby={fieldError("programInfo/deanName") ? "programInfo-deanName-error" : undefined}
          className="field"
        />
        {fieldError("programInfo/deanName") && (
          <div id="programInfo-deanName-error" className="field-error">
            {fieldError("programInfo/deanName")}
          </div>
        )}
      </div>
    </form>
  );
}
