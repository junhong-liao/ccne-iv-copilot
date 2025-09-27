"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { STEP_ROUTE_ORDER, type StepPath, useCCNEForm } from "@/lib/context/ccneFormContext";

type EditableSectionProps = {
  title: string;
  editPath: StepPath;
  description?: string;
  children: React.ReactNode;
};

export default function EditableSection({ title, editPath, description, children }: EditableSectionProps) {
  const router = useRouter();
  const { resetStepFrom, isStepUnlocked } = useCCNEForm();

  const handleEdit = () => {
    if (!STEP_ROUTE_ORDER.includes(editPath)) return;
    resetStepFrom(editPath);
    router.push(editPath);
  };

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, backgroundColor: "#ffffff" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
          {description ? (
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn-text"
          onClick={handleEdit}
          disabled={!isStepUnlocked(editPath)}
          aria-label={`Edit ${title}`}
          style={{ whiteSpace: "nowrap" }}
        >
          Edit
        </button>
      </header>
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>{children}</div>
    </section>
  );
}

