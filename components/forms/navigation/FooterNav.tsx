"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

export default function FooterNav({ currentPath }: { currentPath: (typeof STEP_ROUTE_ORDER)[number] }) {
  const router = useRouter();
  const { validateStep, markStepComplete, isStepValid } = useCCNEForm();

  const idx = STEP_ROUTE_ORDER.indexOf(currentPath);
  const prev = STEP_ROUTE_ORDER[idx - 1];
  const next = STEP_ROUTE_ORDER[idx + 1];

  const goPrev = () => {
    if (prev) router.push(prev);
  };
  const goNext = () => {
    if (!next) return;
    if (!isStepValid(currentPath)) {
      validateStep(currentPath);
      return;
    }
    const ok = validateStep(currentPath);
    if (!ok) return;
    markStepComplete(currentPath);
    if (next) router.push(next);
  };

  const canProceed = next ? isStepValid(currentPath) : false;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
      <button onClick={goPrev} disabled={!prev} className="btn" style={{ minWidth: 96 }}>
        Previous
      </button>
      {next ? (
        <button onClick={goNext} className="btn btn-primary" style={{ minWidth: 96 }} disabled={!canProceed}>
          Next
        </button>
      ) : (
        <div style={{ minWidth: 96 }} />
      )}
    </div>
  );
}

