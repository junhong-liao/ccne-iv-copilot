import { z } from "zod";

// Step 1: Program Info
export const programInfoSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  programName: z.string().min(1, "Program name is required"),
  accreditationCycle: z.string().min(1, "Accreditation cycle is required"),
  contactEmail: z.string().email("Valid email required"),
});
export type ProgramInfo = z.infer<typeof programInfoSchema>;

// Step 2: Outcomes
export const outcomesSchema = z.object({
  nclexPassRatePercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  completionRatePercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  jobPlacementPercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
});
export type Outcomes = z.infer<typeof outcomesSchema>;

// Step 3: Thresholds
export const thresholdsSchema = z.object({
  nclexThresholdPercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  completionThresholdPercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  jobPlacementThresholdPercent: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
});
export type Thresholds = z.infer<typeof thresholdsSchema>;

// Step 4: Narratives and Uploads
export const narrativeUploadsSchema = z.object({
  narrativeText: z.string().min(1, "Narrative is required"),
  attachments: z.array(
    z.object({ name: z.string(), size: z.number().nonnegative(), type: z.string().optional() })
  ).max(10, "Max 10 files"),
});
export type NarrativeUploads = z.infer<typeof narrativeUploadsSchema>;

// Master schema
export const ccneFormSchema = z.object({
  programInfo: programInfoSchema,
  outcomes: outcomesSchema,
  thresholds: thresholdsSchema,
  narrativeUploads: narrativeUploadsSchema,
});
export type CCNEFormData = z.infer<typeof ccneFormSchema>;

export function sanitizeForSubmission(data: CCNEFormData): CCNEFormData {
  // For MVP, just return as-is; hook for trimming strings/removing transient fields
  return {
    ...data,
    programInfo: {
      ...data.programInfo,
      institutionName: data.programInfo.institutionName.trim(),
      programName: data.programInfo.programName.trim(),
      accreditationCycle: data.programInfo.accreditationCycle.trim(),
      contactEmail: data.programInfo.contactEmail.trim(),
    },
    narrativeUploads: {
      ...data.narrativeUploads,
      narrativeText: data.narrativeUploads.narrativeText.trim(),
    },
  };
}

export const defaultFormData: CCNEFormData = {
  programInfo: {
    institutionName: "",
    programName: "",
    accreditationCycle: "",
    contactEmail: "",
  },
  outcomes: {
    nclexPassRatePercent: 0,
    completionRatePercent: 0,
    jobPlacementPercent: 0,
  },
  thresholds: {
    nclexThresholdPercent: 0,
    completionThresholdPercent: 0,
    jobPlacementThresholdPercent: 0,
  },
  narrativeUploads: {
    narrativeText: "",
    attachments: [],
  },
};


