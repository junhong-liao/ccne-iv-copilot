"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ZodIssue } from "zod";
import { normalizePointer, setValueAtPointer } from "@/lib/context/utils/jsonPointer";
import { ccneFormSchema, defaultFormData, type CCNEFormData } from "@/lib/validation/ccneFormSchema";

export const STEP_ROUTE_ORDER = [
  "/step1",
  "/step2",
  "/step3",
  "/step4",
  "/review",
  "/submit",
] as const;

export type StepPath = (typeof STEP_ROUTE_ORDER)[number];

type StepCompletionMap = Record<StepPath, boolean>;

type FieldErrorMap = Record<string, string | undefined>;

type CCNEFormContextValue = {
  completedSteps: StepCompletionMap;
  markStepComplete: (path: StepPath) => void;
  resetStepFrom: (path: StepPath) => void;
  firstIncompletePath: StepPath;
  isStepUnlocked: (path: StepPath) => boolean;
  isStepComplete: (path: StepPath) => boolean;
  isStepValid: (path: StepPath) => boolean;
  data: CCNEFormData;
  setData: (updater: (prev: CCNEFormData) => CCNEFormData) => void;
  updateField: (pointer: string, value: unknown) => void;
  touched: Record<string, boolean>;
  errors: FieldErrorMap;
  onBlurValidateField: (fieldPath: string, value?: unknown) => void;
  validateStep: (path: StepPath) => boolean;
};

const createDefaultCompletionMap = (): StepCompletionMap =>
  STEP_ROUTE_ORDER.reduce((acc, path) => {
    acc[path] = false;
    return acc;
  }, {} as StepCompletionMap);

const STORAGE_KEY = "ccne.completedSteps.v2";
const DATA_KEY = "ccne.formData.v1";

const CCNEFormContext = createContext<CCNEFormContextValue | null>(null);

export function CCNEFormProvider({ children }: { children: React.ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<StepCompletionMap>(() => createDefaultCompletionMap());
  const [data, setDataState] = useState<CCNEFormData>(defaultFormData);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const throttleRef = useRef<number | null>(null);

  // hydrate from localStorage (SSR-safe)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as StepCompletionMap;
        setCompletedSteps((prev) => ({ ...prev, ...parsed }));
      }
      const dataRaw = typeof window !== "undefined" ? window.localStorage.getItem(DATA_KEY) : null;
      if (dataRaw) {
        const parsedData = JSON.parse(dataRaw);
        const result = ccneFormSchema.safeParse(parsedData);
        if (result.success) {
          setDataState(result.data);
        }
      }
    } catch {}
  }, []);

  // persist step completion
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
      }
    } catch {}
  }, [completedSteps]);

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
      if (!completedSteps[path]) return path;
    }
    return "/submit";
  }, [completedSteps]);

  const markStepComplete = useCallback((path: StepPath) => {
    setCompletedSteps((prev) => (prev[path] ? prev : { ...prev, [path]: true }));
  }, []);

  const resetStepFrom = useCallback((path: StepPath) => {
    setCompletedSteps((prev) => {
      const idx = STEP_ROUTE_ORDER.indexOf(path);
      if (idx === -1) return prev;
      const updated = { ...prev };
      for (let i = idx; i < STEP_ROUTE_ORDER.length; i += 1) {
        updated[STEP_ROUTE_ORDER[i]] = false;
      }
      return updated;
    });
  }, []);

  const setData = useCallback((updater: (prev: CCNEFormData) => CCNEFormData) => {
    setDataState((prev) => updater(prev));
  }, []);

  const updateField = useCallback((pointer: string, value: unknown) => {
    setDataState((prev) => setValueAtPointer(prev, pointer, value));
  }, []);

  const keyMap: Record<StepPath, keyof CCNEFormData> = useMemo(
    () => ({
      "/step1": "programInfo",
      "/step2": "reportingWindow",
      "/step3": "expectedOutcomes",
      "/step4": "ivaEvidence",
      "/review": "ivaEvidence",
      "/submit": "ivaEvidence",
    }),
    []
  );

  const pointerFromIssue = useCallback((root: keyof CCNEFormData, path: ReadonlyArray<string | number>) => {
    return [root, ...path].map((segment) => segment.toString()).join("/");
  }, []);

  const onBlurValidateField = useCallback((fieldPath: string, _value?: unknown) => {
    // Track touched
    setTouched((prev) => ({ ...prev, [fieldPath]: true }));
    try {
      const segments = normalizePointer(fieldPath);
      if (segments.length === 0) return;
      const root = segments[0] as keyof CCNEFormData;
      const rootSchema: any = (ccneFormSchema.shape as any)[root];
      if (!rootSchema || typeof rootSchema.safeParse !== "function") return;

      const result = rootSchema.safeParse((data as any)[root]);
      if (!result.success) {
        const issueForField = result.error.issues.find((issue: ZodIssue) => pointerFromIssue(root, issue.path) === fieldPath);
        setErrors((prev) => ({ ...prev, [fieldPath]: issueForField?.message }));
      } else {
        setErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
      }
    } catch {}
  }, [data, pointerFromIssue]);

  const validateStep = useCallback((path: StepPath) => {
    const key = keyMap[path];
    const schema = (ccneFormSchema.shape as any)[key];
    const result = schema.safeParse((data as any)[key]);
    if (!result.success) {
      const nextErrors: FieldErrorMap = {};
      for (const issue of result.error.issues as ReadonlyArray<ZodIssue>) {
        const fieldPath = pointerFromIssue(key, issue.path);
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
    setErrors((prev) => {
      const copy = { ...prev };
      for (const fieldPath of Object.keys(copy)) {
        if (fieldPath.startsWith(`${String(key)}/`)) {
          delete copy[fieldPath];
        }
      }
      return copy;
    });
    return true;
  }, [data, keyMap, pointerFromIssue]);

  const isStepUnlocked = useCallback(
    (path: StepPath) => {
      const idx = STEP_ROUTE_ORDER.indexOf(path);
      if (idx === -1) return false;
      if (idx === 0) return true;
      const previous = STEP_ROUTE_ORDER.slice(0, idx);
      return previous.every((p) => completedSteps[p]);
    },
    [completedSteps]
  );

  const isStepComplete = useCallback((path: StepPath) => !!completedSteps[path], [completedSteps]);

  const isStepValid = useCallback(
    (path: StepPath) => {
      const key = keyMap[path];
      const schema = (ccneFormSchema.shape as any)[key];
      if (!schema || typeof schema.safeParse !== "function") return true;
      const result = schema.safeParse((data as any)[key]);
      return result.success;
    },
    [data, keyMap]
  );

  const value = useMemo(
    () => ({
      completedSteps,
      markStepComplete,
      resetStepFrom,
      firstIncompletePath,
      isStepUnlocked,
      isStepComplete,
      isStepValid,
      data,
      setData,
      updateField,
      touched,
      errors,
      onBlurValidateField,
      validateStep,
    }),
    [
      completedSteps,
      markStepComplete,
      resetStepFrom,
      firstIncompletePath,
      isStepUnlocked,
      isStepComplete,
      isStepValid,
      data,
      setData,
      updateField,
      touched,
      errors,
      onBlurValidateField,
      validateStep,
    ]
  );

  return <CCNEFormContext.Provider value={value}>{children}</CCNEFormContext.Provider>;
}

export function useCCNEForm() {
  const ctx = useContext(CCNEFormContext);
  if (!ctx) throw new Error("useCCNEForm must be used within CCNEFormProvider");
  return ctx;
}
