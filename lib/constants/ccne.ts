export const PROGRAM_LEVELS = [
  { value: "bsn", label: "BSN (Baccalaureate)" },
  { value: "msn", label: "MSN (Master's)" },
  { value: "post_msn", label: "Post-MSN" },
  { value: "dnp", label: "DNP" },
] as const;

export type ProgramLevel = (typeof PROGRAM_LEVELS)[number]["value"];

export const REPORTING_WINDOWS = [
  { id: "rolling-3", label: "Most recent 3 cohorts", cohortCount: 3 },
  { id: "rolling-4", label: "Most recent 4 cohorts", cohortCount: 4 },
  { id: "custom", label: "Custom window", cohortCount: null },
] as const;

export type ReportingWindowId = (typeof REPORTING_WINDOWS)[number]["id"];

export const EXCLUSION_CATEGORIES = [
  { value: "military_deployment", label: "Military deployment" },
  { value: "extended_medical_leave", label: "Extended medical leave" },
  { value: "missionary_service", label: "Missionary/service obligations" },
  { value: "death", label: "Deceased" },
  { value: "other", label: "Other (specify)" },
] as const;

export type ExclusionCategory = (typeof EXCLUSION_CATEGORIES)[number]["value"];

export const DATA_SOURCES = [
  { value: "employer_survey", label: "Employer survey" },
  { value: "licensure_board", label: "Licensure board" },
  { value: "dean_report", label: "Dean/Director report" },
  { value: "consortium", label: "Consortium" },
  { value: "other", label: "Other (specify)" },
] as const;

export type DataSource = (typeof DATA_SOURCES)[number]["value"];

export const ELA_OUTCOME_KEYS = ["licensure", "completion", "employment"] as const;

export type ELAOutcomeKey = (typeof ELA_OUTCOME_KEYS)[number];

export const DEFAULT_ELA_MAP: Record<ProgramLevel, Record<ELAOutcomeKey, number>> = {
  bsn: {
    licensure: 80,
    completion: 70,
    employment: 80,
  },
  msn: {
    licensure: 82,
    completion: 75,
    employment: 85,
  },
  post_msn: {
    licensure: 85,
    completion: 80,
    employment: 88,
  },
  dnp: {
    licensure: 90,
    completion: 85,
    employment: 90,
  },
};

export function deriveDefaultEla(programLevel: ProgramLevel) {
  return { ...DEFAULT_ELA_MAP[programLevel] };
}

export const MAX_COHORTS = 6;
export const MAX_SUPPORTING_EVIDENCE = 12;
