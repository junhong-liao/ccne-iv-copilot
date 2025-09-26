"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ccneFormSchema, defaultFormData, type CCNEFormData } from "@/lib/validation/ccneFormSchema";

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

type FieldErrorMap = Record<string, string | undefined>;

type CCNEFormContextValue = {
  stepCompletion: StepCompletionState;
  markStepComplete: (path: StepPath) => void;
  firstIncompletePath: StepPath;
  data: CCNEFormData;
  setData: (updater: (prev: CCNEFormData) => CCNEFormData) => void;
  touched: Record<string, boolean>;
  errors: FieldErrorMap;
  onBlurValidateField: (fieldPath: string, value: unknown) => void;
  validateStep: (path: StepPath) => boolean;
};

const defaultCompletion: StepCompletionState = STEP_ROUTE_ORDER.reduce((acc, path, idx) => {
  acc[path] = idx === 0; // first step available by default
  return acc;
}, {} as StepCompletionState);

const STORAGE_KEY = "ccne.stepCompletion.v1";
const DATA_KEY = "ccne.formData.v1";

const CCNEFormContext = createContext<CCNEFormContextValue | null>(null);

export function CCNEFormProvider({ children }: { children: React.ReactNode }) {
  const [stepCompletion, setStepCompletion] = useState<StepCompletionState>(defaultCompletion);
  const [data, setDataState] = useState<CCNEFormData>(defaultFormData);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const throttleRef = useRef<number | null>(null);

  // hydrate from localStorage (SSR-safe)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as StepCompletionState;
        setStepCompletion((prev) => ({ ...prev, ...parsed }));
      }
      const dataRaw = typeof window !== "undefined" ? window.localStorage.getItem(DATA_KEY) : null;
      if (dataRaw) {
        const parsedData = JSON.parse(dataRaw) as CCNEFormData;
        setDataState((prev) => ({ ...prev, ...parsedData }));
      }
    } catch {}
  }, []);

  // persist step completion
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stepCompletion));
      }
    } catch {}
  }, [stepCompletion]);

  // throttled persist of data
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (throttleRef.current) window.clearTimeout(throttleRef.current);
    throttleRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
      } catch {}
    }, 300);
    return () => {
      if (throttleRef.current) window.clearTimeout(throttleRef.current);
    };
  }, [data]);

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

  const setData = useCallback((updater: (prev: CCNEFormData) => CCNEFormData) => {
    setDataState((prev) => updater(prev));
  }, []);

  const onBlurValidateField = useCallback((fieldPath: string, value: unknown) => {
    // Track touched
    setTouched((prev) => ({ ...prev, [fieldPath]: true }));
    // Build object path set
    try {
      // Use Zod partial safeParse on masked object
      const [root, ...rest] = fieldPath.split(".");
      let partial: any = {};
      let cursor = partial;
      for (let i = 0; i < rest.length; i++) {
        const key = rest[i];
        cursor[key] = i === rest.length - 1 ? value : {};
        cursor = cursor[key];
      }
      const rootObj = { [root]: partial } as any;
      const rootSchema = (ccneFormSchema.shape as any)[root];
      if (rootSchema && typeof rootSchema.safeParse === "function") {
        const result = rootSchema.safeParse((rootObj as any)[root]);
        if (!result.success) {
          const issue = result.error.issues.find((i) => i.path.join(".") === rest.join(".")) || result.error.issues[0];
          setErrors((prev) => ({ ...prev, [fieldPath]: issue?.message }));
        } else {
          setErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
        }
      }
    } catch {}
  }, []);

  const validateStep = useCallback((path: StepPath) => {
    // Map path to schema key
    const keyMap: Record<StepPath, keyof CCNEFormData> = {
      "/step1": "programInfo",
      "/step2": "outcomes",
      "/step3": "thresholds",
      "/step4": "narrativeUploads",
      "/review": "narrativeUploads",
      "/submit": "narrativeUploads",
    } as const;
    const key = keyMap[path];
    const schema = (ccneFormSchema.shape as any)[key];
    const result = schema.safeParse((data as any)[key]);
    if (!result.success) {
      const nextErrors: FieldErrorMap = {};
      for (const issue of result.error.issues) {
        const fieldPath = `${String(key)}.${issue.path.join(".")}`;
        nextErrors[fieldPath] = issue.message;
      }
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      // Focus first errored field if present
      const firstField = Object.keys(nextErrors)[0];
      if (firstField && typeof document !== "undefined") {
        const el = document.querySelector(`[name="${firstField}"]`) as HTMLElement | null;
        if (el && typeof (el as any).focus === "function") (el as any).focus();
      }
      return false;
    }
    return true;
  }, [data]);

  const value = useMemo(
    () => ({ stepCompletion, markStepComplete, firstIncompletePath, data, setData, touched, errors, onBlurValidateField, validateStep }),
    [stepCompletion, markStepComplete, firstIncompletePath, data, setData, touched, errors, onBlurValidateField, validateStep]
  );

  return <CCNEFormContext.Provider value={value}>{children}</CCNEFormContext.Provider>;
}

export function useCCNEForm() {
  const ctx = useContext(CCNEFormContext);
  if (!ctx) throw new Error("useCCNEForm must be used within CCNEFormProvider");
  return ctx;
}


