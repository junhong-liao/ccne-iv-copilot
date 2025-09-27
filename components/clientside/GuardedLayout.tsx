"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { STEP_ROUTE_ORDER, useCCNEForm } from "@/lib/context/ccneFormContext";

export default function GuardedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firstIncompletePath, isStepUnlocked } = useCCNEForm();

  useEffect(() => {
    // Only guard known step routes
    const isStepRoute = STEP_ROUTE_ORDER.includes(pathname as any);
    if (!isStepRoute) return;

    const allowed = isStepUnlocked(pathname as any);
    if (!allowed) {
      router.replace(firstIncompletePath);
    }
  }, [pathname, router, isStepUnlocked, firstIncompletePath]);

  return <>{children}</>;
}

