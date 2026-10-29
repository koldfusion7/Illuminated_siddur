#!/usr/bin/env python3
"""Map fetched PD/open-licensed sources into the app schema -> src/seed/sources.json.
Rules: never blend rites; never edit wording. `text` is the source fragment exactly as served,
after Unicode NFC only. `text_display` is a mechanical derivation (rules in NORMALIZATION) used
for rendering; `source_sha256` hashes the raw served string, `text_sha256` hashes `text`."""
import json, re, html, hashlib, unicodedata, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "sources" / "raw"
sha = lambda s: hashlib.sha256(s.encode("utf-8")).hexdigest()
NORMALIZATION = [
  {"id": "N1", "applies_to": "text", "rule": "Unicode NFC normalization of the served string. No other change to `text`."},
  {"id": "N2", "applies_to": "text_display", "rule": "<br>, <br />, </p> become line breaks; HTML entities decoded."},
  {"id": "N3", "applies_to": "text_display", "rule": "Presentational tags (<b>, <small>, <big>, <p>, <span>) removed, inner text kept."},
  {"id": "N4", "applies_to": "text_display", "rule": "Open Siddur editorial elements removed from display: <span class=\"citation\"> (transcriber-added scripture citations), <span class=\"instruction\">, footnote markers/tooltips, <script>. They remain in `text`."},
  {"id": "N5", "applies_to": "text_display", "rule": "Leading/trailing whitespace trimmed per line; empty lines dropped."},
]
def display(s):
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S)
    s = re.sub(r'<span class="footnote_referrer">.*?</sup>\s*(</a>)?\s*(</span>)?', "", s, flags=re.S)
    s = re.sub(r'<span id="footnote_plugin_tooltip_text[^"]*" class="footnote_tooltip">.*?</span>', "", s, flags=re.S)
    s = re.sub(r'<span class="(citation|instruction)">.*?</span>', "", s, flags=re.S)
    s = re.sub(r"<br\s*/?>|</p>", "\n", s)
    s = html.unescape(re.sub(r"<[^>]+>", "", s))
    return "\n".join(l.strip() for l in s.split("\n") if l.strip())
def slug(s): return re.sub(r"_+", "_", re.sub(r"[^A-Z]", "_", s.upper())).strip("_")[:40] or "X"
def unit(uid, corpus, section, order, label, raw, prov, status=("core_fixed",)):
    t = unicodedata.normalize("NFC", raw)
    return {"id": uid, "corpus_id": corpus, "service": "shacharit", "section": section, "order": order, "label": label,
            "text": t, "text_display": unicodedata.normalize("NFC", display(raw)), "lang": "he", "status": list(status),
            "requires_minyan": False, "transliteration": None, "gloss": None,
            "provenance": {**prov, "source_sha256": sha(raw), "text_sha256": sha(t), "normalization": ["N1", "N2", "N3", "N4", "N5"]}}
out = {"normalization_log": NORMALIZATION, "corpora": [], "units": [], "comparators": [], "comparator_units": []}
# --- L1 Italki from Open Siddur (CC BY-SA 4.0) ---
os_items = json.loads((RAW / "opensiddur.json").read_text())
order = 1000
counters = {}
for it in os_items:
    assert it["license"] and "CC BY-SA" in it["license"], it["slug"]
    for i, frag in enumerate(re.findall(r'<div class="liturgy" lang="heb-Hebr"[^>]*>(.*?)</div>', it["html"], flags=re.S), 1):
        sec = it["section"]; counters[sec] = counters.get(sec, 0) + 1
        prov = {"source_title": it["title"], "source_url": it["link"], "source_fragment": f"div.liturgy[lang=heb-Hebr] #{i}",
                "publisher": "Open Siddur Project", "witness": it["witness"], "license": "CC-BY-SA-4.0",
                "license_evidence_url": it["link"], "license_url": it["license_url"], "retrieved": it["retrieved"]}
        order += 1
        out["units"].append(unit(f"ITK.SHA.{sec}.{counters[sec]*10+100:03d}", it["corpus"], sec, order, f"{it['title'].split('|')[-1].strip()} [{i}]", frag, prov))
# --- comparators from Sefaria ---
CMP = [("Siddur_Ashkenaz", "Siddur Ashkenaz", "The Metsudah siddur, 1981", "ASH", "CMP.ASHKENAZ", "Ashkenaz", "Weekday, Shacharit, ", "cc_by"),
       ("Siddur_Sefard", "Siddur Sefard", "The Metsudah siddur, 1981", "SEF", "CMP.SEFARD", "Sefard (Hasidic)", "Weekday Shacharit, ", "cc_by"),
       ("Siddur_Edot_HaMizrach", "Siddur Edot HaMizrach", "Torat Emet 357", "EHM", "CMP.EDOT_HAMIZRACH", "Edot haMizrach (Sephardi)", "Weekday Shacharit, ", "public_domain")]
def flat(x):
    if isinstance(x, list):
        for y in x: yield from flat(y)
    elif isinstance(x, str) and x.strip(): yield x
for fn, book, vt, pre, cid, nusach, prefix, ls in CMP:
    recs = [r for r in json.loads((RAW / f"{fn}.weekday_shacharit.json").read_text()) if r["versionTitle"].strip() == vt]
    lic = recs[0]["license"]
    out["comparators"].append({"id": cid, "layer": "comparator", "name": f"{nusach} — Sefaria: {book} ({vt})", "nusach": nusach,
        "license_status": ls, "license": lic, "license_evidence_url": f"https://www.sefaria.org/api/texts/versions/{fn}",
        "version_source": recs[0]["versionSource"], "read_only": True})
    secs, o = {}, 0
    for r in recs:
        leaf = r["ref"][len(book) + 2 + len(prefix):]
        base = slug(leaf); s, k = base, 1
        while s in secs and secs[s] != leaf: k += 1; s = f"{base}_{chr(64 + k)}"
        secs[s] = leaf
        for j, seg in enumerate(flat(r["text"]), 1):
            o += 1
            prov = {"source_title": f"Sefaria: {r['ref']}", "source_url": "https://www.sefaria.org/" + r["ref"].replace(" ", "_").replace(",", "%2C") + "?ven=" + vt.replace(" ", "_"),
                    "source_fragment": f"segment {j}", "publisher": "Sefaria", "witness": f"{vt} ({r['versionSource']})",
                    "license": lic, "license_evidence_url": f"https://www.sefaria.org/api/texts/versions/{fn}", "retrieved": r["retrieved"]}
            u = unit(f"{pre}.SHA.{s}.{j:03d}", cid, s, o, f"{leaf} [{j}]", seg, prov)
            out["comparator_units"].append(u)
ids = [u["id"] for u in out["units"] + out["comparator_units"]]
assert len(ids) == len(set(ids)), "duplicate ids"
cu = out.pop("comparator_units")
pub = ROOT / "public" / "data" / "comparators"; pub.mkdir(parents=True, exist_ok=True)
for c in out["comparators"]:
    us = [u for u in cu if u["corpus_id"] == c["id"]]
    c["unit_count"] = len(us); c["data_url"] = f"data/comparators/{c['id']}.json"
    (pub / f"{c['id']}.json").write_text(json.dumps(us, ensure_ascii=False))
(ROOT / "src" / "seed" / "sources.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
out["comparator_units"] = cu
import collections; print(len(out["units"]), collections.Counter(u["corpus_id"] for u in out["comparator_units"]))
