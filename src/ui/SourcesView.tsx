import { useEffect, useMemo, useState } from "react";
import { sources } from "../seed";
import type { SourceUnit } from "../model/types";

/* Real public-domain / open-licensed Hebrew, shown verbatim (display derivation per normalization_log).
   No transliteration, translation or commentary is generated for liturgy. */
type Pick = { id: string; name: string; tier: string; cls: string; license: string; url?: string; units?: SourceUnit[] };
const ITALKI: Pick = { id: "corpus.italki", name: "Italki (L1) — Open Siddur transcriptions of Prato 1949", tier: "L1", cls: "l1", license: "CC-BY-SA-4.0", units: sources.units.filter((u) => u.corpus_id === "corpus.italki") };
const PICKS: Pick[] = [ITALKI,
  { id: "corpus.romaniote", name: "Romaniote (L3)", tier: "L3", cls: "l3", license: "—", units: [] },
  ...sources.comparators.map((c) => ({ id: c.id, name: c.name, tier: "C", cls: "cmp", license: `${c.license} (${c.license_status})`, url: c.data_url }))];

export function SourcesView({ tl }: { tl: boolean }) {
  const [pick, setPick] = useState<string>(() => new URLSearchParams(location.search).get("src") ?? ITALKI.id);
  const [loaded, setLoaded] = useState<Record<string, SourceUnit[]>>({});
  const [section, setSection] = useState<string>("");
  const p = PICKS.find((x) => x.id === pick)!;
  useEffect(() => {
    if (p.url && !loaded[p.id]) fetch(import.meta.env.BASE_URL + p.url).then((r) => r.json()).then((us: SourceUnit[]) => setLoaded((l) => ({ ...l, [p.id]: us })));
  }, [p, loaded]);
  const units = p.units ?? loaded[p.id];
  const sections = useMemo(() => [...new Set((units ?? []).map((u) => u.section))], [units]);
  const shown = (units ?? []).filter((u) => !section || u.section === section);
  return (
    <div className="src-view">
      <div className="src-pick" role="group" aria-label="Source corpus">
        {PICKS.map((x) => <button key={x.id} aria-pressed={pick === x.id} onClick={() => { setPick(x.id); setSection(""); }}><span className="tier">{x.tier}</span> {x.name}</button>)}
      </div>
      <p className="flag-note">License: <b>{p.license}</b>. Text is shown exactly as the source gives it (Unicode NFC; markup removed for display only). Rites are never blended: each corpus is its own column of record.</p>
      {p.id === "corpus.romaniote" && <p className="absent">No machine-readable public-domain or open-licensed Romaniote weekday Shacharit text has been found. The L3 layer stays on placeholders until the Mahzor Romania prints/manuscripts are transcribed (OCR + review). Nothing has been filled in from another nusach.</p>}
      {units === undefined && <p className="absent">Loading…</p>}
      {sections.length > 1 && <label className="src-sec">Section <select value={section} onChange={(e) => setSection(e.target.value)}><option value="">All ({units?.length})</option>{sections.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>}
      {shown.map((u) => (
        <article key={u.id} className={`src-unit c-${p.cls}`}>
          <div className="unit-meta"><span className="uid">{u.id}</span><span className="label">{u.label}</span></div>
          <p className="he src-he" lang="he" dir="rtl">{u.text_display}</p>
          {tl && <p className="unavailable">Transliteration not generated for source liturgy (pending editorial authorization).</p>}
          <p className="prov"><a href={u.provenance.source_url} target="_blank" rel="noreferrer">{u.provenance.source_title}</a> · {u.provenance.witness} · <b>{u.provenance.license}</b> · retrieved {u.provenance.retrieved} · sha256 <code title={u.provenance.text_sha256}>{u.provenance.text_sha256.slice(0, 12)}</code></p>
        </article>))}
    </div>
  );
}
