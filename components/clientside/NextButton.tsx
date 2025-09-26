"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCCNEForm } from "@/lib/context/ccneFormContext";

export default function NextButton({ currentPath, nextPath }: { currentPath: "/step1"|"/step2"|"/step3"|"/step4"|"/review"; nextPath: "/step2"|"/step3"|"/step4"|"/review"|"/submit"; }) {
  const router = useRouter();
  const { markStepComplete } = useCCNEForm();

  const onClick = () => {
    markStepComplete(currentPath as any);
    router.push(nextPath);
  };

  return (
    <button onClick={onClick} style={{ marginTop: 16, padding: "8px 12px", background: "#0ea5e9", color: "white", border: 0, borderRadius: 6 }}>
      Next
    </button>
  );
}


