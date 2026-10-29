/** Data model for the Illuminated Siddur. All content in this repo is PLACEHOLDER. */
export type LayerId = "L1_italki" | "L2_arizal" | "L3_romaniote" | "comparator_chabad";
export type StatusTag = "core_fixed" | "minhag" | "tzibbur" | "calendar" | "optional";
export type DiffFlag = "identical" | "near_identical" | "divergent_text" | "divergent_order" | "italki_only" | "romaniote_only";
export type OverlayType = "kavanah" | "addition" | "reordering" | "wording_variant" | "omission_flag" | "gestural_rubric";
export type LicenseStatus = "public_domain" | "licensed" | "link_out_only" | "pending";
export type Confidence = "attested" | "inferred" | "disputed" | "unknown";
export type ObligationTag = "required" | "custom" | "optional" | "kabbalistic";
/** Cue vocabulary (design system §13.4). Step counts and specific acts live in `label` / `step_count`;
 * facing is data on the record (`direction`), never an enum value. */
export const CUE_CODES = [
  "stand", "sit", "bow", "kneel", "rise_on_toes",
  "steps_approach", "steps_retreat", "face_direction", "turn",
  "cover_eyes", "lift_eyes", "strike_chest", "kiss_tzitzit", "hand_position",
] as const;
export type CueCode = (typeof CUE_CODES)[number];
/** Migration map from the scaffold vocabulary. */
export const LEGACY_CUE_MAP: Record<string, CueCode> = {
  three_steps_forward: "steps_approach", three_steps_back: "steps_retreat",
  face_east: "face_direction", touch_tefillin: "hand_position",
};
export type CueFamily = "posture" | "movement" | "gesture";
export const CUE_FAMILY: Record<CueCode, CueFamily> = {
  stand: "posture", sit: "posture", bow: "posture", kneel: "posture", rise_on_toes: "posture",
  steps_approach: "movement", steps_retreat: "movement", face_direction: "movement", turn: "movement",
  cover_eyes: "gesture", lift_eyes: "gesture", strike_chest: "gesture", kiss_tzitzit: "gesture", hand_position: "gesture",
};
/** Facing as data: a named target resolved at runtime, or a fixed bearing (degrees from true north). */
export type CueDirection =
  | { kind: "toward"; target: "jerusalem" | "ark" | "congregation"; resolve?: "user_location" | "community_setting" | "manual" }
  | { kind: "bearing"; bearing_deg: number };
export type Timing = "before" | "start" | "during" | "end" | "after";

export interface RiteCorpus { id: string; layer: LayerId; name: string; direction: "rtl" | "ltr"; witnesses: string[]; }

/** Permanent ID format: <RITE>.<SERVICE>.<SECTION>.<NNN>, e.g. ITK.SHA.SHEMA.010. Never reused. */
export interface BaseUnit {
  id: string; corpus_id: string; service: "shacharit" | "mincha" | "maariv";
  section: string; order: number; label: string;
  /** Placeholder only. Real text gated behind editorial authorization. */
  text: string; lang: "he" | "en"; status: StatusTag[]; requires_minyan: boolean;
}
export type ParallelUnit = BaseUnit & { parallel_of?: string };
export interface Alignment { id: string; italki_id: string | null; romaniote_id: string | null; diff_flags: DiffFlag[]; note?: string; }
export interface OverlayLayer { id: string; layer: "L2_arizal"; name: string; disclosure: string; }
export interface OverlayLink { id: string; overlay_layer_id: string; target_unit_id: string; type: OverlayType; label: string; source_ref: string; }
export interface ComparatorCorpus { id: string; layer: "comparator_chabad"; name: string; license_status: LicenseStatus; link_out_url?: string; read_only: true; }
export interface UnitChoreography {
  id: string; unit_id: string; cue_code: CueCode; layer_source: LayerId; timing: Timing;
  obligation_tag: ObligationTag; confidence: Confidence; label: string;
  conflict_group?: string; never_silent_resolve: boolean;
  /** Required when cue_code is face_direction, forbidden otherwise. */
  direction?: CueDirection;
  step_count?: number;
}
export interface SeedBundle {
  corpora: RiteCorpus[]; units: BaseUnit[]; parallel_units: ParallelUnit[]; alignments: Alignment[];
  overlay_layers: OverlayLayer[]; overlay_links: OverlayLink[]; comparators: ComparatorCorpus[]; choreography: UnitChoreography[];
}

/** Default facing target for face_direction cues (approved: toward Jerusalem). */
export const DEFAULT_FACE_TARGET = "jerusalem" as const;
export const DEFAULT_FACE_DIRECTION: CueDirection = { kind: "toward", target: DEFAULT_FACE_TARGET, resolve: "user_location" };

/* ---------- Real source text (public-domain / open-licensed only) ---------- */
export type SourceLicense = "Public Domain" | "CC0" | "CC-BY" | "CC-BY-SA" | "CC-BY-SA-4.0";
export interface Provenance {
  source_title: string; source_url: string; source_fragment: string; publisher: string; witness: string;
  license: SourceLicense; license_evidence_url: string; license_url?: string | null; retrieved: string;
  /** sha256 of the string exactly as served by the source. */
  source_sha256: string;
  /** sha256 of `text` (served string after Unicode NFC). */
  text_sha256: string;
  /** IDs into normalization_log. */
  normalization: string[];
}
/** A unit carrying real source text. `text` is verbatim (NFC only); `text_display` is a logged mechanical derivation. */
export interface SourceUnit extends Omit<BaseUnit, "text"> {
  text: string; text_display: string; provenance: Provenance;
  /** Never auto-generated for liturgy. */
  transliteration: null; gloss: null;
}
export interface ComparatorSource {
  id: string; layer: "comparator"; name: string; nusach: string;
  license_status: "public_domain" | "cc_by" | "cc_by_sa" | "cc0"; license: SourceLicense; license_evidence_url: string;
  version_source: string; read_only: true; unit_count: number; data_url: string;
}
export interface NormalizationRule { id: string; applies_to: "text" | "text_display"; rule: string; }
export interface SourcesBundle { normalization_log: NormalizationRule[]; corpora: RiteCorpus[]; units: SourceUnit[]; comparators: ComparatorSource[]; }
