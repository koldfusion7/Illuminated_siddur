# Romaniote siddur — Venice 1523 print (Kaufmann B 605)

Source: *Mahzor Romania*, Venice 1523, copy Kaufmann B 605, Library and Information
Centre of the Hungarian Academy of Sciences (MTAK), Budapest. Text coverage: fol.
5b-37a, 39b-93a and 95b-117b, 217 page sides. The original 28 weekday Shacharit
pages (5b-19a) are followed by OCR sweeps 2 and 3 (116 additional sides) and sweep 4
(73 additional sides). Fol. 37b-39a and 93b-95a are intentional gaps: chunks c10
and c38 were not supplied. Sweep 4 also indexes 118a, 118b and 119a as unproofed
metadata-only entries; no corrected text was supplied for those sides.

**Status — read before use**

- Supplied readings of the 1523 print are preserved without normalization or completion from other siddurim or from memory.
- **Consonantal text with the supplied print punctuation** (including `:`, `·`, `˙`, and `׃`). **No vowel points yet**, although the print is vocalized. Supplied punctuation and Divine-name forms are retained without normalization.
- `[?]` = uncertain reading. `|` = printed column/cell break. Print abbreviations (e.g. `יי`) kept as printed.
- Handwritten interlinear/margin notes are **not** in the text; where supplied, they are logged separately as `marginalia_regions` in the provenance JSON.
- **Editorial layout decisions are pending** (reading order of tables/short rows, placement of side-column inserts). The text follows the printed layout.
- **Not to be used liturgically yet.**
- No page images are published here.

## Layout

- `text/folNNx_spreadNN_side.txt` — corrected consonantal text per page (UTF-8).
- `provenance/*.json` — folio, exact-text checksum, uncertain spans and supplied OCR error rates against the proofed text; printed folio number, catchword, signature, marginalia regions and OCR engine/model where supplied.
- `index.json` — page list with uncertain-word counts and per-leaf sweep-4 proofing status. Metadata-only entries have `file: null` and `text_available: false`.
- `CHANGES.md` — revisions made in the re-check pass and OCR sweeps 2, 3 and 4.
- `tools/pipeline.py` — OCR pipeline: mask margin notes → deskew → Kraken (blla + BiblIA_01, doi:10.5281/zenodo.5468286) → baseline-row reading order → CER/WER vs. a reference. Set `KRAKEN_BIN` / `KRAKEN_MODEL`.

OCR output is a draft. The original pages were proofed against the page image;
the later sweeps retain the supplied proofing status and editorial markers. The
embedded Rashi-type blocks on 33a, 46a, 47a, 49b and 62a are explicitly marked
**UNPROOFED** and are excluded from the supplied error rates. The separate unproofed
rubric for 55a is omitted from the corrected page text. The one-line rubric on 59a
is proofed at low confidence and excluded from the supplied error rates.

Each added page has matching provenance with exact-text SHA-256, line records,
uncertain spans and supplied OCR error rates. Current index uncertainty counts are
derived from the literal `[?]` marks in the text; supplied error-rate measurements
are retained and were not recomputed after the fixes. Where both `c01` and
`chunk01` cover 19b–21a, the rechecked `chunk01` text is used, with both initial and
recheck measurements retained in provenance. Printed folio labels may differ from
sequential leaf labels; both are kept where supplied.

Sweep 4 adds 76 leaf records: 58 `proofed`, 14 `partial` and 4 `unproofed`.
`partial` means that only part of the page is proofed, including pages whose
separate unproofed note or rubric is omitted. `unproofed` includes the entirely
unproofed Rashi-type side 108b and the three metadata-only sides 118a-119a.
All supplied UNPROOFED and [RASHI-UNPROOFED] markers remain unchanged in the text.
Rashi-type notes and rubrics await expert proofreading. Separate unproofed OCR
notes for 88b, 100a, 100b and 101a are omitted from the corrected text and logged
in the corresponding provenance notes, as for the earlier separate 55a rubric.
The full c47 files are used; their duplicate `_body` variants are omitted.
The c47 measurement scopes mark Rashi-type rubrics unproofed on all four sides,
so 111b, 112a, 112b and 113a are conservatively flagged `partial`.
The c49 sides need re-checking at full resolution. Supplied CER/WER values are
retained without recomputation and are approximate for partly proofed sides.
