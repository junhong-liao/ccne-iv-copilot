import { z } from "zod";
import {
  PROGRAM_LEVELS,
  type ProgramLevel,
  REPORTING_WINDOWS,
  type ReportingWindowId,
  EXCLUSION_CATEGORIES,
  type ExclusionCategory,
  DATA_SOURCES,
  type DataSource,
  ELA_OUTCOME_KEYS,
  type ELAOutcomeKey,
  MAX_COHORTS,
  MAX_SUPPORTING_EVIDENCE,
} from "@/lib/constants/ccne";

const PROGRAM_LEVEL_VALUES = PROGRAM_LEVELS.map((p) => p.value) as [ProgramLevel, ...ProgramLevel[]];
const REPORTING_WINDOW_IDS = REPORTING_WINDOWS.map((w) => w.id) as [ReportingWindowId, ...ReportingWindowId[]];
const EXCLUSION_VALUES = EXCLUSION_CATEGORIES.map((e) => e.value) as [ExclusionCategory, ...ExclusionCategory[]];
const DATA_SOURCE_VALUES = DATA_SOURCES.map((d) => d.value) as [DataSource, ...DataSource[]];

const yearStringSchema = z
  .string()
  .regex(/^[12][0-9]{3}$/u, { message: "Enter a 4-digit year" });

const positiveIntSchema = z
  .number({ invalid_type_error: "Enter a number" })
  .int({ message: "Enter a whole number" })
  .min(0, "Must be ≥ 0");

const exclusionSchema = z
  .object({
    category: z.enum(EXCLUSION_VALUES),
    count: positiveIntSchema,
    note: z.string().max(200, "Keep notes under 200 characters").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.category === "other" && !value.note?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["note"],
        message: "Provide a note for 'Other' exclusions",
      });
    }
  });

export type CohortExclusion = z.infer<typeof exclusionSchema>;

const cohortCompletionSchema = z
  .object({
    numerator: positiveIntSchema,
    denominator: positiveIntSchema,
    exclusions: z.array(exclusionSchema).max(5, "Limit exclusions to 5 categories"),
  })
  .superRefine((value, ctx) => {
    if (value.denominator === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Denominator must be greater than 0", path: ["denominator"] });
      return;
    }
    if (value.numerator > value.denominator) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numerator cannot exceed denominator", path: ["numerator"] });
    }
    const exclusionTotal = value.exclusions.reduce((acc, exclusion) => acc + exclusion.count, 0);
    if (exclusionTotal > value.denominator) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exclusions cannot exceed denominator",
        path: ["exclusions"],
      });
    }
  });

const cohortLicensureSchema = z
  .object({
    firstTimeCandidates: positiveIntSchema,
    firstTimePasses: positiveIntSchema,
  })
  .superRefine((value, ctx) => {
    if (value.firstTimeCandidates === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Candidates must be greater than 0", path: ["firstTimeCandidates"] });
      return;
    }
    if (value.firstTimePasses > value.firstTimeCandidates) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passes cannot exceed candidates", path: ["firstTimePasses"] });
    }
  });

const cohortEmploymentSchema = z
  .object({
    seekers: positiveIntSchema,
    employed: positiveIntSchema,
    dataSource: z.enum(DATA_SOURCE_VALUES),
    otherSourceLabel: z.string().max(100, "Keep other source under 100 characters").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.seekers === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Job seekers must be greater than 0", path: ["seekers"] });
      return;
    }
    if (value.employed > value.seekers) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Employed cannot exceed seekers", path: ["employed"] });
    }
    if (value.dataSource === "other" && !value.otherSourceLabel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a description for the other data source",
        path: ["otherSourceLabel"],
      });
    }
  });

const cohortSchema = z.object({
  id: z.string().uuid(),
  year: yearStringSchema,
  notes: z.string().max(300, "Limit notes to 300 characters").optional(),
  licensure: cohortLicensureSchema,
  completion: cohortCompletionSchema,
  employment: cohortEmploymentSchema,
});

export type ReportingCohort = z.infer<typeof cohortSchema>;

const reportingWindowSchema = z
  .object({
    selection: z.enum(REPORTING_WINDOW_IDS),
    startYear: yearStringSchema,
    endYear: yearStringSchema,
    cohorts: z.array(cohortSchema).min(1, "Add at least one cohort").max(MAX_COHORTS, `Limit cohorts to ${MAX_COHORTS}`),
  })
  .superRefine((value, ctx) => {
    if (Number(value.startYear) > Number(value.endYear)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start year must be before end year", path: ["startYear"] });
    }
    const years = value.cohorts.map((cohort) => cohort.year);
    const duplicates = years.filter((yr, idx) => years.indexOf(yr) !== idx);
    if (duplicates.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remove duplicate cohort years", path: ["cohorts"] });
    }
  });

export type ReportingWindow = z.infer<typeof reportingWindowSchema>;

const elaOverrideSchema = z
  .object({
    useDefault: z.boolean(),
    overrideValue: z
      .number({ invalid_type_error: "Enter a number" })
      .min(0, "Must be ≥ 0")
      .max(100, "Must be ≤ 100")
      .nullable(),
    rationale: z.string().max(400, "Keep rationale under 400 characters").optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.useDefault) {
      if (value.overrideValue === null || Number.isNaN(value.overrideValue)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter an override value", path: ["overrideValue"] });
      }
      if (!value.rationale?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide rationale for override", path: ["rationale"] });
      }
    }
  });

export type ELAOverride = z.infer<typeof elaOverrideSchema>;

const elaSchema = z.object(
  Object.fromEntries(
    ELA_OUTCOME_KEYS.map((key) => [key, elaOverrideSchema])
  ) as Record<ELAOutcomeKey, typeof elaOverrideSchema>
);

export type ELAOverrides = z.infer<typeof elaSchema>;

const fileAttachmentSchema = z.object({
  kind: z.literal("file"),
  id: z.string().uuid(),
  name: z.string().min(1),
  size: positiveIntSchema,
  type: z.string().optional(),
});

const linkAttachmentSchema = z.object({
  kind: z.literal("link"),
  id: z.string().uuid(),
  title: z.string().min(1, "Link title required"),
  url: z.string().url("Enter a valid URL"),
});

export type FileAttachment = z.infer<typeof fileAttachmentSchema>;
export type LinkAttachment = z.infer<typeof linkAttachmentSchema>;
export type EvidenceAttachment = FileAttachment | LinkAttachment;

const certificationStatusSchema = z.enum(["applicable", "not_applicable", "pending"]);

const ivaEvidenceSchema = z
  .object({
    certificationStatus: certificationStatusSchema,
    certificationNote: z.string().max(400, "Keep explanation under 400 characters").optional(),
    ivaNarrative: z.string().min(50, "Narrative should be at least 50 characters"),
    mepEvidence: z.array(fileAttachmentSchema).min(1, "Upload the MEP evidence"),
    supportingEvidence: z
      .array(z.union([fileAttachmentSchema, linkAttachmentSchema]))
      .min(1, "Add at least one supporting evidence item")
      .max(MAX_SUPPORTING_EVIDENCE, `Limit supporting evidence to ${MAX_SUPPORTING_EVIDENCE} items`),
  })
  .superRefine((value, ctx) => {
    if (value.certificationStatus === "not_applicable" && !value.certificationNote?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide explanation when certification is not applicable",
        path: ["certificationNote"],
      });
    }
  });

export type IVAEvidence = z.infer<typeof ivaEvidenceSchema>;

export const programInfoSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  programName: z.string().min(1, "Program name is required"),
  programLevel: z.enum(PROGRAM_LEVEL_VALUES),
  accreditationCycle: z.string().min(1, "Accreditation cycle is required"),
  contactEmail: z.string().email("Valid email required"),
  deanName: z.string().min(1, "Dean/Director name is required"),
});

export type ProgramInfo = z.infer<typeof programInfoSchema>;

export const ccneFormSchema = z.object({
  programInfo: programInfoSchema,
  reportingWindow: reportingWindowSchema,
  expectedOutcomes: elaSchema,
  ivaEvidence: ivaEvidenceSchema,
});

export type CCNEFormData = z.infer<typeof ccneFormSchema>;

const generateId = () => {
  const cryptoRef = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  return `ccne-${Math.random().toString(36).slice(2, 10)}`;
};

export const defaultCohort = (): ReportingCohort => ({
  id: generateId(),
  year: "",
  notes: "",
  licensure: {
    firstTimeCandidates: 0,
    firstTimePasses: 0,
  },
  completion: {
    numerator: 0,
    denominator: 0,
    exclusions: [],
  },
  employment: {
    seekers: 0,
    employed: 0,
    dataSource: DATA_SOURCE_VALUES[0],
    otherSourceLabel: undefined,
  },
});

export const defaultFormData: CCNEFormData = {
  programInfo: {
    institutionName: "",
    programName: "",
    programLevel: PROGRAM_LEVEL_VALUES[0],
    accreditationCycle: "",
    contactEmail: "",
    deanName: "",
  },
  reportingWindow: {
    selection: REPORTING_WINDOW_IDS[0],
    startYear: "",
    endYear: "",
    cohorts: [defaultCohort()],
  },
  expectedOutcomes: Object.fromEntries(
    ELA_OUTCOME_KEYS.map((key) => [key, { useDefault: true, overrideValue: null, rationale: "" }])
  ) as ELAOverrides,
  ivaEvidence: {
    certificationStatus: "applicable",
    certificationNote: "",
    ivaNarrative: "",
    mepEvidence: [],
    supportingEvidence: [],
  },
};

export function sanitizeForSubmission(data: CCNEFormData): CCNEFormData {
  const programInfo = {
    ...data.programInfo,
    institutionName: data.programInfo.institutionName.trim(),
    programName: data.programInfo.programName.trim(),
    accreditationCycle: data.programInfo.accreditationCycle.trim(),
    contactEmail: data.programInfo.contactEmail.trim(),
    deanName: data.programInfo.deanName.trim(),
  };

  const reportingWindow: ReportingWindow = {
    ...data.reportingWindow,
    cohorts: data.reportingWindow.cohorts.map((cohort) => ({
      ...cohort,
      notes: cohort.notes?.trim() ?? "",
      completion: {
        ...cohort.completion,
        exclusions: cohort.completion.exclusions.map((ex) => ({
          ...ex,
          note: ex.note?.trim(),
        })),
      },
      employment: {
        ...cohort.employment,
        otherSourceLabel: cohort.employment.otherSourceLabel?.trim(),
      },
    })),
  };

  const ivaEvidence: IVAEvidence = {
    ...data.ivaEvidence,
    certificationNote: data.ivaEvidence.certificationNote?.trim(),
    ivaNarrative: data.ivaEvidence.ivaNarrative.trim(),
  };

  return {
    programInfo,
    reportingWindow,
    expectedOutcomes: data.expectedOutcomes,
    ivaEvidence,
  };
}
