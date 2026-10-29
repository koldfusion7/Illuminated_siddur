import { useEffect, useMemo, useState } from "react";
import { seed, unitIndex } from "../seed";
import { mergeForPrint, conflictGroups, type MergedRow } from "../merge/merge";
import { defaultEngine, DEMO_PLACEHOLDER } from "../translit/engine";
import { CUE_CODES, type BaseUnit, type DiffFlag, type LayerId, type UnitChoreography, type Timing } from "../model/types";

/* ALL CONTENT IS PLACEHOLDER. Hebrew runs are lorem-ipsum nonsense in Hebrew script (DESIGN §19.3). */
const LOREM_HE = [
  "לוֹרֶם אִיפְּסוּם דּוֹלוֹר סִיט אָמֵט, קוֹנְסֶקְטֶטוּר אָדִיפִּיסְקִינְג אֶלִיט.",
  "סֶד דּוֹ אַיְסְמוֹד טֶמְפּוֹר אִינְסִידִידוּנְט אוּט לָאבּוֹרֶה.",
  "אוּט לָאבּוֹרֶה אֶט דּוֹלוֹרֶה מַגְנָה אָלִיקְוָה נוֹסְטְרוּד.",
];
const LOREM_GLOSS = "לורם איפסום דולור סיט אמט קונסקטטור";

type ColId = "italki" | "romaniote" | "arizal" | "chabad";
type Theme = "auto" | "light" | "dark";
type View = "study" | "interlinear";
const COLS: Record<ColId, { tier: string; name: string; cls: string; layer: LayerId }> = {
  italki: { tier: "L1", name: "Italki", cls: "l1", layer: "L1_italki" },
  romaniote: { tier: "L3", name: "Romaniote", cls: "l3", layer: "L3_romaniote" },
  arizal: { tier: "L2", name: "Arizal", cls: "l2", layer: "L2_arizal" },
  chabad: { tier: "C", name: "Chabad", cls: "cmp", layer: "comparator_chabad" },
};
const PRESETS: { id: string; name: string; cols: ColId[] }[] = [
  { id: "all", name: "Full apparatus", cols: ["italki", "romaniote", "arizal", "chabad"] },
  { id: "rites", name: "Rites side by side", cols: ["italki", "romaniote"] },
  { id: "overlay", name: "Floor + overlay", cols: ["italki", "arizal"] },
  { id: "compare", name: "Comparator check", cols: ["italki", "chabad"] },
];
const LAYER_TIER: Record<LayerId, { tier: string; cls: string }> = {
  L1_italki: { tier: "L1", cls: "l1" }, L2_arizal: { tier: "L2", cls: "l2" },
  L3_romaniote: { tier: "L3", cls: "l3" }, comparator_chabad: { tier: "C", cls: "cmp" },
};
const DIFF: Record<DiffFlag, { g: string; cls: string; label: string }> = {
  identical: { g: "=", cls: "identical", label: "identical" },
  near_identical: { g: "≈", cls: "near", label: "near identical" },
  divergent_text: { g: "⑂", cls: "text", label: "divergent text" },
  divergent_order: { g: "⇅", cls: "order", label: "divergent order" },
  italki_only: { g: "◧", cls: "italki-only", label: "Italki only" },
  romaniote_only: { g: "◨", cls: "romaniote-only", label: "Romaniote only" },
};
const TIMINGS: Timing[] = ["before", "start", "during", "end", "after"];
const TIMING_LABEL: Record<Timing, string> = { before: "before unit", start: "start of unit", during: "during unit", end: "end of unit", after: "after unit" };
const SEPHARDI_SAMPLE = ["Shabbat", "Torah", "berakhah", "tzitzit", "minyan", "kavanah"];
const engine = defaultEngine();
const conflicts = conflictGroups(seed.choreography);
const comparator = seed.comparators[0];
const overlay = seed.overlay_layers[0];

function usePersisted<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const q = new URLSearchParams(location.search).get(key);
      if (q !== null) return (q.startsWith("[") ? JSON.parse(q) : q) as T;
      const s = localStorage.getItem("is." + key); return s ? (JSON.parse(s) as T) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem("is." + key, JSON.stringify(v)); } catch { /* private mode */ } }, [key, v]);
  return [v, setV] as const;
}

const cueName = (c: string) => c.replace(/_/g, " ").replace(/^./, (x) => x.toUpperCase());
export function CueIcon({ code, className = "cue__icon" }: { code: string; className?: string }) {
  const id = (CUE_CODES as readonly string[]).includes(code) ? "cue-" + code.replace(/_/g, "-") : "cue-unknown";
  return <svg className={className} aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href={`/icons/sprite.svg#${id}`} /></svg>;
}

function Badge({ tier, name, cls, lock }: { tier: string; name: string; cls: string; lock?: boolean }) {
  return (
    <span className={`badge badge--${cls}`}><span className="tier">{tier}</span>{name}
      {lock && <svg viewBox="0 0 12 12" aria-label="read-only" role="img"><rect x="2" y="5.5" width="8" height="5.5" rx="1" fill="none" stroke="currentColor" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" /></svg>}
    </span>
  );
}
const DiffChip = ({ f }: { f: DiffFlag }) => (
  <span className={`diff diff--${DIFF[f].cls}`}><span className="g" aria-hidden="true">{DIFF[f].g}</span>{DIFF[f].label}</span>
);

function Cue({ c }: { c: UnitChoreography }) {
  const lt = LAYER_TIER[c.layer_source];
  const ti = TIMINGS.indexOf(c.timing);
  return (
    <div className={`cue cue--${c.confidence} cue--src-${lt.cls}`}>
      <CueIcon code={c.cue_code} />
      <span className="cue__name">{cueName(c.cue_code)}{c.step_count ? ` ×${c.step_count}` : ""}</span>
      <span className="cue__meta">
        <span className="src">{lt.tier}</span><span className="conf">{c.confidence}</span><span className="obl">{c.obligation_tag}</span>
      </span>
      <span className="timing" role="img" aria-label={`Timing: ${TIMING_LABEL[c.timing]}`}>
        {TIMINGS.map((t, i) => <i key={t} className={i === ti ? "on" : ""} />)}
      </span>
      {c.direction && (
        <span className="dir-note">
          {c.direction.kind === "toward" ? `toward ${c.direction.target}${c.direction.resolve ? ` · ${c.direction.resolve.replace(/_/g, " ")}` : ""}` : `bearing ${c.direction.bearing_deg}°`}
        </span>
      )}
    </div>
  );
}

/** Conflict group: expands/collapses, never dismissible, sides in stable data order at equal weight. */
function Conflict({ group, open }: { group: string; open: boolean }) {
  const sides = conflicts.get(group)!;
  return (
    <details className="conflict" open={open}>
      <summary>Unresolved — {sides.length} readings <span className="cg">{group}</span></summary>
      <div className="conflict__body">
        {sides.map((c) => <Cue key={c.id} c={c} />)}
        <p className="conflict__note">never_silent_resolve: true. All readings stand; none is preferred.</p>
      </div>
    </details>
  );
}

function RailCell({ cues, compact }: { cues: UnitChoreography[]; compact: boolean }) {
  const shown = new Set<string>();
  return (
    <div className="rail" aria-label="Choreography for this alignment">
      {cues.length === 0 && <p className="rail--empty">No cue recorded.</p>}
      {cues.map((c) => {
        if (c.conflict_group) {
          if (shown.has(c.conflict_group)) return null;
          shown.add(c.conflict_group);
          return <Conflict key={c.conflict_group} group={c.conflict_group} open={!compact} />;
        }
        return <Cue key={c.id} c={c} />;
      })}
    </div>
  );
}

function UnitBody({ u, tl, sys, incipit, idx }: { u: BaseUnit; tl: boolean; sys: string; incipit?: boolean; idx: number }) {
  return (
    <>
      {incipit && (
        <div className="incipit"><span className="word" lang="he" dir="rtl">לוֹרֶם</span><span className="note">Section opening: initial-<em>word</em> panel</span></div>
      )}
      <div className="unit-meta">
        <span className="uid">{u.id}</span><span className="label">{u.text}</span>
        {u.status.map((s) => <span key={s} className="tag">{s}</span>)}
        {u.requires_minyan && <span className="tag tag--minyan">requires minyan</span>}
      </div>
      <div className="il-stack">
        <p className="he" lang="he" dir="rtl">{LOREM_HE[idx % LOREM_HE.length]}</p>
        {tl && <p className="tl" lang="he-Latn" dir="ltr">lorem ipsum {engine.transliterate(DEMO_PLACEHOLDER, sys)}</p>}
        <p className="en" lang="en">Lorem ipsum dolor sit amet — placeholder translation line, no liturgical content.</p>
      </div>
    </>
  );
}

export function App() {
  const [cols, setCols] = usePersisted<ColId[]>("cols", ["italki", "romaniote", "arizal", "chabad"]);
  const [hidden, setHidden] = usePersisted<ColId[]>("hidden", []);
  const [view, setView] = usePersisted<View>("view", "study");
  const [translit, setTranslit] = usePersisted<string>("translit", engine.defaultSystem().id);
  const [theme, setTheme] = usePersisted<Theme>("theme", "auto");
  const [nowIdx, setNowIdx] = useState(0);
  const [status, setStatus] = useState("");
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 46rem)").matches);

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = theme; r.dataset.view = view; r.dataset.translit = translit === "off" ? "off" : translit;
  }, [theme, view, translit]);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 46rem)"); const f = () => setNarrow(m.matches);
    m.addEventListener("change", f); return () => m.removeEventListener("change", f);
  }, []);

  useEffect(() => {
    const f = new URLSearchParams(location.search).get("focus");
    if (f) document.querySelector(`[data-alignment="${f}"]`)?.scrollIntoView({ block: "start" });
  }, []);
  const rows = useMemo(() => mergeForPrint(seed.alignments, unitIndex), []);
  const visible = cols.filter((c) => !hidden.includes(c));
  const tl = translit !== "off";
  const sys = tl ? translit : engine.defaultSystem().id;
  const cuesFor = (r: MergedRow) => seed.choreography.filter((c) => c.unit_id === r.alignment.italki_id || c.unit_id === r.alignment.romaniote_id);
  const allCues = rows.flatMap(cuesFor);
  const sectionStarts = new Set<string>();
  const firstOfSection = (u?: BaseUnit) => { if (!u || sectionStarts.has(u.section)) return false; sectionStarts.add(u.section); return true; };

  const move = (i: number, d: number) => {
    const c = [...cols]; const j = i + d; if (j < 0 || j >= c.length) return;
    [c[i], c[j]] = [c[j], c[i]]; setCols(c); setStatus(`${COLS[c[j]].name} column moved to position ${j + 1}.`);
  };
  const toggle = (c: ColId) => {
    const h = hidden.includes(c) ? hidden.filter((x) => x !== c) : [...hidden, c];
    setHidden(h); setStatus(`${4 - h.length} layers shown.`);
  };
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setCols([...p.cols, ...(Object.keys(COLS) as ColId[]).filter((c) => !p.cols.includes(c))]);
    setHidden((Object.keys(COLS) as ColId[]).filter((c) => !p.cols.includes(c)));
    setStatus(`Preset ${p.name}: ${p.cols.length} layers shown.`);
  };
  const activePreset = PRESETS.find((p) => p.cols.join() === visible.join())?.id;

  const cell = (c: ColId, r: MergedRow, idx: number) => {
    const meta = COLS[c];
    const head = <span className="cell-head-m"><Badge tier={meta.tier} name={meta.name} cls={meta.cls} lock={c === "chabad"} /></span>;
    let body: JSX.Element;
    if (c === "italki") {
      body = r.italki ? <><UnitBody u={r.italki} tl={tl} sys={sys} idx={idx} incipit={firstOfSection(r.italki)} />
        {r.alignment.diff_flags.includes("italki_only") && <div className="chips"><DiffChip f="italki_only" /></div>}</>
        : <p className="absent">No Italki unit at this point. The Romaniote rite has a unit here that the L1 floor does not; nothing has been dropped.</p>;
    } else if (c === "romaniote") {
      const chips = r.alignment.diff_flags.filter((f) => f !== "italki_only");
      body = r.kind === "combined"
        ? <><p className="combined-note">Combined with L1: the Romaniote parallel <span className="uid">{r.romaniote?.id}</span> is identical, so print merges it into one row.</p><div className="chips"><DiffChip f="identical" /></div></>
        : r.romaniote ? <><UnitBody u={r.romaniote} tl={tl} sys={sys} idx={idx + 1} /><div className="chips">{chips.map((f) => <DiffChip key={f} f={f} />)}</div></>
        : <p className="absent">No Romaniote parallel. This unit exists only in the Italki rite.</p>;
    } else if (c === "arizal") {
      const o = seed.overlay_links.filter((l) => l.target_unit_id === r.alignment.italki_id);
      body = o.length ? <>{o.map((l) => (
        <div key={l.id} className="overlay-item">
          <div className="unit-meta"><span className="uid">{l.id}</span><span className="tag">{l.type.replace(/_/g, " ")}</span><span className="disclosure" title={overlay.disclosure}>disclosure: source_ref pending</span></div>
          <p className="gloss" lang="he" dir="rtl">{LOREM_GLOSS}</p>
          <p className="label">{l.label}</p>
        </div>))}</> : <p className="absent">No Arizal overlay on this unit.</p>;
    } else {
      body = comparator.license_status === "link_out_only"
        ? <div className="linkout"><p className="why">Licensed text is not reproduced here.</p><a href={comparator.link_out_url ?? "#"}>Open at source ↗</a></div>
        : comparator.license_status === "pending"
        ? <p className="absent">Comparator licence uncleared (status: pending). No text is reproduced.</p>
        : <p className="label">PLACEHOLDER comparator text</p>;
    }
    return <div key={c} className={`cell cell--chan c-${meta.cls}`}>{head}{body}</div>;
  };

  const nowCue = allCues[nowIdx]; const nextCue = allCues[nowIdx + 1];

  return (
    <div className="app">
      <a className="skip" href="#reader">Skip to reader</a>
      <header className="masthead">
        <div className="wordmark">
          <svg className="vine" viewBox="0 0 40 40" aria-hidden="true"><path d="M1 1h13M1 1v13" /><path d="M2 2C12 6 16 13 13 21" /><path d="M13 21c-5-1-7-5-4-8 3-2 6 1 4 8Z" /><path d="M8 10c4-4 9-3 11 2" /></svg>
          <div><h1>Illuminated Siddur</h1><p className="sub">Layered study edition — Italki · Romaniote · Arizal <span className="tag">alpha 0.2.0</span></p></div>
        </div>
      </header>
      <p className="notice" role="note"><strong>Placeholder content only.</strong> Hebrew runs are lorem ipsum in Hebrew script; no liturgical text, translation or transliteration appears in this build.</p>

      <section className="controls" aria-label="Reader controls">
        <div className="ctl"><span className="lbl" id="lbl-view">View</span>
          <div className="seg" role="radiogroup" aria-labelledby="lbl-view">
            {(["study", "interlinear"] as View[]).map((v) => (
              <span key={v} style={{ display: "contents" }}><input type="radio" id={`view-${v}`} name="view" checked={view === v} onChange={() => setView(v)} /><label htmlFor={`view-${v}`}>{v === "study" ? "Study columns" : "Interlinear (line)"}</label></span>))}
          </div>
        </div>

        <div className="ctl"><fieldset><legend className="lbl">Layers</legend>
          <div className="col-list">
            {cols.map((c, i) => (
              <span key={c} className="col-item" style={{ ["--chan" as string]: `var(--${COLS[c].cls})` }}>
                <span className="layer-tog"><input type="checkbox" id={`col-${c}`} checked={!hidden.includes(c)} onChange={() => toggle(c)} />
                  <label htmlFor={`col-${c}`}><span className="tier">{COLS[c].tier}</span>{COLS[c].name}</label></span>
                <button className="nudge" aria-label={`Move ${COLS[c].name} column left`} onClick={() => move(i, -1)} disabled={i === 0}>◂</button>
                <button className="nudge" aria-label={`Move ${COLS[c].name} column right`} onClick={() => move(i, 1)} disabled={i === cols.length - 1}>▸</button>
              </span>))}
          </div></fieldset>
          <div className="presets" role="group" aria-label="Column presets">
            {PRESETS.map((p) => <button key={p.id} aria-pressed={activePreset === p.id} onClick={() => applyPreset(p)}>{p.name}</button>)}
          </div>
        </div>

        <div className="ctl"><span className="lbl" id="lbl-tl">Transliteration</span>
          <div className="opts">
            <div className="seg" role="radiogroup" aria-labelledby="lbl-tl">
              {[{ id: "off", name: "Off" }, ...engine.list().map((s) => ({ id: s.id, name: s.name.replace(" (optional)", "") }))].map((s) => (
                <span key={s.id} style={{ display: "contents" }}><input type="radio" id={`tl-${s.id}`} name="translit" checked={translit === s.id}
                  onChange={() => { setTranslit(s.id); setStatus(`Transliteration: ${s.name}.`); }} /><label htmlFor={`tl-${s.id}`}>{s.name}</label></span>))}
            </div>
            <span className="chip-stub">stub tables</span>
          </div>
          <div className="tl-preview">
            {translit === "modern_sephardi" ? <dl><dt>he-Latn</dt><dd lang="he-Latn">{SEPHARDI_SAMPLE.join(" · ")}</dd></dl>
              : translit === "off" ? <p className="unavailable">Off: only Hebrew and translation rows render.</p>
              : <p className="unavailable">Preview withheld in this placeholder build.</p>}
          </div>
        </div>

        <div className="ctl"><span className="lbl" id="lbl-theme">Theme</span>
          <div className="seg" role="radiogroup" aria-labelledby="lbl-theme">
            {(["auto", "light", "dark"] as Theme[]).map((t) => (
              <span key={t} style={{ display: "contents" }}><input type="radio" id={`theme-${t}`} name="theme" checked={theme === t} onChange={() => setTheme(t)} /><label htmlFor={`theme-${t}`}>{t === "auto" ? "Auto" : t === "light" ? "Parchment" : "Lamplight"}</label></span>))}
          </div>
        </div>
      </section>
      <div className="vh" aria-live="polite">{status}</div>

      <main id="reader" className="reader-wrap">
        {view === "study" ? (
          <div className="reader view-study">
            <div className="row row--head">
              <div className="cells">{visible.map((c) => (
                <div key={c} className="colhead"><Badge tier={COLS[c].tier} name={COLS[c].name} cls={COLS[c].cls} lock={c === "chabad"} />
                  {c === "chabad" && <span className="tag">{comparator.license_status}</span>}
                  {c === "arizal" && <span className="disclosure" title={overlay.disclosure}>disclosed overlay</span>}</div>))}</div>
              <div className="rail rail--head"><CueIcon code="bow" className="cue-icon" /><h3>Choreography</h3></div>
            </div>
            {rows.map((r, idx) => (
              <div key={r.alignment.id} data-alignment={r.alignment.id} className="row" role="group" aria-label={`Alignment ${r.alignment.id}: ${r.alignment.diff_flags.map((f) => DIFF[f].label).join(", ")}`}>
                <div className="cells">{visible.map((c) => cell(c, r, idx))}</div>
                <RailCell cues={cuesFor(r)} compact={narrow} />
              </div>))}
          </div>
        ) : (
          <div className="il-list view-interlinear">
            <p className="flag-note">Line mode. Token mode is deferred: the schema aligns units, not words (DESIGN A21.2).</p>
            {rows.map((r, idx) => {
              const sides = [visible.includes("italki") && r.italki ? { u: r.italki, k: "l1", t: "L1", n: "Italki" } : null,
                visible.includes("romaniote") && r.romaniote && r.kind !== "combined" ? { u: r.romaniote, k: "l3", t: "L3", n: "Romaniote" } : null].filter(Boolean) as { u: BaseUnit; k: string; t: string; n: string }[];
              const cues = cuesFor(r);
              return (
                <section key={r.alignment.id} data-alignment={r.alignment.id} className="il-section" role="group" aria-label={`Alignment ${r.alignment.id}`}>
                  {sides.map((s, i) => (
                    <article key={s.u.id} className={`il-unit il-unit--${s.k}`}>
                      <div className="il-head"><Badge tier={s.t} name={s.n} cls={s.k} /><span className="uid">{s.u.id}</span>
                        {r.kind === "combined" && <DiffChip f="identical" />}
                        {i === sides.length - 1 && r.kind !== "combined" && r.alignment.diff_flags.map((f) => <DiffChip key={f} f={f} />)}</div>
                      <div className="il-body">
                        <div className="il-stack">
                          <p className="he" lang="he" dir="rtl">{LOREM_HE[(idx + i) % LOREM_HE.length]}</p>
                          {tl && <p className="tl" lang="he-Latn" dir="ltr">lorem ipsum {engine.transliterate(DEMO_PLACEHOLDER, sys)}</p>}
                          <p className="en" lang="en">Lorem ipsum dolor sit amet — placeholder translation line.</p>
                        </div>
                      </div>
                    </article>))}
                  {cues.length > 0 && <RailCell cues={cues} compact={narrow} />}
                </section>);
            })}
          </div>
        )}
      </main>

      {nowCue && (
        <div className="nowbar nowbar--app" role="region" aria-label="Current cue">
          <button aria-label="Previous cue" onClick={() => setNowIdx(Math.max(0, nowIdx - 1))}>◂</button>
          <span className="now-cue"><CueIcon code={nowCue.cue_code} className="cue-icon" />Now: {cueName(nowCue.cue_code)} <span className="uid">{nowCue.unit_id}</span></span>
          <span className="next">Next{nextCue ? <b>{cueName(nextCue.cue_code)}</b> : <b>—</b>}</span>
          <button aria-label="Next cue" onClick={() => setNowIdx(Math.min(allCues.length - 1, nowIdx + 1))}>▸</button>
        </div>)}
    </div>
  );
}
