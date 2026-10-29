# Source texts and licenses

All real Hebrew in this repository comes from public-domain or openly licensed digital sources and is reproduced verbatim (Unicode NFC). Every unit carries its own provenance, license and sha256 checksum. See `src/seed/sources.json` (`normalization_log`) for the exact display rules.

| Corpus | Source | License | Units |
|---|---|---|---|
| Italki (L1) | Open Siddur Project, transcriptions by Aharon Varady of David Prato, *Tefilah l'David: Preghiere di Rito Italiano* (Rome 1949): [Birkhot ha-Shaḥar protection prayers](https://opensiddur.org/prayers/solilunar/everyday/daytime/birkhot-hashahar/face-washing/prophylactic-prayers-of-protection-following-the-birkhot-hashahar-in-the-italian-rite/), [Torah-study blessings and passages](https://opensiddur.org/prayers/praxes/study/blessings-and-passages-for-torah-study-justifying-prayer-in-place-of-sacrificial-offerings-in-the-italian-rite/) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 36 |
| Romaniote (L3) | — none available yet (placeholders) | — | 0 |
| Comparator: Ashkenaz | [Sefaria](https://www.sefaria.org/Siddur_Ashkenaz), "The Metsudah siddur, 1981" | CC-BY (per Sefaria) | 583 |
| Comparator: Sefard | [Sefaria](https://www.sefaria.org/Siddur_Sefard), "The Metsudah siddur, 1981" | CC-BY (per Sefaria) | 553 |
| Comparator: Edot haMizrach | [Sefaria](https://www.sefaria.org/Siddur_Edot_HaMizrach), "Torat Emet 357" | Public Domain | 367 |

Derived material that includes the Italki text is shared under CC BY-SA 4.0 as that license requires.
Re-run: `python3 scripts/fetch-sefaria.py && python3 scripts/fetch-opensiddur.py && python3 scripts/import-sources.py`.
