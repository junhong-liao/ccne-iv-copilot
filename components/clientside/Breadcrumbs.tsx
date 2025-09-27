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

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { isStepUnlocked, isStepComplete } = useCCNEForm();

  return (
    <nav aria-label="Breadcrumbs" style={{ marginTop: 8 }}>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STEP_ROUTE_ORDER.map((path, idx) => {
          const isActive = pathname === path;
          const enabled = isStepUnlocked(path);
          const completed = isStepComplete(path);
          const label = LABELS[path];
          const item = (
            <span
              key={path}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: isActive ? "#e0f2fe" : "transparent",
                color: completed ? "#0f766e" : enabled ? "#0ea5e9" : "#999",
                border: "1px solid #e5e7eb",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </span>
          );
          return (
            <li key={path} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {enabled ? <Link href={path}>{item}</Link> : item}
              {idx < STEP_ROUTE_ORDER.length - 1 && <span style={{ color: "#bbb" }}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
