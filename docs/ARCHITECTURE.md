# Illuminated Siddur: Architecture

> This repository holds **placeholder content only**. No liturgical text (Hebrew, English, translation, or transliteration) is included. Real text is gated behind separate editorial authorization and review.

## 1. Layer stack
| Layer | Role | Display rule |
|---|---|---|
| **L1: Italki / Benei Roma** | The Hebrew floor. Its order governs the reader and the merged print. | Always shown |
| **L2: Arizal overlays** | Disclosed overlays attached to L1 units through `overlay_link`. Types: `kavanah`, `addition`, `reordering`, `wording_variant`, `omission_flag`, `gestural_rubric`. | Toggleable, always labelled as L2 |
| **L3: Romaniote** | A parallel peer corpus, aligned to L1 unit by unit and never merged into it | Own column |
| **Comparator: Chabad** | Read-only comparator, described by `comparator_corpus.license_status`. The app shows licensed content or a link out, and never scraped content. | Own column, read-only |

### No silent blending
Every displayed item carries the layer it comes from. Nothing from one layer is ever substituted into another without being shown. Alignment differences are recorded as `diff_flags`. Choreography conflicts between layers are grouped by `conflict_group` and carry `never_silent_resolve: true`. The UI lists every side of a conflict and does not pick a winner.

## 2. Phases
- **Phase 0:** database, permanent unit IDs, alignments, overlays, and choreography records.
- **Phase 1:** the study app (this scaffold).
- **Phase 2:** a dual half-page Italki/Romaniote print edition. Units flagged `identical` are combined into one row, and Italki order wins wherever the order differs.
- **Phase 3:** separate single-rite editions.

## 3. Data model
Defined in `schema/siddur.schema.json` (JSON Schema draft-07) and `src/model/types.ts`.
- `rite_corpus`: id, layer, name, text direction, witnesses.
- `base_unit` / `parallel_unit`: permanent ID `<RITE>.<SERVICE>.<SECTION>.<NNN>` (for example `ITK.SHA.SHEMA.010`). IDs are spaced by 10 so units can be inserted later, and an ID is never reused. Each unit carries its service, section, order, label, text (which must start with `PLACEHOLDER` in this repo), lang, status tags, and `requires_minyan`.
- **Status tags:** `core_fixed`, `minhag`, `tzibbur`, `calendar`, `optional`.
- `alignment`: `italki_id`, `romaniote_id` (either may be null) and `diff_flags`, which take the values `identical`, `near_identical`, `divergent_text`, `divergent_order`, `italki_only` and `romaniote_only`.
- `overlay_layer` and `overlay_link`.
- `comparator_corpus`: `license_status` is one of `public_domain`, `licensed`, `link_out_only` or `pending`. `read_only` is always true.
- `unit_choreography`:
  - `cue_code`, `layer_source`, `timing`, `obligation_tag`
  - `confidence`, with the values attested, inferred, disputed or unknown
  - `conflict_group` and `never_silent_resolve`

## 4. Study modes
- **Arrangeable columns:** L1, L3, L2 overlays and the comparator. Each column can be reordered and hidden.
- **Interlinear view:** each alignment row is stacked line by line across the visible layers.
- **Choreography rail:** a side rail with an icon plus short text for each cue. It shows the layer, confidence and timing, and flags disclosed conflicts.
- **Hebrew rendering:** Hebrew units render with `lang="he" dir="rtl"`, and the surrounding UI stays LTR. Controls are labelled, can be reached by keyboard, and show focus outlines.

## 5. Print merge (`src/merge/merge.ts`)
`mergeForPrint` works as follows:
1. It sorts rows that have an Italki unit by Italki order.
2. It inserts each Romaniote-only row directly after the row holding its nearest preceding Romaniote unit.
3. It marks each row `combined` (the flag is exactly `identical`) or `split`.

No alignment is ever dropped.

## 6. Transliteration
`src/translit/engine.ts` defines a pluggable `TranslitSystem` / `TranslitEngine`.
- **Default:** Modern Israeli / Sephardi (for example Shabbat, Sukkot, Torah). All UI and documentation use this convention.
- **Optional:** Ashkenazi and Yemenite systems the user can select.
- The shipped rule tables are **stubs** that run on abstract placeholder tokens only. The real orthographic rules are pending editorial sign-off.

## 7. Out of scope (for now)
Real liturgical text, zmanim calculation, governing editorial review, and rights clearance.
