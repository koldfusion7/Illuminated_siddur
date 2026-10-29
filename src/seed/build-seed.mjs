// Generates src/seed/shacharit.placeholder.json. Labels/IDs only; no liturgical text.
import { writeFileSync } from "fs";
const P = (rite, sec, n) => `PLACEHOLDER: ${rite} / Shacharit / ${sec} unit ${n}`;
const u = (pre, corpus, rite, sec, n, order, status = ["core_fixed"], minyan = false) => ({
  id: `${pre}.SHA.${sec}.${String(n * 10).padStart(3, "0")}`, corpus_id: corpus, service: "shacharit", section: sec, order,
  label: `${rite} ${sec} ${n}`, text: P(rite, sec, n), lang: "he", status, requires_minyan: minyan });
const I = (s, n, o, st, m) => u("ITK", "corpus.italki", "Italki L1", s, n, o, st, m);
const R = (s, n, o, st, m) => u("ROM", "corpus.romaniote", "Romaniote L3", s, n, o, st, m);
const units = [
  I("BIRKHOT",1,1), I("BIRKHOT",2,2,["minhag"]), I("PESUKEI",1,3), I("PESUKEI",2,4),
  I("SHEMA",1,5), I("SHEMA",2,6), I("AMIDAH",1,7), I("AMIDAH",2,8,["tzibbur"],true),
  I("TACHANUN",1,9,["calendar"]), I("ALEINU",1,10), I("ALEINU",2,11,["optional"]),
];
const parallel_units = [
  R("BIRKHOT",1,1), R("PESUKEI",2,2), R("PESUKEI",1,3), R("PESUKEI",3,4,["minhag"]),
  R("SHEMA",1,5), R("SHEMA",2,6), R("AMIDAH",1,7), R("AMIDAH",2,8,["tzibbur"],true),
  R("TACHANUN",1,9,["calendar"]), R("ALEINU",1,10),
].map((x) => ({ ...x }));
const A = (id, i, r, f, note) => ({ id, italki_id: i, romaniote_id: r, diff_flags: f, ...(note ? { note } : {}) });
const alignments = [
  A("AL.001","ITK.SHA.BIRKHOT.010","ROM.SHA.BIRKHOT.010",["identical"]),
  A("AL.002","ITK.SHA.BIRKHOT.020",null,["italki_only"]),
  A("AL.003","ITK.SHA.PESUKEI.010","ROM.SHA.PESUKEI.010",["divergent_order"],"Romaniote places this after PESUKEI 2"),
  A("AL.004","ITK.SHA.PESUKEI.020","ROM.SHA.PESUKEI.020",["divergent_order"]),
  A("AL.005",null,"ROM.SHA.PESUKEI.030",["romaniote_only"]),
  A("AL.006","ITK.SHA.SHEMA.010","ROM.SHA.SHEMA.010",["identical"]),
  A("AL.007","ITK.SHA.SHEMA.020","ROM.SHA.SHEMA.020",["near_identical"]),
  A("AL.008","ITK.SHA.AMIDAH.010","ROM.SHA.AMIDAH.010",["identical"]),
  A("AL.009","ITK.SHA.AMIDAH.020","ROM.SHA.AMIDAH.020",["divergent_text"]),
  A("AL.010","ITK.SHA.TACHANUN.010","ROM.SHA.TACHANUN.010",["divergent_text","divergent_order"]),
  A("AL.011","ITK.SHA.ALEINU.010","ROM.SHA.ALEINU.010",["identical"]),
  A("AL.012","ITK.SHA.ALEINU.020",null,["italki_only"]),
];
const overlay_layers = [{ id: "OVL.ARIZAL", layer: "L2_arizal", name: "Arizal overlays (disclosed)", disclosure: "Every L2 item is displayed as an overlay, never merged into the L1 floor." }];
const O = (id, t, type, label) => ({ id, overlay_layer_id: "OVL.ARIZAL", target_unit_id: t, type, label: `PLACEHOLDER: ${label}`, source_ref: "PLACEHOLDER source ref" });
const overlay_links = [
  O("OL.001","ITK.SHA.BIRKHOT.010","kavanah","Arizal kavanah on Birkhot 1"),
  O("OL.002","ITK.SHA.PESUKEI.020","addition","Arizal addition after Pesukei 2"),
  O("OL.003","ITK.SHA.SHEMA.010","gestural_rubric","Arizal gestural rubric on Shema 1"),
  O("OL.004","ITK.SHA.AMIDAH.020","wording_variant","Arizal wording variant on Amidah 2"),
  O("OL.005","ITK.SHA.TACHANUN.010","reordering","Arizal reordering of Tachanun"),
  O("OL.006","ITK.SHA.ALEINU.020","omission_flag","Arizal omission flag on Aleinu 2"),
];
const comparators = [{ id: "CMP.CHABAD", layer: "comparator_chabad", name: "Chabad comparator (read-only)", license_status: "pending", read_only: true }];
const C = (id, unit, cue, layer, timing, ob, conf, label, cg) => ({ id, unit_id: unit, cue_code: cue, layer_source: layer, timing, obligation_tag: ob, confidence: conf, label, ...(cg ? { conflict_group: cg } : {}), never_silent_resolve: true });
const choreography = [
  C("CH.001","ITK.SHA.PESUKEI.010","stand","L1_italki","start","custom","unknown","Stand (placeholder cue)"),
  C("CH.002","ITK.SHA.SHEMA.010","cover_eyes","L1_italki","during","required","inferred","Cover eyes for first verse only","CG.SHEMA.COVER_EYES"),
  C("CH.003","ITK.SHA.SHEMA.010","cover_eyes","L2_arizal","during","kabbalistic","attested","Cover eyes through the following line, right hand","CG.SHEMA.COVER_EYES"),
  C("CH.004","ROM.SHA.SHEMA.010","cover_eyes","L3_romaniote","during","custom","unknown","Romaniote practice unknown; field work needed","CG.SHEMA.COVER_EYES"),
  C("CH.005","ITK.SHA.AMIDAH.010","three_steps_forward","L1_italki","before","custom","attested","Three steps forward"),
  C("CH.006","ITK.SHA.AMIDAH.010","bow","L1_italki","start","required","attested","Bow at opening"),
  C("CH.007","ITK.SHA.AMIDAH.020","three_steps_back","L1_italki","end","custom","attested","Three steps back"),
  C("CH.008","ITK.SHA.ALEINU.010","bow","L1_italki","during","custom","inferred","Bow (placeholder cue)"),
];
const corpora = [
  { id: "corpus.italki", layer: "L1_italki", name: "Italki / Benei Roma (L1 floor)", direction: "rtl", witnesses: ["PLACEHOLDER witness"] },
  { id: "corpus.romaniote", layer: "L3_romaniote", name: "Romaniote (L3 parallel peer)", direction: "rtl", witnesses: ["PLACEHOLDER witness"] },
];
writeFileSync(new URL("./shacharit.placeholder.json", import.meta.url), JSON.stringify({ corpora, units, parallel_units, alignments, overlay_layers, overlay_links, comparators, choreography }, null, 2));
