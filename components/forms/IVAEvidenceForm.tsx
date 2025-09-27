"use client";

import React, { useMemo, useRef, useState } from "react";
import { MAX_SUPPORTING_EVIDENCE } from "@/lib/constants/ccne";
import { useCCNEForm } from "@/lib/context/ccneFormContext";
import type { EvidenceAttachment, FileAttachment } from "@/lib/validation/ccneFormSchema";

const CERT_OPTIONS = [
  { value: "applicable", label: "Certification applicable" },
  { value: "not_applicable", label: "Certification not applicable" },
  { value: "pending", label: "Certification pending" },
] as const;

const createFileAttachment = (file: File): FileAttachment => {
  const cryptoRef = (globalThis as { crypto?: Crypto }).crypto;
  const id = cryptoRef && typeof cryptoRef.randomUUID === "function" ? cryptoRef.randomUUID() : `file-${Math.random().toString(36).slice(2, 10)}`;
  return {
    kind: "file",
    id,
    name: file.name,
    size: file.size,
    type: file.type,
  };
};

export default function IVAEvidenceForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supportFileRef = useRef<HTMLInputElement | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const { data, updateField, setData, onBlurValidateField, errors } = useCCNEForm();
  const { ivaEvidence } = data;

  const fieldError = (pointer: string) => errors[pointer];

  const addMepFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const attachments = Array.from(files).map(createFileAttachment);
    updateField("ivaEvidence/mepEvidence", [...ivaEvidence.mepEvidence, ...attachments]);
    fileInputRef.current?.value && (fileInputRef.current.value = "");
    onBlurValidateField("ivaEvidence/mepEvidence");
  };

  const addSupportingFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const attachments = Array.from(files).map(createFileAttachment);
    updateField("ivaEvidence/supportingEvidence", [...ivaEvidence.supportingEvidence, ...attachments]);
    supportFileRef.current?.value && (supportFileRef.current.value = "");
    onBlurValidateField("ivaEvidence/supportingEvidence");
  };

  const removeAttachment = (pointer: "mepEvidence" | "supportingEvidence", id: string) => {
    setData((prev) => ({
      ...prev,
      ivaEvidence: {
        ...prev.ivaEvidence,
        [pointer]: prev.ivaEvidence[pointer].filter((item) => item.id !== id),
      },
    }));
    onBlurValidateField(`ivaEvidence/${pointer}`);
  };

  const addSupportingLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const cryptoRef = (globalThis as { crypto?: Crypto }).crypto;
    const id = cryptoRef && typeof cryptoRef.randomUUID === "function" ? cryptoRef.randomUUID() : `link-${Math.random().toString(36).slice(2, 10)}`;
    const entry: EvidenceAttachment = {
      kind: "link",
      id,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
    } as const;
    updateField("ivaEvidence/supportingEvidence", [...ivaEvidence.supportingEvidence, entry]);
    setNewLinkTitle("");
    setNewLinkUrl("");
    onBlurValidateField("ivaEvidence/supportingEvidence");
  };

  const linkQuotaReached = useMemo(
    () => ivaEvidence.supportingEvidence.length >= MAX_SUPPORTING_EVIDENCE,
    [ivaEvidence.supportingEvidence.length]
  );

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="iva-evidence-heading">
      <h3 id="iva-evidence-heading">Standard IV-A evidence</h3>
      <p style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>
        Upload the minimum evidence of program effectiveness (MEP) file, enter the IV-A narrative, and catalogue
        supporting documentation.
      </p>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="ivaEvidence/certificationStatus">Certification status</label>
        <select
          id="ivaEvidence/certificationStatus"
          name="ivaEvidence/certificationStatus"
          value={ivaEvidence.certificationStatus}
          onChange={(event) => updateField("ivaEvidence/certificationStatus", event.target.value)}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          className="field"
        >
          {CERT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldError("ivaEvidence/certificationStatus") && (
          <div className="field-error">{fieldError("ivaEvidence/certificationStatus")}</div>
        )}
      </div>

      {ivaEvidence.certificationStatus === "not_applicable" && (
        <div style={{ marginTop: 16 }}>
          <label htmlFor="ivaEvidence/certificationNote">Explain why certification is not applicable</label>
          <textarea
            id="ivaEvidence/certificationNote"
            name="ivaEvidence/certificationNote"
            value={ivaEvidence.certificationNote ?? ""}
            onChange={(event) => updateField("ivaEvidence/certificationNote", event.target.value)}
            onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
            className="field"
            rows={3}
          />
          {fieldError("ivaEvidence/certificationNote") && (
            <div className="field-error">{fieldError("ivaEvidence/certificationNote")}</div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <label htmlFor="ivaEvidence/ivaNarrative">IV-A narrative</label>
        <textarea
          id="ivaEvidence/ivaNarrative"
          name="ivaEvidence/ivaNarrative"
          value={ivaEvidence.ivaNarrative}
          onChange={(event) => updateField("ivaEvidence/ivaNarrative", event.target.value)}
          onBlur={(event) => onBlurValidateField(event.target.name, event.target.value)}
          className="field"
          rows={6}
        />
        {fieldError("ivaEvidence/ivaNarrative") && (
          <div className="field-error">{fieldError("ivaEvidence/ivaNarrative")}</div>
        )}
      </div>

      <section style={{ marginTop: 24 }}>
        <h4 style={{ margin: 0 }}>Minimum evidence of program effectiveness (MEP)</h4>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 12px" }}>Upload at least one file.</p>
        <input
          ref={fileInputRef}
          id="mep-evidence-input"
          type="file"
          multiple
          onChange={(event) => addMepFiles(event.target.files)}
        />
        <ul style={{ marginTop: 12, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {ivaEvidence.mepEvidence.map((file) => (
            <li key={file.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <span>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
              <button type="button" className="btn btn-text" onClick={() => removeAttachment("mepEvidence", file.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {fieldError("ivaEvidence/mepEvidence") && (
          <div className="field-error">{fieldError("ivaEvidence/mepEvidence")}</div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h4 style={{ margin: 0 }}>Supporting evidence catalog</h4>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 12px" }}>
          Add files or reference links that substantiate Standard IV-A findings.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <input
              ref={supportFileRef}
              id="supporting-evidence-file-input"
              type="file"
              multiple
              disabled={linkQuotaReached}
              onChange={(event) => addSupportingFiles(event.target.files)}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div>
              <label htmlFor="supporting-link-title">Link title</label>
              <input
                id="supporting-link-title"
                value={newLinkTitle}
                onChange={(event) => setNewLinkTitle(event.target.value)}
                className="field"
                disabled={linkQuotaReached}
              />
            </div>
            <div>
              <label htmlFor="supporting-link-url">URL</label>
              <input
                id="supporting-link-url"
                value={newLinkUrl}
                onChange={(event) => setNewLinkUrl(event.target.value)}
                className="field"
                disabled={linkQuotaReached}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={addSupportingLink}
              disabled={linkQuotaReached || !newLinkTitle.trim() || !newLinkUrl.trim()}
            >
              Add link
            </button>
          </div>
        </div>

        <ul style={{ marginTop: 12, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {ivaEvidence.supportingEvidence.map((item) => (
            <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              {item.kind === "file" ? (
                <span>
                  File: {item.name} ({Math.round(item.size / 1024)} KB)
                </span>
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                  Link: {item.title}
                </a>
              )}
              <button
                type="button"
                className="btn btn-text"
                onClick={() => removeAttachment("supportingEvidence", item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {fieldError("ivaEvidence/supportingEvidence") && (
          <div className="field-error">{fieldError("ivaEvidence/supportingEvidence")}</div>
        )}
      </section>
    </form>
  );
}
