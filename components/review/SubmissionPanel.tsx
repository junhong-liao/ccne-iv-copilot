"use client";

import React, { useMemo, useRef, useState } from "react";
import { generateReport } from "@/lib/api/generateReport";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reportUrl: string; filename: string; expiresAt?: string | null }
  | { status: "error"; message: string };

export default function SubmissionPanel() {
  const { data, validateStep, markStepComplete } = useCCNEForm();
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  const requiredSteps = useMemo(() => {
    const submitIndex = STEP_ROUTE_ORDER.indexOf("/submit");
    return submitIndex === -1 ? STEP_ROUTE_ORDER : STEP_ROUTE_ORDER.slice(0, submitIndex);
  }, []);

  const handleSubmit = async () => {
    if (state.status === "submitting") return;

    for (const step of requiredSteps) {
      const ok = validateStep(step);
      if (!ok) {
        setState({ status: "error", message: "Resolve validation issues on previous steps before submitting." });
        return;
      }
    }

    setState({ status: "submitting" });
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const result = await generateReport(data, { signal: controller.signal });
      if (result.status === "success") {
        setState({ status: "success", reportUrl: result.reportUrl, filename: result.filename, expiresAt: result.expiresAt });
        markStepComplete("/submit");
      } else {
        setState({ status: "error", message: result.message });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected submission error.";
      setState({ status: "error", message });
    } finally {
      controllerRef.current = null;
    }
  };

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, backgroundColor: "#ffffff" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0 }}>Generate report</h2>
        <p style={{ margin: 0, color: "#4b5563", fontSize: 15 }}>
          Submitting bundles the validated CCNE data, calls the Cerebras-powered LangChain pipeline, and produces a
          downloadable Standard IV report.
        </p>
      </header>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 8px" }}>What happens next</h3>
          <ol style={{ margin: 0, paddingLeft: 20, color: "#4b5563", fontSize: 14, display: "grid", gap: 6 }}>
            <li>Sanitize and validate the payload against the CCNE schema.</li>
            <li>Invoke the Cerebras completion via LangChain to draft narrative and tables.</li>
            <li>Merge results into the report template and return a download link.</li>
          </ol>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={state.status === "submitting"}
          >
            {state.status === "submitting" ? "Generating..." : "Submit for generation"}
          </button>
          {state.status === "submitting" ? <span style={{ color: "#6b7280", fontSize: 14 }}>This may take up to 30 seconds.</span> : null}
        </div>

        {state.status === "error" ? (
          <div role="alert" style={{ padding: 12, borderRadius: 8, backgroundColor: "#fef2f2", color: "#b91c1c" }}>
            {state.message}
          </div>
        ) : null}

        {state.status === "success" ? (
          <div style={{ display: "grid", gap: 8, padding: 16, borderRadius: 8, backgroundColor: "#ecfdf5", color: "#065f46" }}>
            <div>
              Report ready: <strong>{state.filename}</strong>
            </div>
            <div>
              <a className="btn" href={state.reportUrl} download={state.filename}>
                Download report
              </a>
            </div>
            {state.expiresAt ? (
              <p style={{ margin: 0, fontSize: 12 }}>Link expires {new Date(state.expiresAt).toLocaleString()}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

