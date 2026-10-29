#!/usr/bin/env python3
"""Fetch Hebrew weekday-Shacharit text from Sefaria, keeping ONLY versions whose
Sefaria license field is Public Domain / CC0 / CC-BY / CC-BY-SA. Text is stored
exactly as served (raw JSON) alongside license + version metadata."""
import json, sys, time, urllib.request, urllib.parse, datetime, pathlib
OK = {"public domain", "cc0", "cc-by", "cc-by-sa"}
BOOKS = {"Siddur Ashkenaz": "Weekday, Shacharit", "Siddur Sefard": "Weekday Shacharit",
         "Siddur Edot HaMizrach": "Weekday Shacharit"}
OUT = pathlib.Path(__file__).resolve().parent.parent / "sources" / "raw"
OUT.mkdir(parents=True, exist_ok=True)
def get(u):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "illuminated-siddur-importer"}), timeout=60) as r:
                return json.load(r)
        except Exception as e:
            err = e
            if getattr(e, 'code', None) == 404: break
            time.sleep(2 + i * 3)
    raise err  # noqa
def name(x):
    for t in x.get("titles", []):
        if t.get("primary") and t["lang"] == "en": return t["text"]
    return x.get("key")
def leaves(n, p):
    if not n.get("nodes"): yield p; return
    for x in n["nodes"]: yield from leaves(x, p + [name(x)])
today = datetime.date.today().isoformat()
for book, prefix in BOOKS.items():
    idx = get("https://www.sefaria.org/api/index/" + urllib.parse.quote(book))
    refs = [", ".join(p) for p in leaves(idx["schema"], [book]) if ", ".join(p).startswith(book + ", " + prefix)]
    recs = []
    for ref in refs:
        try:
            d = get("https://www.sefaria.org/api/v3/texts/" + urllib.parse.quote(ref) + "?version=" + urllib.parse.quote("hebrew|all"))
        except Exception as e:
            print("SKIP", ref, e, file=sys.stderr); continue
        for v in d.get("versions", []):
            lic = (v.get("license") or "unknown").strip()
            if lic.lower() not in OK: continue
            recs.append({"ref": ref, "versionTitle": v["versionTitle"], "license": lic,
                         "versionSource": v.get("versionSource"), "text": v["text"], "retrieved": today,
                         "api_url": "https://www.sefaria.org/api/v3/texts/" + urllib.parse.quote(ref)})
        print(book, "|", ref, "|", [ (v["versionTitle"], v.get("license")) for v in d.get("versions", [])], file=sys.stderr)
        time.sleep(0.3)
    (OUT / (book.replace(" ", "_") + ".weekday_shacharit.json")).write_text(json.dumps(recs, ensure_ascii=False, indent=1))
