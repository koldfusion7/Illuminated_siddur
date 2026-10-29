#!/usr/bin/env python3
"""Fetch Open Siddur Project items (WordPress JSON) whose page states a CC license.
Stores the raw rendered HTML exactly as served, plus the license string found on the page."""
import json, re, urllib.request, datetime, pathlib
ITEMS = [  # (slug, corpus, section, underlying print)
  ("prophylactic-prayers-of-protection-following-the-birkhot-hashahar-in-the-italian-rite", "corpus.italki", "BIRKHOT",
   "David Prato (ed.), Tefilah l'David: Preghiere di Rito Italiano, Rome 1949, pp. 10-12"),
  ("blessings-and-passages-for-torah-study-justifying-prayer-in-place-of-sacrificial-offerings-in-the-italian-rite", "corpus.italki", "TALMUD_TORAH",
   "David Prato (ed.), Tefilah l'David: Preghiere di Rito Italiano, Rome 1949, pp. 12-25"),
]
OUT = pathlib.Path(__file__).resolve().parent.parent / "sources" / "raw"; OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "illuminated-siddur-importer"}
recs = []
for slug, corpus, section, witness in ITEMS:
    d = json.load(urllib.request.urlopen(urllib.request.Request("https://opensiddur.org/wp-json/wp/v2/posts?slug=" + slug, headers=UA), timeout=60))[0]
    page = urllib.request.urlopen(urllib.request.Request(d["link"], headers=UA), timeout=60).read().decode()
    m = re.search(r"under the (?:<a[^>]*>)?(Creative Commons [^<]*?\(CC [^)]*\) [0-9.]+ International)", page)
    lic = m.group(1) if m else None
    recs.append({"slug": slug, "corpus": corpus, "section": section, "witness": witness, "link": d["link"],
                 "title": re.sub(r"<[^>]+>", "", d["title"]["rendered"]), "license": lic,
                 "license_url": "https://creativecommons.org/licenses/by-sa/4.0/" if lic and "BY-SA" in lic else None,
                 "modified_gmt": d["modified_gmt"], "html": d["content"]["rendered"], "retrieved": datetime.date.today().isoformat()})
(OUT / "opensiddur.json").write_text(json.dumps(recs, ensure_ascii=False, indent=1))
print([(r["slug"][:40], r["license"]) for r in recs])
