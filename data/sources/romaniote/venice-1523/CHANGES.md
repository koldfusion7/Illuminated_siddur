# Re-check changes (deskew + baseline ordering pass)

Proofed text changed after re-checking against the page image:

- **11a**: `עשתנותיו[?]` → `עשתונותיו` (reading confirmed; `[?]` removed).
- **13a**: `קים`-forms are printed with double yod: `וקים`→`וקיים`, `קים`→`קיים` (×2), `קימת`→`קיימת`, `וקימים`→`וקיימים`, `וקים`→`וקיים` (6 words).

Error rates before/after for re-checked pages (6a, 8a, 11a, 12a, 13a, 13b, 14a) are in each page's provenance JSON. 13b (interlinear handwriting) and 14a (side columns) need full hand proofing.

## OCR sweeps 2 and 3 - 2026-10-29

- Added 116 page sides: 36 from leaves 19b-37a and 80 from leaves 39b-79a, bringing the collection from 28 to 144 page sides. Leaves 37b-39a remain absent because c10 is intentionally absent from the supplied bundle.
- Used the rechecked chunk01 text for the c01 overlap at 19b-21a, retaining the initial c01 error-rate measurements as such. These pages do not overlap the original 28 page sides.
- Corrected the c07 leaf sequence to 31b, 32a, 32b, 33a. Corrected printed folio headers in c03 (24a and 25a) and c16 (50a and 51a). Preserved the c08 discrepancy between the printed folio number and leaf 35a in the sequence; its text contains no folio header.
- Applied the supplied selective divine-name corrections in c11, c12, and c14. Retained the verified alternative forms within c11 and c12 and the unchanged forms in c01-c09 and chunk01; no global substitution was made.
- Incorporated the c20 and c22 word-reading, punctuation, and uncertainty-marker corrections. These include colon readings in c20, printed dot separators in c22, removal of a duplicate heading and confirmation of the following heading on 62a, and reordering of the 62a verse rows to follow the printed two-column layout.
- Preserved the selected corrected page text and annotation markers byte for byte, including the explicitly marked UNPROOFED blocks on 33a, 46a, 47a, 49b, and 62a. These blocks remain unproofed. The separate unproofed c18 rubric was excluded from the proofed 55a text. The one-line rubric on 59a is proofed with low confidence and is excluded from the supplied error-rate measurements.

## OCR sweep 4 - 2026-10-29

# Venice 1523 Romaniote OCR, sweep 4 (chunks c31-c50, leaves 79b-119a)

Exact diplomatic transcription. Divine name kept as printed; abbreviations not expanded; ˙ separators kept.
Lines or sides marked UNPROOFED or [RASHI-UNPROOFED] are raw OCR and must not be treated as proofed text.
CER/WER values for partly proofed sides are approximate.

Not included: c38 (leaves 93b-95a, parked) and c51 (leaves 119b-121a, raw OCR only).

Partly proofed chunks:
- c45: 107b proofed; square type of 108a and 109a proofed; 108b and the Rashi-type rubrics unproofed.
- c47: main text proofed; Rashi-type rubrics on 111b and 112a unproofed.
- c48: 113b and 114a proofed; 114b square type only; 115a partly proofed at reduced resolution (UNPROOFED).
- c49: proofed but not strictly at full resolution (needs re-check); 116a rubric and last line of 117a unproofed.
- c50: 117b proofed; 118a, 118b, 119a UNPROOFED.

Open editorial questions: reading order of multi-column pages (transcribed row by row, right then left);
running headings; whether some margin cues are print or handwriting; dalet/resh in divine name and ארון/אדון readings.
Rashi-type notes and rubrics need an expert proofreader.

### Import coverage and proofing flags

- Added 73 byte-exact corrected page texts and 76 matching leaf provenance records. The index now contains 220 records, including the three metadata-only leaves; 217 records have text.
- The supplied c50 metadata marks 118a, 118b and 119a UNPROOFED, but their corrected text files are absent. These leaves have null text paths and checksums; no text was reconstructed. The last supplied transcription is 117b.
- New leaf statuses: 58 proofed, 14 partial and 4 unproofed. Leaf 108b is entirely unproofed according to its supplied metadata, even though its text contains no UNPROOFED label. Pages with UNPROOFED or [RASHI-UNPROOFED] markers remain partial or unproofed.
- All four c47 sides are flagged partial because their individual measurement scopes leave Rashi-type rubrics unproofed. The full corrected files are used instead of the duplicate _body variants.
- Separate unproofed note or rubric OCR for 88b, 100a, 100b and 101a is omitted from corrected page text, following the earlier separate-rubric convention. References and proofing labels in the selected page texts remain byte-exact, and the omissions are recorded in provenance.
- Rashi-type text awaits expert proofreading. Supplied error rates are preserved without recomputation; partly proofed measurements are approximate.
