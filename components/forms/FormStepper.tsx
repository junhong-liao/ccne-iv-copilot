"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

const LABELS: Record<(typeof STEP_ROUTE_ORDER)[number], string> = {
  "/step1": "Program Info",
  "/step2": "Cohorts",
  "/step3": "ELAs",
  "/step4": "Evidence",
  "/review": "Review",
  "/submit": "Submit",
};

export default function FormStepper() {
  const { isStepUnlocked, isStepComplete } = useCCNEForm();
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
      {STEP_ROUTE_ORDER.map((path, idx) => {
        const active = pathname === path;
        const enabled = isStepUnlocked(path);
        const completed = isStepComplete(path);
        const label = `${idx + 1}. ${LABELS[path]}`;
        const pill = (
          <span
            style={{
              fontSize: 12,
            }}
            className={`pill ${active ? "pill-active" : completed ? "pill-complete" : enabled ? "pill-enabled" : "pill-disabled"}`}
          >
            {label}
          </span>
        );
        return enabled ? (
          <Link key={path} href={path} aria-current={active ? "step" : undefined}>
            {pill}
          </Link>
        ) : (
          <span key={path}>{pill}</span>
        );
      })}
    </div>
  );
}

