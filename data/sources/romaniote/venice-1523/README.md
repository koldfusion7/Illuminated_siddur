# Romaniote weekday Shacharit — Venice 1523 print (Kaufmann B 605)

Source: *Mahzor Romania*, Venice 1523, copy Kaufmann B 605, Library and Information
Centre of the Hungarian Academy of Sciences (MTAK), Budapest. Coverage: fol. 5b–19a
(weekday Shacharit), 28 pages.

**Status — read before use**

- Exact transcription of the 1523 print. Nothing is corrected, normalized, or filled in from other siddurim or from memory.
- **Consonants + the print's own punctuation only** (`:` sof pasuq, `·` stop). **No vowel points yet**, although the print is vocalized.
- `[?]` = uncertain reading. `|` = printed column/cell break. Print abbreviations (e.g. `יי`) kept as printed.
- Handwritten interlinear/margin notes are **not** in the text; they are logged separately as `marginalia_regions` in the provenance JSON.
- **Editorial layout decisions are pending** (reading order of tables/short rows, placement of side-column inserts). The text follows the printed layout.
- **Not to be used liturgically yet.**
- No page images are published here.

## Layout

- `text/folNNx_spreadNN_side.txt` — corrected consonantal text per page (UTF-8).
- `provenance/*.json` — folio, printed folio number, catchword, signature, uncertain spans, marginalia regions, OCR engine/model, OCR error rates against the proofed text.
- `index.json` — page list with uncertain-word counts.
- `CHANGES.md` — revisions made in the re-check pass.
- `tools/pipeline.py` — OCR pipeline: mask margin notes → deskew → Kraken (blla + BiblIA_01, doi:10.5281/zenodo.5468286) → baseline-row reading order → CER/WER vs. a reference. Set `KRAKEN_BIN` / `KRAKEN_MODEL`.

OCR output is only a draft; every page was proofed line by line against the page image.
