"use client";

import React, { useMemo } from "react";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";
import { usePathname } from "next/navigation";

export default function Progress() {
  const { completedSteps } = useCCNEForm();
  const pathname = usePathname();

  const currentIndex = useMemo(() => {
    const idx = STEP_ROUTE_ORDER.indexOf((pathname as any) ?? "/step1");
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  const completedCount = STEP_ROUTE_ORDER.filter((p) => completedSteps[p]).length;
  const percent = Math.round((completedCount / STEP_ROUTE_ORDER.length) * 100);

  return (
    <div style={{ marginTop: 8 }} aria-label="Progress">
      <div style={{ fontSize: 12, color: "#555" }}>Step {currentIndex + 1} of {STEP_ROUTE_ORDER.length} • {percent}%</div>
      <div style={{ height: 6, background: "#eee", borderRadius: 4, marginTop: 4 }}>
        <div style={{ width: `${percent}%`, height: 6, background: "#2563eb", borderRadius: 4 }} />
      </div>
    </div>
  );
}

