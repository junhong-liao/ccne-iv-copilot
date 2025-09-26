"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const STEP_ROUTE_ORDER = [
  "/step1",
  "/step2",
  "/step3",
  "/step4",
  "/review",
  "/submit",
] as const;

type StepPath = typeof STEP_ROUTE_ORDER[number];

type StepCompletionState = Record<StepPath, boolean>;

type CCNEFormContextValue = {
  stepCompletion: StepCompletionState;
  markStepComplete: (path: StepPath) => void;
  firstIncompletePath: StepPath;
};

const defaultCompletion: StepCompletionState = STEP_ROUTE_ORDER.reduce((acc, path, idx) => {
  acc[path] = idx === 0; // first step available by default
  return acc;
}, {} as StepCompletionState);

const STORAGE_KEY = "ccne.stepCompletion.v1";

const CCNEFormContext = createContext<CCNEFormContextValue | null>(null);

export function CCNEFormProvider({ children }: { children: React.ReactNode }) {
  const [stepCompletion, setStepCompletion] = useState<StepCompletionState>(defaultCompletion);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as StepCompletionState;
        setStepCompletion((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stepCompletion));
      }
    } catch {}
  }, [stepCompletion]);

  const firstIncompletePath = useMemo<StepPath>(() => {
    for (const path of STEP_ROUTE_ORDER) {
      if (!stepCompletion[path]) return path;
    }
    return "/submit";
  }, [stepCompletion]);

  const markStepComplete = useCallback((path: StepPath) => {
    setStepCompletion((prev) => {
      if (prev[path]) return prev;
      const updated: StepCompletionState = { ...prev, [path]: true };
      // unlock next step too
      const idx = STEP_ROUTE_ORDER.indexOf(path);
      const next = STEP_ROUTE_ORDER[idx + 1];
      if (next) updated[next] = true;
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ stepCompletion, markStepComplete, firstIncompletePath }),
    [stepCompletion, markStepComplete, firstIncompletePath]
  );

  return <CCNEFormContext.Provider value={value}>{children}</CCNEFormContext.Provider>;
}

export function useCCNEForm() {
  const ctx = useContext(CCNEFormContext);
  if (!ctx) throw new Error("useCCNEForm must be used within CCNEFormProvider");
  return ctx;
}


