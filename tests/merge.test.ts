import { mergeForPrint, conflictGroups } from "../src/merge/merge";
import { seed, unitIndex } from "../src/seed";
const rows = mergeForPrint(seed.alignments, unitIndex);
test("every alignment appears exactly once (no silent drops)", () => {
  expect(rows.length).toBe(seed.alignments.length);
  expect(new Set(rows.map((r) => r.alignment.id)).size).toBe(seed.alignments.length);
});
test("identical units combine; others split", () => {
  for (const r of rows) expect(r.kind).toBe(r.alignment.diff_flags.join() === "identical" ? "combined" : "split");
  expect(rows.filter((r) => r.kind === "combined").length).toBe(4);
});
test("Italki order wins on divergent_order", () => {
  const itk = rows.filter((r) => r.italki).map((r) => r.italki!.order);
  expect(itk).toEqual([...itk].sort((a, b) => a - b));
  const ids = rows.map((r) => r.alignment.id);
  expect(ids.indexOf("AL.003")).toBeLessThan(ids.indexOf("AL.004"));
});
test("romaniote_only unit is placed after its Romaniote predecessor", () => {
  const ids = rows.map((r) => r.alignment.id);
  expect(ids.indexOf("AL.005")).toBe(ids.indexOf("AL.003") + 1);
});
test("seed covers every diff flag", () => {
  const f = new Set(seed.alignments.flatMap((a) => a.diff_flags));
  for (const k of ["identical","near_identical","divergent_text","divergent_order","italki_only","romaniote_only"]) expect(f.has(k as any)).toBe(true);
});
test("cover_eyes conflict is disclosed across layers and never silently resolved", () => {
  const g = conflictGroups(seed.choreography).get("CG.SHEMA.COVER_EYES")!;
  expect(new Set(g.map((c) => c.layer_source)).size).toBe(3);
  expect(g.every((c) => c.never_silent_resolve)).toBe(true);
});
