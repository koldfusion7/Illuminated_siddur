import Ajv from "ajv";
import schema from "../schema/siddur.schema.json";
import { seed, sources } from "../src/seed";
import { DEFAULT_FACE_TARGET } from "../src/model/types";
import { readFileSync } from "fs";
import { createHash } from "crypto";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const OK_LICENSES = ["Public Domain", "CC0", "CC-BY", "CC-BY-SA", "CC-BY-SA-4.0"];
const PROV = ["source_title", "source_url", "source_fragment", "publisher", "witness", "license", "license_evidence_url", "retrieved", "source_sha256", "text_sha256", "normalization"];
const comparatorUnits = sources.comparators.flatMap((c) => JSON.parse(readFileSync(`public/${c.data_url}`, "utf8")) as any[]);
const allUnits: any[] = [...seed.units, ...seed.parallel_units, ...sources.units, ...comparatorUnits];

test("placeholder seed validates against JSON Schema", () => {
  expect(new Ajv({ allErrors: true }).compile(schema)(seed)).toBe(true);
});

test("PLACEHOLDER rule: every unit is either a placeholder or carries license + provenance", () => {
  const ruleIds = new Set(sources.normalization_log.map((r) => r.id));
  for (const u of allUnits) {
    if (u.text.startsWith("PLACEHOLDER")) { expect(u.provenance).toBeUndefined(); continue; }
    expect(u.provenance, u.id).toBeDefined();
    for (const k of PROV) expect(u.provenance[k], `${u.id}.${k}`).toBeTruthy();
    expect(OK_LICENSES).toContain(u.provenance.license);
    expect(u.provenance.source_url).toMatch(/^https:\/\//);
    expect(u.provenance.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sha(u.text)).toBe(u.provenance.text_sha256); // exact-text checksum
    expect(u.text).toBe(u.text.normalize("NFC"));
    for (const n of u.provenance.normalization) expect(ruleIds.has(n)).toBe(true);
    expect(u.transliteration).toBeNull(); // no auto-transliteration of liturgy
    expect(u.gloss).toBeNull();
    expect(u.id).toMatch(/^[A-Z]{3}\.[A-Z]{3}\.[A-Z_]+\.[0-9]{3,4}$/);
  }
});

test("permanent IDs are unique and rites are never blended", () => {
  const ids = allUnits.map((u) => u.id);
  expect(new Set(ids).size).toBe(ids.length);
  const prefix: Record<string, string> = { "corpus.italki": "ITK", "corpus.romaniote": "ROM", "CMP.ASHKENAZ": "ASH", "CMP.SEFARD": "SEF", "CMP.EDOT_HAMIZRACH": "EHM" };
  for (const u of allUnits) expect(u.id.slice(0, 3), u.id).toBe(prefix[u.corpus_id]);
  // Romaniote has no qualifying weekday-Shacharit digital text yet: it must stay placeholder-only.
  for (const u of allUnits.filter((x) => x.corpus_id === "corpus.romaniote")) expect(u.text.startsWith("PLACEHOLDER")).toBe(true);
});

test("comparators declare license status and evidence", () => {
  for (const c of sources.comparators) {
    expect(["public_domain", "cc_by", "cc_by_sa", "cc0"]).toContain(c.license_status);
    expect(c.license_evidence_url).toMatch(/^https:\/\//);
    expect(c.read_only).toBe(true);
  }
});

test("face_direction defaults to Jerusalem", () => {
  expect(DEFAULT_FACE_TARGET).toBe("jerusalem");
  for (const c of seed.choreography.filter((x) => x.cue_code === "face_direction")) expect(c.direction).toMatchObject({ kind: "toward", target: "jerusalem" });
});
