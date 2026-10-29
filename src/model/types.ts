/** Data model for the Illuminated Siddur. All content in this repo is PLACEHOLDER. */
export type LayerId = "L1_italki" | "L2_arizal" | "L3_romaniote" | "comparator_chabad";
export type StatusTag = "core_fixed" | "minhag" | "tzibbur" | "calendar" | "optional";
export type DiffFlag = "identical" | "near_identical" | "divergent_text" | "divergent_order" | "italki_only" | "romaniote_only";
export type OverlayType = "kavanah" | "addition" | "reordering" | "wording_variant" | "omission_flag" | "gestural_rubric";
export type LicenseStatus = "public_domain" | "licensed" | "link_out_only" | "pending";
export type Confidence = "attested" | "inferred" | "disputed" | "unknown";
export type ObligationTag = "required" | "custom" | "optional" | "kabbalistic";
export type CueCode = "stand" | "sit" | "bow" | "cover_eyes" | "three_steps_back" | "three_steps_forward" | "face_east" | "kiss_tzitzit" | "rise_on_toes" | "touch_tefillin";
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
}
export interface SeedBundle {
  corpora: RiteCorpus[]; units: BaseUnit[]; parallel_units: ParallelUnit[]; alignments: Alignment[];
  overlay_layers: OverlayLayer[]; overlay_links: OverlayLink[]; comparators: ComparatorCorpus[]; choreography: UnitChoreography[];
}
