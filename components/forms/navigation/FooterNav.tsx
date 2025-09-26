"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

export default function FooterNav({ currentPath }: { currentPath: (typeof STEP_ROUTE_ORDER)[number] }) {
  const router = useRouter();
  const { validateStep, markStepComplete } = useCCNEForm();

  const idx = STEP_ROUTE_ORDER.indexOf(currentPath);
  const prev = STEP_ROUTE_ORDER[idx - 1];
  const next = STEP_ROUTE_ORDER[idx + 1];

  const goPrev = () => {
    if (prev) router.push(prev);
  };
  const goNext = () => {
    const ok = validateStep(currentPath);
    if (!ok) return;
    markStepComplete(currentPath);
    if (next) router.push(next);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
      <button onClick={goPrev} disabled={!prev} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff" }}>
        Previous
      </button>
      <button onClick={goNext} style={{ padding: "8px 12px", borderRadius: 6, background: "#0ea5e9", color: "#fff", border: 0 }}>
        Next
      </button>
    </div>
  );
}


