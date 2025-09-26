"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

export default function FormStepper() {
  const { stepCompletion } = useCCNEForm();
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
      {STEP_ROUTE_ORDER.map((path, idx) => {
        const active = pathname === path;
        const enabled = stepCompletion[path];
        const label = `Step ${idx + 1}`;
        const pill = (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: active ? "#0ea5e9" : enabled ? "#e5f3fb" : "#f3f4f6",
              color: active ? "#fff" : enabled ? "#0369a1" : "#9ca3af",
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
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


