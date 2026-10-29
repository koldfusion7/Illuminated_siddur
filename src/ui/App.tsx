import { useMemo, useState } from "react";
import { seed, unitIndex } from "../seed";
import { mergeForPrint, conflictGroups } from "../merge/merge";
import { defaultEngine, DEMO_PLACEHOLDER } from "../translit/engine";
import type { BaseUnit, UnitChoreography } from "../model/types";

type ColId = "italki" | "romaniote" | "arizal" | "chabad";
const COL_NAMES: Record<ColId, string> = { italki: "L1 Italki / Benei Roma", romaniote: "L3 Romaniote (parallel)", arizal: "L2 Arizal overlays", chabad: "Comparator: Chabad (read-only)" };
const CUE_ICON: Record<string, string> = { stand: "⬆", sit: "⬇", bow: "↷", cover_eyes: "◐", three_steps_back: "⇠", three_steps_forward: "⇢", face_east: "➚", kiss_tzitzit: "✦", rise_on_toes: "⤒", touch_tefillin: "✋" };
const engine = defaultEngine();

function Unit({ u }: { u?: BaseUnit }) {
  if (!u) return <span className="empty" aria-label="No unit in this rite">—</span>;
  return (<div className="unit"><code>{u.id}</code>{" "}
    {u.requires_minyan && <span className="tag" title="Requires minyan">minyan</span>}
    {u.status.map((s) => <span key={s} className="tag">{s}</span>)}
    <p lang={u.lang} dir={u.lang === "he" ? "rtl" : "ltr"}>{u.text}</p></div>);
}

export function App() {
  const [cols, setCols] = useState<ColId[]>(["italki", "romaniote", "arizal", "chabad"]);
  const [hidden, setHidden] = useState<Set<ColId>>(new Set());
  const [interlinear, setInterlinear] = useState(false);
  const [sys, setSys] = useState(engine.defaultSystem().id);
  const rows = useMemo(() => mergeForPrint(seed.alignments, unitIndex), []);
  const conflicts = useMemo(() => conflictGroups(seed.choreography), []);
  const move = (i: number, d: number) => { const c = [...cols]; const j = i + d; if (j < 0 || j >= c.length) return; [c[i], c[j]] = [c[j], c[i]]; setCols(c); };
  const visible = cols.filter((c) => !hidden.has(c));
  const cuesFor = (ids: (string | null)[]) => seed.choreography.filter((c) => ids.includes(c.unit_id));

  const cell = (c: ColId, r: (typeof rows)[number]) => {
    if (c === "italki") return <Unit u={r.italki} />;
    if (c === "romaniote") return r.kind === "combined" ? <span className="combined">= combined with L1 (identical)</span> : <Unit u={r.romaniote} />;
    if (c === "arizal") { const o = seed.overlay_links.filter((l) => l.target_unit_id === r.alignment.italki_id);
      return o.length ? <ul>{o.map((l) => <li key={l.id}><span className="tag l2">{l.type}</span> {l.label}</li>)}</ul> : null; }
    return <span className="muted">Link-out / licensed only. Status: {seed.comparators[0].license_status}</span>;
  };

  return (
    <main>
      <header>
        <h1>Illuminated Siddur: study reader</h1>
        <p className="banner" role="note">PLACEHOLDER CONTENT ONLY. This build contains no liturgical text.</p>
      </header>
      <section aria-label="Reader controls" className="controls">
        <fieldset><legend>Columns (arrange)</legend>
          <ol>{cols.map((c, i) => (<li key={c}>
            <label><input type="checkbox" checked={!hidden.has(c)} onChange={() => { const h = new Set(hidden); h.has(c) ? h.delete(c) : h.add(c); setHidden(h); }} /> {COL_NAMES[c]}</label>
            <button aria-label={`Move ${COL_NAMES[c]} left`} onClick={() => move(i, -1)}>←</button>
            <button aria-label={`Move ${COL_NAMES[c]} right`} onClick={() => move(i, 1)}>→</button></li>))}</ol>
        </fieldset>
        <label><input type="checkbox" checked={interlinear} onChange={(e) => setInterlinear(e.target.checked)} /> Interlinear view</label>
        <label>Transliteration{" "}
          <select value={sys} onChange={(e) => setSys(e.target.value)}>{engine.list().map((s) => <option key={s.id} value={s.id}>{s.name}{s.isDefault ? " (default)" : ""}</option>)}</select>
        </label>
        <span className="muted">Demo on nonsense syllables: <code>{DEMO_PLACEHOLDER}</code> → <strong>{engine.transliterate(DEMO_PLACEHOLDER, sys)}</strong></span>
      </section>

      <div className="reader">
        <table className={interlinear ? "interlinear" : ""}>
          <caption>Weekday Shacharit skeleton (Italki order governs)</caption>
          {!interlinear && <thead><tr><th scope="col">Alignment</th>{visible.map((c) => <th key={c} scope="col">{COL_NAMES[c]}</th>)}</tr></thead>}
          <tbody>{rows.map((r) => interlinear ? (
            <tr key={r.alignment.id}><td colSpan={visible.length + 1}>
              <strong>{r.alignment.id}</strong> <span className="tag">{r.alignment.diff_flags.join(", ")}</span>
              {visible.map((c) => <div key={c} className="il-line"><em>{COL_NAMES[c]}:</em> {cell(c, r)}</div>)}
            </td></tr>
          ) : (
            <tr key={r.alignment.id} className={r.kind}>
              <th scope="row">{r.alignment.id}<br /><span className="tag">{r.alignment.diff_flags.join(", ")}</span></th>
              {visible.map((c) => <td key={c}>{cell(c, r)}</td>)}
            </tr>))}</tbody>
        </table>

        <aside aria-label="Choreography rail" className="rail">
          <h2>Choreography rail</h2>
          <ul>{rows.flatMap((r) => cuesFor([r.alignment.italki_id, r.alignment.romaniote_id])).map((c: UnitChoreography) => (
            <li key={c.id} className={c.conflict_group ? "conflict" : ""}>
              <span aria-hidden="true" className="icon">{CUE_ICON[c.cue_code]}</span>{" "}
              <strong>{c.cue_code}</strong> <span className="tag">{c.layer_source}</span> <span className="tag">{c.confidence}</span>
              <div className="muted">{c.unit_id} · {c.timing} · {c.obligation_tag}: {c.label}</div>
              {c.conflict_group && <div role="note">⚠ Disclosed conflict ({c.conflict_group}): {conflicts.get(c.conflict_group)!.length} layers differ, not resolved</div>}
            </li>))}</ul>
        </aside>
      </div>
    </main>
  );
}
