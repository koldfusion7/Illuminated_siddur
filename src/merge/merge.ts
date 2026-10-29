import type { Alignment, BaseUnit } from "../model/types";
export interface MergedRow { kind: "combined" | "split"; alignment: Alignment; italki?: BaseUnit; romaniote?: BaseUnit; }
/** Dual print merge: identical units combine into one row; everything else stays side by side.
 * Ordering always follows Italki (L1); Romaniote-only units are placed directly after the row holding
 * their nearest preceding Romaniote unit. Nothing is silently dropped. */
export function mergeForPrint(alignments: Alignment[], units: Map<string, BaseUnit>): MergedRow[] {
  const ord = (a: Alignment, side: "italki_id" | "romaniote_id") => (a[side] ? units.get(a[side]!)?.order ?? Infinity : Infinity);
  const withItk = alignments.filter((a) => a.italki_id).sort((a, b) => ord(a, "italki_id") - ord(b, "italki_id"));
  const romOnly = alignments.filter((a) => !a.italki_id).sort((a, b) => ord(a, "romaniote_id") - ord(b, "romaniote_id"));
  const result = [...withItk];
  for (const r of romOnly) {
    const rOrder = ord(r, "romaniote_id");
    // find last italki-anchored row whose romaniote counterpart precedes this one
    // anchor on the nearest preceding Romaniote unit (highest Romaniote order below this one)
    let idx = -1, best = -Infinity;
    result.forEach((a, i) => { const o = a.romaniote_id ? ord(a, "romaniote_id") : -Infinity; if (o < rOrder && o > best) { best = o; idx = i; } });
    result.splice(idx + 1, 0, r);
  }
  return result.map((a) => ({
    kind: a.diff_flags.length === 1 && a.diff_flags[0] === "identical" ? "combined" : "split",
    alignment: a,
    italki: a.italki_id ? units.get(a.italki_id) : undefined,
    romaniote: a.romaniote_id ? units.get(a.romaniote_id) : undefined,
  }));
}
/** Choreography conflicts grouped by conflict_group; always surfaced, never resolved. */
export function conflictGroups<T extends { conflict_group?: string }>(cues: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  cues.forEach((c) => { if (c.conflict_group) m.set(c.conflict_group, [...(m.get(c.conflict_group) ?? []), c]); });
  return m;
}
