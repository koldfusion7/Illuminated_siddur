# Illuminated Siddur — Design System

Visual and interaction design for the layered siddur study app
([koldfusion7/Illuminated_siddur](https://github.com/koldfusion7/Illuminated_siddur)).

**Status:** implemented in the alpha mockup (v0.2.0-alpha). Deviations are listed in "Alpha implementation notes" at the end.
**Content:** every example in this document and in the app is placeholder. No liturgical text in
any language, no translation or transliteration of liturgy.

Companion files: `icons/` (cue glyph set). The original static mockup is superseded by the React app in `src/ui/`.

---

## 1. Direction

An **illuminated manuscript** that behaves like a critical apparatus.

The heritage is **Italki** (Benei Roma — the oldest continuous rite in Europe) with a **Romaniote**
(Greek-speaking Byzantine) peer voice. That pairing is specific, and it is not generically "Jewish
manuscript":

- **Italian Hebrew manuscripts** — humanist influence, *bianchi girari* white-vine penwork, restrained
  gold, carmine and ultramarine, generous parchment, square Hebrew for text with the Italian
  semi-cursive for commentary. The semi-cursive now called "Rashi script" was cut as type **in Italy**,
  by Soncino and Bomberg. Using it for the Arizal overlay register is not decoration; it is the correct
  historical voice for a gloss in this tradition.
- **Romaniote / Byzantine** — deeper indigo and porphyry, geometric interlace rather than vine, the
  flat gold of mosaic tesserae rather than burnished leaf.

So: **vine for L1, interlace for L3, gold for L2.** The ornament carries the attribution.

Two things it must never become. Not a **facsimile** — this is a study tool, read for long stretches on
a screen, and faux-aged textures are illegible and patronising. Not a **generic reader** either, where
a rite with its own visual history gets flattened into default web-serif-on-white.

The resolution: an **ornament budget**. One illuminated incipit per section, at most two vine marks per
screen, hairline rules that do structural work, and gold used as a *signal* (the Arizal layer) rather
than as atmosphere. Everything else is parchment, ink, and air.

---

## 2. Three laws, from the data model

The architecture doc is unusually prescriptive about epistemics, and the design falls out of it. These
are not style preferences; breaking them breaks the app's claim about itself.

### Law 1 — No silent blending

> *"Every item displays its source layer; substitutions are recorded as `diff_flags`."*

Therefore **provenance is a visual property of every text run**, not a tooltip. Implemented as the
**layer channel**: a 3–4px bar on the inline-start edge of every cell, column, and stacked block,
coloured by layer and *styled* by layer kind.

| Layer | Channel colour | Channel style | Why |
| --- | --- | --- | --- |
| L1 Italki | `--l1` umber | solid 3px | the floor; governs reading order |
| L3 Romaniote | `--l3` indigo | solid 3px | a peer corpus, equal standing |
| L2 Arizal | `--l2` gold | **dotted** 4px | an overlay, not a floor |
| Comparator (Chabad) | `--cmp` verdigris | **dashed** 3px | read-only, outside the edition |

Style, not just hue, so provenance survives greyscale, print, forced colours, and every form of colour
vision deficiency.

### Law 2 — Never silently resolve

> *"`conflict_group` and `never_silent_resolve: true`. The UI lists all sides without choosing winners."*

Therefore the conflict component has **no dismiss affordance**. Not a disabled one — none. It expands
and collapses; it never goes away, and it never pre-selects a reading. Sides are rendered at *identical*
visual weight: same chip, same size, same order every render. A visual hierarchy between two sides would
be an editorial ruling smuggled in as styling.

Corollary for print (§17): a collapsed `<details>` on paper **is** a silent resolution, because paper has
no disclosure control. Conflicts force open when printing.

### Law 3 — Confidence is first-class

> *`confidence: "attested" | "inferred" | "disputed" | "unknown"`*

Therefore every cue is rendered **inside a frame whose stroke style is its confidence**, never its hue:

| Confidence | Frame |
| --- | --- |
| `attested` | solid 1px |
| `inferred` | dashed 1px |
| `disputed` | double 3px |
| `unknown` | dotted 1px |

Hue is already spent on layer identity. Confidence gets the orthogonal channel, which also means it
survives greyscale and never collides with Law 1.

A fourth principle, less formal but load-bearing: **the app's own uncertainty is also content.** The
transliteration tables are editorially unauthorised stubs, so the transliteration switcher wears a
`stub tables` chip (§15). An app whose whole argument is "never blend sources silently" cannot present
its own placeholder output as finished.

---

## 3. Visual identity

### Motifs

| Motif | Where | Rule |
| --- | --- | --- |
| **Initial-word panel** (incipit) | first unit of a section | In Hebrew manuscripts the initial **word** is illuminated, not the initial letter. **No drop caps anywhere in this system** — a drop cap is a Latin convention and would be a visible error. Framed in a `--l2` hairline over a 10% gold wash. |
| **White-vine mark** (*bianchi girari*) | masthead, section ends | 1px stroke line art, `--gold-leaf`, max two per screen, `aria-hidden`, dropped in print and forced colours. |
| **Byzantine interlace** | L3 contexts | Beaded / chain channel treatment. Distinguishes the Romaniote voice from the Italian vine without a second colour. |
| **Ruling** | interlinear view | The gold hairline under each Hebrew line is the manuscript ruling line, and it does real work: it is the alignment reference for the transliteration and translation beneath. Ornament earning its place. |
| **Rubric** | choreography | *Rubric* means "in red." Choreography is literally a rubric system — the data model's own `gestural_rubric` overlay type. Cues therefore use `--rubric` carmine, and carmine is reserved for them. |

### Anti-patterns

Parchment **texture images**, faux deckled edges, drop shadows imitating vellum curl, decorative
frames around body text, Hebrew set in a display face for reading, gold gradients, Stars of David as
UI furniture, and any ornament that is hit-testable or focusable.

---

## 4. Colour

Two themes. Light is **parchment**; dark is **lamplight** — warm-neutral deep brown-black, never blue-grey
or pure `#000`, which would read as a generic dark mode and lose the material.

Ratios below are computed against the theme's own `--parchment-0` page surface by the WCAG relative-luminance
formula. **Chip grounds are tinted, so chip text ratios differ — the worst cases are called out explicitly.**

### 4.1 Light — parchment

| Token | Hex | Contrast on `--parchment-0` | Duty |
| --- | --- | --- | --- |
| `--parchment-0` | `#FBF7EF` | — | page |
| `--parchment-1` | `#F5EFE2` | — | panel, masthead, column head |
| `--parchment-2` | `#EDE4D2` | — | sunken / hover |
| `--rule` | `#D9CBB2` | 1.5:1 | hairline between content |
| `--rule-strong` | `#BFAE91` | 2.0:1 | heavier content separator |
| `--control-edge` | `#998A74` | **3.2:1** | boundary of an interactive control |
| `--track` | `#998A74` | **3.2:1** | inactive timing ticks |
| `--ink-900` | `#1F1A14` | **16.1:1** | body text |
| `--ink-700` | `#3A3128` | 11.9:1 | headings |
| `--ink-500` | `#6B5E4C` | **5.9:1** | secondary text |
| `--ink-400` | `#8A7B66` | 3.9:1 | **non-text only** — fails 4.5:1 |
| `--l1` | `#5A3E22` | **9.2:1** | L1 Italki channel + badge |
| `--l2` | `#8A5A0B` | **5.5:1** | L2 Arizal channel + badge |
| `--l3` | `#26386B` | **10.6:1** | L3 Romaniote channel + badge |
| `--cmp` | `#3E5A52` | **7.1:1** | comparator channel + badge |
| `--rubric` | `#A3242B` | **6.9:1** | choreography, conflict |
| `--caution` | `#7A5B00` | **5.9:1** | provenance, stub state |
| `--gold-leaf` | `#C9A227` | **2.3:1 — fails** | decorative fill only, see below |
| `--porphyry` | `#6B2A4A` | 9.6:1 | Romaniote ornament |
| `--focus` | `#0B4FA8` | 7.3:1 | focus ring |

### 4.2 Dark — lamplight

| Token | Hex | Contrast on `--parchment-0` | Duty |
| --- | --- | --- | --- |
| `--parchment-0` | `#15120E` | — | page |
| `--parchment-1` | `#1C1813` | — | panel |
| `--parchment-2` | `#241F18` | — | raised |
| `--rule` | `#3A322A` | 1.5:1 | hairline |
| `--rule-strong` | `#52483C` | 2.1:1 | separator |
| `--control-edge` | `#6E6354` | **3.2:1** | interactive boundary |
| `--track` | `#6E6354` | **3.2:1** | inactive timing ticks |
| `--ink-900` | `#EDE4D2` | **14.8:1** | body text |
| `--ink-700` | `#DCD1BB` | 12.3:1 | headings |
| `--ink-500` | `#B8A98F` | **8.1:1** | secondary |
| `--ink-400` | `#8A7B66` | 4.5:1 | hairline, decorative |
| `--l1` | `#D8B98A` | **10.0:1** | L1 |
| `--l2` | `#E3B341` | **9.6:1** | L2 — gold finally works as text |
| `--l3` | `#9DB4E8` | **9.0:1** | L3 |
| `--cmp` | `#8FB3A8` | **8.2:1** | comparator |
| `--rubric` | `#E8737A` | **6.4:1** | choreography, conflict |
| `--caution` | `#DCB95F` | 9.9:1 | provenance |
| `--gold-leaf` | `#B98F22` | 6.2:1 | decorative fill |
| `--porphyry` | `#C58AA8` | 6.7:1 | ornament |
| `--focus` | `#8FB6F2` | 9.0:1 | focus ring |

### 4.3 The gold problem, stated plainly

`--gold-leaf` is **2.3:1 on parchment**. It fails 4.5:1 for text and fails even 3:1 for a UI boundary.
Gold is also the single most identity-critical colour in the palette, so the temptation to use it
everywhere is strong and must be refused by rule:

- **Never** gold text on a light ground.
- **Never** gold as the only boundary of a control or a meaningful graphic.
- Gold as a **fill**, always inside a `--l2` (`#8A5A0B`, 5.5:1) hairline that carries the 1.4.11 duty.
- In dark mode the inversion lifts gold to 9.6:1 as `--l2`, and there it may carry text.

This is why the L2 badge is *dashed `--l2` border over a gold wash* rather than solid gold: the hairline
does the accessibility work, the wash does the identity work.

### 4.4 Tinted chip grounds — worst cases

Chips use `color-mix(in oklab, <accent> 8%, transparent)` over the page. The tint lifts the ground
slightly and lowers text ratio. Measured worst cases:

| Chip | Effective ground | Text | Ratio |
| --- | --- | --- | --- |
| L2 layer badge (`--gold-leaf` 14% wash) | `≈ #F4EBD3` | `--l2` | **4.98:1** — passes, no headroom |
| `divergent_order` diff chip (`--l2` 8%) | `≈ #F1EADD` | `--l2` | **4.95:1** — passes, no headroom |

Consequences, which are binding: the gold wash **must not exceed 14%**, chip label weight must not drop
below 600, and chip labels sit at **11px**, which is the floor. 11px passes 1.4.3 on ratio (AA sets no
minimum size) but it is small for sustained reading — if testing shows strain, move chips to 12px
rather than lightening the ground.

### 4.5 Deriving, not enumerating

One accent token generates its whole family via `color-mix`, so there is no drift between a badge, a
chip, and a channel:

```css
.badge   { color: var(--chan); border-color: var(--chan);
           background: color-mix(in oklab, var(--chan) 8%, transparent); }
```

`--chan` is set once per layer (`.c-l1 { --chan: var(--l1) }`). Adding a fifth corpus means adding one
colour and one `--chan` assignment.

---

## 5. Typography

Four scripts in play at once — square Hebrew, semi-cursive Hebrew, Latin, and monospaced Latin for IDs —
and the hard constraints come from Hebrew.

### 5.1 Recommended families — all open-licensed

| Role | Family | Licence | Notes |
| --- | --- | --- | --- |
| **Hebrew liturgical body** | **Taamey Frank CLM** | GPL v2 **+ font exception** | Culmus. The strongest open nikud *and* ta'amim positioning available. First choice. The font exception permits embedding without GPL-ing the document, but it is a different obligation set from OFL — get sign-off before bundling. |
| Hebrew body (CDN-safe) | **Noto Serif Hebrew** | OFL 1.1 | Solid nikud, wide coverage, variable, on Google Fonts. The pragmatic OFL default. |
| **Hebrew gloss / overlay** | **Noto Rashi Hebrew** | OFL 1.1 | Semi-cursive. The correct commentary register for this rite (§1). Use **only** for L2 overlay glosses — never for liturgical text, and never for UI. |
| Hebrew display / incipit | **David Libre** | OFL 1.1 | Ismar David via Yanek Iontef. Calligraphic, Hebrew-first. Wordmark and initial-word panels. |
| Hebrew display alt | **Ezra SIL** | OFL | BHS-style, excellent mark positioning. Heavier, more scholarly. |
| Hebrew UI chrome | **Heebo** · **Assistant** · **Alef** | OFL 1.1 | If the interface is ever localised to Hebrew. |
| **Latin translation** | **EB Garamond** | OFL 1.1 | Italian humanist — the direction's native Latin voice. Real small caps and oldstyle figures. |
| Latin body alt | **Spectral** | OFL 1.1 | Screen-optimised; better than Garamond at small sizes or low DPI. |
| Latin display | **Cormorant** | OFL 1.1 | Display **only**. Too fine below ~28px. |
| **UI** | **Inter** | OFL 1.1 | Tabular figures, strong at 12–14px. |
| **Mono (IDs, refs)** | **IBM Plex Mono** | OFL 1.1 | Unambiguous `0`/`O`, essential for `ITK.SHA.SECT01.010`. `JetBrains Mono` is an equal substitute. |

**Do not use SBL Hebrew.** It is free of charge but **not** open-licensed; its EULA restricts
redistribution and bundling. It is frequently mistaken for an open font. Excluded deliberately.

### 5.2 The Hebrew constraints

1. **Nikud and ta'amim are combining marks**, positioned by GPOS mark-attachment. Many Hebrew webfonts
   have weak or absent positioning. **Test every candidate with a dense nikud string plus ta'amim before
   adopting it** — a font that looks fine unpointed can collapse when pointed.
2. **Leading must be generous.** Marks hang below the baseline and ta'amim above. Minimum **1.8**, target
   **1.9–2.0** for liturgical body. The mockup uses 20.8px / 40px = **1.92**.
3. **Never letter-space Hebrew.** Spacing square script pulls nikud away from its base letter optically.
   Author default `letter-spacing: normal` — **without `!important`**. See §18 for why that matters.
4. **Never `text-transform`.** Hebrew is unicase; the property is meaningless and risks odd mappings on
   final forms.
5. **Keep `calt`; do not disable ligatures globally.** `font-variant-ligatures: none` can disturb mark
   features in some stacks.
6. **`size-adjust` in `@font-face`** on the fallback so the Hebrew does not reflow when the webfont lands
   over David or Narkisim — the jump is far more violent in Hebrew than in Latin.

### 5.3 Optical size matching between scripts

Hebrew is set **larger** than the Latin beside it — 20.8px against 17px in the mockup — for two reasons:
Hebrew is the primary text and the translation is subordinate, and nikud needs the vertical room.

The ratio is a property of the **font pair**, not a universal constant. Hebrew has no ascenders or
descenders, so its letters occupy a single band and apparent size depends entirely on the letter-height
against the Latin partner's cap-height. EB Garamond has an unusually small x-height, which widens the
gap; Spectral would narrow it.

**Method, not a magic number:** match Hebrew letter-height to Latin cap-height, verify by overlay or
`font-size-adjust: cap-height`, and **re-measure whenever either family changes**. Treat any inherited
ratio as stale.

### 5.4 Scale

| Token | Family | Size | Leading | Use |
| --- | --- | --- | --- | --- |
| `--he-size` | Hebrew body | 20.8px | **40px** (1.92) | liturgical text, all layers |
| `--gloss-size` | Rashi | 17px | 30px | L2 overlay gloss |
| incipit | David Libre | 32px | 48px | initial-word panel |
| `--en-size` | Garamond | 17px | 28px | translation |
| `--tl-size` | Garamond italic | 15px | 24px | transliteration (`he-Latn`) |
| `--ui-size` | Inter | 14px | 20px | controls, cue names |
| `--meta-size` | Inter | 12px | 16px | badges, metadata |
| chip label | Inter 600 | 11px | 16px | diff chips — **floor** |
| `--uid` | Plex Mono | 11px | 16px | unit IDs, `tnum` + `zero` |

### 5.5 Measure

| Script | Target | Notes |
| --- | --- | --- |
| Hebrew | 45–60 characters | below ~30 the nikud crowds and the line fragments |
| Latin translation | 60–75 characters | standard |

Minimum study column width is **17rem**. Below three columns' worth of space the layout stops shrinking
and stacks (§16) — four columns at phone width would put the Hebrew measure under 20 characters, which is
unreadable regardless of how the type is tuned.

### 5.6 Direction and language marking

- UI is LTR (`<html lang="en" dir="ltr">`); Hebrew runs are `lang="he" dir="rtl"` on the element.
- **Transliteration is `lang="he-Latn"`** — romanised Hebrew in BCP-47. This is the correct tag and it is
  functional, not pedantic: a screen reader can select a Latin-script voice instead of mispronouncing
  romanised Hebrew as English.
- Translation is `lang="en"`.
- **Latin inside an RTL run needs `unicode-bidi: isolate`** — used on every token in interlinear token
  mode. Without it, neutral characters at a run's edge resolve against the neighbouring Hebrew and
  punctuation jumps to the wrong end of the token.
- Unit IDs are LTR monospace. Inside any RTL context they carry `unicode-bidi: isolate`, or the
  dot-separated segments reorder.

---

## 6. Spacing, grid, elevation

**4px base.** Scale: `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`.

**Baseline grid: 4px.** The interlinear stack is designed to lock to it:

```
Hebrew          40px
transliteration 24px
translation     28px
                ────
                92px  = 23 × 4px
```

So stacked units stay in phase down a long page, and a column of them reads as ruled.

| Radius | Value | Use |
| --- | --- | --- |
| `--r-sm` | 3px | chips, tags, nudge buttons |
| `--r-md` | 5px | cue frames, panels, inputs |
| `--r-lg` | 8px | reader, cards |
| `--r-pill` | 999px | status tags |

**Elevation is nearly flat.** Two shadows only: `--shadow-1` for a lifted control, `--shadow-2` for the
mobile sheet and the phone frame. Depth is carried by hairlines and surface tint, not by shadow —
parchment does not float.

---

## 7. App frame

```
┌──────────────────────────────────────────────────────────────┐
│ masthead   vine · wordmark · rite subtitle                   │
├──────────────────────────────────────────────────────────────┤
│ placeholder-content notice                                   │
├──────────────────────────────────────────────────────────────┤
│ controls (sticky)  View │ Layers │ Transliteration │ Theme    │
├──────────────────────────────────────────────────────────────┤
│ reader                                                       │
│   ┌──────────────────────────────────┬────────────────────┐   │
│   │ column heads (sticky)            │ Choreography       │   │
│   ├──────────────────────────────────┼────────────────────┤   │
│   │ alignment row                    │ cue rail cell      │   │
│   ├──────────────────────────────────┼────────────────────┤   │
│   │ alignment row                    │ cue rail cell      │   │
│   └──────────────────────────────────┴────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

Controls are grouped by **what they change**, which keeps the model honest: *View* changes
presentation, *Layers* changes which corpora are present, *Transliteration* is a rendering mode on
existing text, *Theme* is chrome. Transliteration deliberately sits apart from Layers — it is not a
layer, and giving it a tier badge would imply it is a source.

---

## 8. Study mode — arrangeable columns

Four columns, matching `ColId` in `src/ui/App.tsx`: `italki | romaniote | arizal | chabad`. Reorderable,
hideable.

### 8.1 Grid, and why not a table

The repo renders a `<table>`. A table buys row alignment for free, but costs two things that matter here:

- **Screen-reader narration.** A table announces "row 4, column 2." What a user needs is "Romaniote
  parallel, PLACEHOLDER unit B."
- **Mobile reflow.** Table cells cannot restack into cards.

A parallel-text apparatus is also not tabular *data*; it is parallel prose that happens to be aligned.

**Recommendation:** CSS grid, with a shared template rather than subgrid:

```css
.row   { display: grid; grid-template-columns: minmax(0,1fr) var(--rail-w); gap: 16px; }
.cells { display: grid; grid-auto-flow: column;
         grid-auto-columns: minmax(0,1fr); gap: 16px; }
```

`grid-auto-flow: column` + `grid-auto-columns` means hidden cells (`display: none`) simply stop
generating tracks and the rest rebalance — **all 16 visibility combinations with zero enumeration.**
`minmax(0, 1fr)` is what keeps long unpointed Hebrew from forcing a track wider than its share.

**DOM order is row-major.** A screen reader walks one alignment at a time — L1 unit, then its Romaniote
parallel, then its overlay, then the comparator — which is the only order that preserves the
correspondence the whole view exists to show.

### 8.2 Row anatomy

```
│ ▌ L1 Italki                              │   ← layer badge (mobile only; desktop has column head)
│ ▌ ITK.SHA.SECT01.010  PLACEHOLDER unit A │   ← uid (mono) · label (italic) · status tags
│ ▌ core_fixed  tzibbur  requires minyan   │
│ ▌                                        │
│ ▌ [ Hebrew — 20.8/40 ]                   │
│ ▌ [ transliteration — he-Latn, 15/24 ]   │
│ ▌ [ translation — 17/28 ]                │
│ ▌                                        │
│ ▌ ⑂ divergent_text   ≈ near_identical    │   ← diff chips
```

The channel (`▌`) runs the full cell height. Status tags come straight from `StatusTag`:
`core_fixed · minhag · tzibbur · calendar · optional`. `requires_minyan` is a distinct tag in `--l3`
because it is a *gating condition*, not a classification — it changes whether the unit is said at all.

### 8.3 Absent sides

When an alignment has no counterpart (`italki_only`, `romaniote_only`), the cell renders an explicit
**absent block** — dashed border, diagonal hatch, plain-language explanation. It must read as
*structurally empty*, never as broken or still loading. `mergeForPrint` drops no alignment, and the UI
must not appear to either.

### 8.4 Comparator and licence state

`license_status` drives **which component renders**, not just styling:

| `license_status` | Renders |
| --- | --- |
| `public_domain`, `licensed` | text, in the comparator channel |
| `link_out_only` | **link-out panel** — short licence explanation + "Open at source" with an external-link glyph. No text reproduced. |
| `pending` | absent block, stating the licence is uncleared |

The comparator is also the only column with a lock glyph in its badge and the only one with no chip
background — deliberately recessive. It is a reference, not part of the edition.

### 8.5 Reordering — and SC 2.5.7

Column order is controlled by **`◂ ▸` buttons**, matching `move(i, d)` in `App.tsx`.

This is not a fallback. **WCAG 2.2 SC 2.5.7 Dragging Movements (AA)** requires a single-pointer
alternative to any drag. Buttons are the primary mechanism; pointer-drag is an enhancement layered on
top, and the buttons must never be removed once drag ships.

Buttons are 28px (above the 24px floor of SC 2.5.8) and carry explicit labels —
`aria-label="Move Romaniote column left"`, not "left".

---

## 9. Interlinear view

Two modes. Both keep the 92px rhythm of §6.

### 9.1 Line mode — default

Hebrew / transliteration / translation as three stacked lines per sense unit, with the gold ruling
hairline under the Hebrew. Safer than token mode for long or uneven units and the better default:
the registers stay readable as prose.

### 9.2 Token mode

Each word becomes a vertical micro-stack — Hebrew, transliteration, translation — and the stacks flow
**right-to-left** as a wrapped flex row.

This is the most technically demanding view in the app:

```css
.il-tokens { display: flex; flex-wrap: wrap; }    /* on a dir="rtl" element */
.tok       { display: grid; justify-items: center; }
.tok__tl,
.tok__en   { unicode-bidi: isolate; white-space: nowrap; }
```

- The paragraph is `dir="rtl"`, so tokens lay out right-to-left and wrap correctly.
- Each Latin sub-run is **bidi-isolated**, so punctuation at a token edge resolves inside its own token.
- `white-space: nowrap` on the Latin keeps a token atomic; the token is the wrap unit, not the word
  inside it.
- Token width is driven by the **longest of the three registers**, which is usually the Latin. Expect
  airier setting than line mode. This is the correct trade, not a bug.

Word-level alignment requires token-level alignment data that does not exist in the schema yet (see §20).
Line mode must remain the default until it does.

### 9.3 Layer in interlinear

Columns are gone, so the channel moves to the **block** inline-start edge and the layer badge moves into
the unit header. Law 1 holds in every view; only its carrier changes.

---

## 10. Choreography rail

### 10.1 Two rails, two jobs

| Rail | Position | Job |
| --- | --- | --- |
| **Row rail** (primary) | a fixed 15rem column inside the reader, one cell per alignment | study: the cue sits beside the unit it governs |
| **Now bar** | bottom-anchored, sticky | live use during a service: current cue + next cue, in thumb reach |

The architecture doc specifies a side rail; per-row cells deliver the alignment a side rail implies,
while the now bar handles the "where am I" job a static rail cannot. The now bar is the **only** place a
cue appears out of document order, and it is additive — never the sole presentation of a cue.

### 10.2 Cue chip anatomy

```
┌─────────────────────────────────┐
│ [icon]  Bow                     │   ← 20px glyph · cue name, 14/600
│         L1  attested  required   │   ← layer · confidence · obligation
│         ▪▪▫▫▫                    │   ← timing on a 5-tick line
└─────────────────────────────────┘
      ↑ frame stroke style = confidence
```

Every field maps to `UnitChoreography`: `cue_code` → glyph + name, `layer_source` → `L1/L2/L3/C` mono
mark in the layer colour, `confidence` → frame style, `obligation_tag` → italic word
(`required · custom · optional · kabbalistic`), `timing` → tick position.

### 10.3 Timing as position

`timing` is a 5-value ordinal — `before · start · during · end · after` — so it renders as a **5-tick
micro-timeline with the active tick filled**. Position is ordinal and needs no legend lookup; a hue
ramp across five steps would need one and would collide with layer colour.

The inactive track carries meaning (it shows the scale that makes the active tick legible), so it is a
**meaningful graphic under SC 1.4.11** and gets its own 3:1 token — `--track`, not a faint tint. The
whole component is `role="img"` with `aria-label="Timing: start of unit"`.

### 10.4 Conflict group

```
┌═════════════════════════════════════════┐   ← 2px rubric, double-ruled
│ ⚖ UNRESOLVED — 2 READINGS   cg-001      │   ← summary; no dismiss control
├─────────────────────────────────────────┤
│ ┌─────────────────────┐                 │
│ │ Bow  L1 attested    │  ▪▪▫▫▫          │
│ └─────────────────────┘                 │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                 │
│   Bow  L2 inferred      ▫▪▪▫▫           │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                 │
│ never_silent_resolve: true — both stand │
└─────────────────────────────────────────┘
```

A `<details>`, open by default on desktop, closed on mobile for vertical space. The summary **states the
count while collapsed**, so the disagreement is visible without expanding.

Equal weight is the point: both chips are the same size, same background, same order. The only
difference between them is the confidence frame, which is reporting the data, not ranking it.

*Implementation note:* the mockup uses `::before { content: "⚖" }` for the summary glyph for
self-containment. In production use an inline SVG with `aria-hidden="true"` — pseudo-element content can
be announced by some screen readers, which would add noise before the text that carries the meaning.

---

## 11. Diff chips

Six values from `DiffFlag`. Each chip is **glyph + word + colour** — three channels, any one of which
can be lost without losing the chip.

| Flag | Glyph | Colour | Form |
| --- | --- | --- | --- |
| `identical` | `=` | `--cmp` | solid |
| `near_identical` | `≈` | `--cmp` | **dashed** — same hue as `identical`, different stroke; the pair is a spectrum, not two categories |
| `divergent_text` | `⑂` | `--rubric` | solid |
| `divergent_order` | `⇅` | `--l2` | solid |
| `italki_only` | `◧` | `--l1` | solid — layer colour, because the flag *is* a statement about which layer |
| `romaniote_only` | `◨` | `--l3` | solid — mirrored glyph, mirrored meaning |

`diff_flags` is an **array**, so chips are plural and wrap. An alignment can be `divergent_order` *and*
`identical` in text — a real and important case that the design must render as two chips rather than
collapsing to one verdict.

Chips attach to the **non-governing** side of an alignment (normally L3), because the flag describes a
relationship *to* the L1 floor. `italki_only` is the exception: it attaches to L1, since that is the side
that exists.

---

## 12. Layer badges

Anatomy: **`[tier mark] [name] [state glyph?]`**

```
┌──────────────────┐  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  ┌──────────────────┐  ┌──────────────────┐
│ L1 │ Italki      │  ┊ L2 ┊ Arizal    ┊  │ L3 │ Romaniote   │  │ C │ Chabad  🔒   │
└──────────────────┘  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘  └──────────────────┘  └──────────────────┘
  solid, umber          dashed, gold wash    solid, indigo        no fill, lock
```

| Badge | Tier | Border | Ground | State |
| --- | --- | --- | --- | --- |
| L1 Italki | `L1` | solid `--l1` | `--l1` 8% | — |
| L2 Arizal | `L2` | **dashed** `--l2` | `--gold-leaf` 14% | always paired with a disclosure affordance |
| L3 Romaniote | `L3` | solid `--l3` | `--l3` 8% | — |
| Comparator | `C` | solid `--cmp` | **none** | lock glyph; `license_status` tag |

**The tier mark is the non-colour channel.** `L1`/`L2`/`L3`/`C` in monospace, separated by a hairline
rule inside the badge. Greyscale, forced colours, and any colour vision deficiency all preserve layer
identity, because the identity is a *character*.

The L2 badge never appears without a disclosure affordance next to it. `OverlayLayer` carries a
`disclosure: string`, and the architecture calls L2 a *"disclosed* mystical commentary layer." A
disclosed layer whose disclosure is not reachable from where it is displayed is not disclosed. While
`source_ref` is unpopulated the badge is accompanied by a `disclosure: source_ref pending` provenance
chip.

---

## 13. Icon set

15 glyphs in `icons/`, plus `icons/sprite.svg`. Full drawing spec, family taxonomy, and the complete
`CueCode` mapping table live in **`icons/README.md`**.

### 13.1 Spec summary

24×24 viewBox · 20×20 live area · 1.75px stroke · `currentColor` · round cap and join · solid accents
(heads, pupils, needles) as `fill="currentColor"`. Renders at 20px (rail), 24px (mobile, chips), 32px
(inspector).

### 13.2 Three families

Each glyph declares its family through a shared anchor mark, so the rail is scannable before any label
is read:

| Family | Anchor | Members |
| --- | --- | --- |
| **Posture** | ground rule at `y=21` | `stand` `sit` `bow` `kneel` `rise_on_toes` |
| **Movement / orientation** | threshold rule at `y=3.4`, or a pivot dot | `steps_approach` `steps_retreat` `face_direction` `turn` |
| **Gesture** | none — centred | `cover_eyes` `lift_eyes` `strike_chest` `kiss_tzitzit` `hand_position` |

### 13.3 No RTL mirroring

**No icon in this set needs `scaleX(-1)` in RTL.** `steps_approach` / `steps_retreat` encode movement on
the **vertical** axis against a threshold rule rather than as a horizontal arrow; `face_direction` is a
direction-neutral compass; `turn` is rotational. `bow` and `kneel` lean left, but lean direction in a
posture glyph is body-relative and arbitrary. Mirroring would add nothing and cost a class of layout bugs.

### 13.4 The requested vocabulary is not the repo's enum

The icon set implements the **requested** cue vocabulary, which differs from `CueCode` in
`src/model/types.ts` today. The substantive deltas:

- **`face_east` → `face_direction`.** `face_east` is only correct *west* of Jerusalem. It is wrong for
  parts of the Byzantine world the Romaniote rite actually comes from, and wrong for any user east of
  Jerusalem. The direction is **data** — a bearing or a named target on the cue record — not an enum
  value. The glyph is a neutral compass for exactly this reason. This is the one rename worth making
  independently of the icon work.
- **`three_steps_back` / `three_steps_forward` → `steps_retreat` / `steps_approach`.** The step count
  belongs in `label`, not in the enum.
- **`touch_tefillin` → `hand_position`.** One instance of a positioned hand generalised to the gesture
  class; the specific act stays in `label`.
- **New codes needed:** `strike_chest`, `kneel`, `turn`, `lift_eyes`. Note `lift_eyes` (gaze) is
  **distinct from** `rise_on_toes` (heels) — easy to conflate, and they must not share a glyph.
- **Two icons beyond the requested thirteen**, both closing real gaps: `rise_on_toes` is a live `CueCode`
  value that would otherwise render an empty rail cell, and `cue_unknown` is the renderer fallback so an
  upstream schema addition degrades to a labelled lozenge rather than to nothing.

The mapping table in `icons/README.md` records every delta so the rename lands as one deliberate
migration of `types.ts` + `schema/siddur.schema.json` rather than drifting.

---

## 14. Transliteration switcher

### 14.1 It is a rendering mode, not a layer

No channel colour, no tier badge, grouped separately from Layers. Transliteration is a transformation of
existing text, and presenting it with layer chrome would imply it is a source.

### 14.2 Anatomy

```
Transliteration   [ Off │ Sephardi / Modern │ Ashkenazi │ Yemenite ]   ⟨stub tables⟩
┌──────────────────────────────────────────────────────────────────┐
│ he-Latn   Shabbat · Torah · berakhah · tzitzit · minyan · kavanah │
└──────────────────────────────────────────────────────────────────┘
```

A radiogroup with four states — `Off` is a first-class option, not an absence. Choice is sticky across
sessions. Scheme names come from the architecture doc: **Modern Israeli / Sephardi (default)**, Ashkenazi,
Yemenite.

The preview slot shows the active scheme applied to sample vocabulary. In **`Off`** it states that only
Hebrew and translation rows render, so the control's effect is never silent.

### 14.3 The `stub tables` chip

A `--caution` dashed chip sits beside the control. The architecture doc states the rule tables are
placeholder stubs pending editorial authorisation, so the chip is not decoration — it is Law 1 applied
to the app's own output. It is removed only when the tables are authorised, and it is **not** dismissible.

### 14.4 Content policy in this design

Sephardi / modern spelling only, everywhere: **Shabbat**, **Torah**, **berakhah**, **tzitzit**,
**minyan**, **kavanah**. Never Ashkenazi spellings.

Naming the Ashkenazi and Yemenite *schemes* is unavoidable — they are selectable options. But
the app renders **no sample text for either**: selecting them shows "Preview withheld in this
placeholder build." Two reasons, and both are real:

1. The content rules for this work permit Sephardi/modern spelling only.
2. More durably: the tables are editorially unauthorised, so there is nothing legitimate to preview.

The production design keeps the preview slot and fills it per scheme once the tables are authorised.

### 14.5 Markup

`lang="he-Latn"` on every transliteration run (§5.6). In interlinear line mode the transliteration is the
middle row; in token mode it is the middle cell of each token, bidi-isolated.

---

## 15. Mobile

### 15.1 Container queries, not viewport queries

Breakpoint logic lives in `@container (max-width: 46rem)` on `.reader`, so the component reflows to **its
own** width. It composes identically in a 390px phone frame on a desktop page and on a real handset —
which is also what makes the mobile composition reviewable in the app without a device.

### 15.2 What changes

| Desktop | Mobile |
| --- | --- |
| 4 columns side by side | cells **stack** as full-width cards, in alignment order |
| shared sticky column heads | each cell carries its own layer badge |
| rail as a 15rem column | rail goes **inline**, beneath the alignment it governs — dashed top rule, faint rubric wash |
| conflicts open | conflicts collapsed, **summary still states the count** |
| — | **bottom now-bar**: current cue + next cue |
| 28px targets | 32px minimum, 44px on the bottom bar |

**Columns stack rather than shrink.** Four columns at 390px would put the Hebrew measure under 20
characters (§5.5). Hiding layers is the user's call; silently making the primary text unreadable is not.

### 15.3 Reflow is composed, not exempted

SC 1.4.10 exempts content "requiring two-dimensional layout," and a parallel-text apparatus could
plausibly claim it. **The design declines the exemption.** Taking it would hand a phone user a
horizontal scrollbar on the app's core reading surface. The stacked composition is the better artefact
and happens to also be the compliant one.

### 15.4 One-handed use

Service use means standing, holding a phone, often mid-posture-change. So: controls bottom-anchored,
the now-bar in thumb reach, no hover-dependent affordances, and no cue that requires scrolling to
discover.

---

## 16. Motion

Minimal and almost entirely functional.

| Transition | Duration | Easing |
| --- | --- | --- |
| layer toggle, chip hover | 120ms | `cubic-bezier(.2,.6,.3,1)` |
| conflict expand/collapse | 160ms | same |
| theme change | **none** | instant — a cross-fade on a full-page colour swap reads as a glitch |

**Never animate a Hebrew text block.** Reflowing pointed Hebrew mid-transition makes nikud appear to
detach and re-attach. Layer toggles animate the container's opacity, not the text's position.

`prefers-reduced-motion: reduce` collapses every duration to 1ms (not `0`, which can skip
`transitionend` handlers).

No scroll-linked animation, no parallax, no decorative motion on ornament.

---

## 17. Print

`mergeForPrint` exists in `src/merge/merge.ts`, so print is a first-class mode, not an afterthought —
and it is where Law 1 is hardest. This section is an addition beyond the brief's list, included because
a layered edition that cannot be printed with its layers intact fails its own premise.

| Concern | Treatment |
| --- | --- |
| **Colour** | All layer colours → black; comparator → `#444`; gold → `#999` hairline. Layer identity now rests entirely on **channel stroke style** (solid / dotted / dashed) and the **tier mark** — which is why neither was ever allowed to be colour-only. |
| **Conflicts** | **Forced open.** `.conflict__body { display: grid !important }`. Paper has no disclosure control, so a collapsed conflict on paper is a silent resolution — a Law 2 violation. |
| **Unit IDs** | Kept and darkened. In print the ID is the citation handle. |
| **Links** | `a[href]::after { content: " (" attr(href) ")" }` — a link-out comparator must remain resolvable on paper. |
| **Chrome** | Controls, masthead, phone frames, inventory and legend bands all dropped. |
| **Pagination** | `.row { break-inside: avoid }` so an alignment never splits across a page; the reader itself may break freely. |
| **Ornament** | Vine marks and gold rules removed. The incipit keeps its frame as a hairline. |

---

## 18. Accessibility — WCAG 2.2 AA

Target: **WCAG 2.2 Level AA**, with the 2.2-specific criteria called out because several land directly
on this app's core interactions.

### 18.1 New in WCAG 2.2 — the ones that bite here

| SC | Level | How it is met |
| --- | --- | --- |
| **2.5.7 Dragging Movements** | AA | Column reordering ships as `◂ ▸` buttons **first** (`move(i, d)`). Drag is an enhancement; the buttons are permanent. This is the single most relevant new criterion — a drag-only column rail would fail outright. |
| **2.5.8 Target Size (Minimum)** | AA | 24px floor. Nudge buttons 28px, segmented options 32px, mobile bottom bar 44px. |
| **2.4.11 Focus Not Obscured (Min.)** | AA | Sticky controls and sticky column heads could cover a focused element. `scroll-margin-block: 6rem` on every focusable keeps it clear of both. |
| **3.2.6 Consistent Help** | AA | Provenance and disclosure affordances sit in the same position in every layer block and every view. |
| **3.3.7 Redundant Entry** | AA | No re-entry: view, layer, scheme and theme state persist. |
| **3.3.8 Accessible Authentication** | AA | N/A — no authentication. |
| **2.4.13 Focus Appearance** | AAA | Not required, but met: 2px solid ring, 2px offset, ≥3:1 against both the control and the page. |

### 18.2 Contrast

- **1.4.3** — all body text ≥4.5:1; tinted chip worst cases measured at **4.95:1** and **4.98:1** (§4.4).
  `--ink-400` (3.9:1) is marked **non-text only** in the token table.
- **1.4.11 Non-text Contrast** — `--control-edge` (3.2:1) is a separate token from `--rule-strong`
  (2.0:1) precisely so a control boundary cannot accidentally be built from a decorative hairline. Cue
  glyph strokes are 1.75px, not hairline, to clear 3:1 on their chip grounds. The inactive timing track
  gets its own 3:1 token (`--track`) because it carries the scale that makes the active tick readable.
- **`--gold-leaf` is 2.3:1 and is barred from text and from lone boundaries** (§4.3).

### 18.3 Text and layout adaptation

- **1.4.4 Resize text** — all type in `rem`; 200% zoom triggers the stacked composition.
- **1.4.10 Reflow** — 320px with no 2D scrolling, by composition rather than exemption (§15.3).
- **1.4.12 Text Spacing** — the layout must survive a user override of line-height 1.5×,
  letter-spacing 0.12em, word-spacing 0.16em, paragraph 2em.

  This one deserves honesty. Letter-spacing genuinely degrades pointed Hebrew — the marks read as
  detached from their base letters. The temptation is `letter-spacing: normal !important` on `[lang="he"]`.
  **That is the wrong call and arguably the violation itself**: 1.4.12 is about letting the user's
  adaptation land. The author default is `normal` **without `!important`**; the obligation we owe is that
  nothing clips, overlaps, or is cut off when the override wins. The Hebrew will look wrong under forced
  spacing. That is the user's informed trade, not ours to block.

### 18.4 Structure, language, state

- **1.3.1 / 1.3.2** — semantic landmarks; row-major DOM order so alignments narrate as correspondences
  (§8.1). Each alignment row is `role="group"` with a descriptive `aria-label`.
- **3.1.1 / 3.1.2 Language of Parts** — `lang="he"`, `lang="en"`, **`lang="he-Latn"`** for
  transliteration, so romanised Hebrew gets a Latin-script voice instead of being read as English (§5.6).
- **4.1.2** — the layer toggles, scheme radios and view switch are native inputs with real labels.
- **4.1.3 Status Messages** — an `aria-live="polite"` region announces layer-count and scheme changes.
- **Icons never carry meaning alone** — glyph + visible text label always; `aria-hidden="true"` +
  `focusable="false"` on the inline SVG. The standalone files in `icons/` carry `role="img"` and a
  `<title>` for direct embedding; strip both when placing next to a text label or the name is announced
  twice.
- **Composite graphics are labelled** — the 5-tick timing strip is `role="img"` with
  `aria-label="Timing: start of unit"`.

### 18.5 Forced colours

Windows contrast themes get an explicit `@media (forced-colors: active)` path: ornament drops out, and
every structural boundary — layer channels, confidence frames, badges, chips — is redeclared against
`CanvasText` / `Highlight` / `GrayText`. The checked state of a segmented option uses
`forced-color-adjust: none` on its indicator bar only, since it is the sole carrier of selection.

This mode is also the system's best self-test: **if layer identity and confidence survive forced
colours, Laws 1 and 3 were implemented in form rather than in colour.**

### 18.6 Not yet verified

Stated rather than glossed, because the claims above are only as good as their testing:

- No screen-reader testing has been done. The interlinear **token mode** especially needs NVDA, JAWS,
  and VoiceOver passes — nested bidi-isolated runs are exactly where SR support diverges.
- Hebrew voice support for `lang="he"` and `lang="he-Latn"` varies by platform and needs a matrix.
- Nikud positioning needs per-font visual testing (§5.2 item 1).
- Contrast ratios here are computed, not instrument-measured on a calibrated display.

---

## 19. Content rules

Binding on this design work and on the app:

1. **No liturgical text** in Hebrew or any other language. No translation of liturgy. No transliteration
   of liturgy.
2. **Placeholder labels** — `PLACEHOLDER unit A`, `PLACEHOLDER parallel B`.
3. **Hebrew runs are lorem-ipsum nonsense**, carrying nikud purely to exercise mark positioning and
   leading. Choosing lorem rather than invented Hebrew words is deliberate: it is self-evidently
   placeholder to any reader, in a way that plausible-looking Hebrew would not be.
4. **Neutral section codes** — `ITK.SHA.SECT01.010`, not a named liturgical section, even though the repo's
   own docs use a named example. Keeps the mockup clearly clear of liturgical content.
5. **Transliteration examples** are vocabulary words in Sephardi / modern spelling only — Shabbat, Torah,
   berakhah, tzitzit, minyan, kavanah. **Never Ashkenazi spellings.**
6. **No invented URLs.** The comparator link-out is `href="#"`.
7. The ID format follows the repo: `<RITE>.<SERVICE>.<SECTION>.<NNN>`, spaced by 10 for insertions.

---

## 20. Implementation notes

### 20.1 Token delivery

Ship as a single `tokens.css` with `:root` light, a `:root[data-theme="dark"]` block, and a
`prefers-color-scheme` auto block. Keep every value a CSS custom property — no SCSS variables — so
runtime theming needs no rebuild.

the app drives state with `:has()` on radio and checkbox inputs purely to stay JavaScript-free.
**In the app, use `data-*` attributes on the root** (`data-view`, `data-theme`, `data-translit`) with
React state. The `:has()` approach was a self-containment constraint, not a recommendation.

### 20.2 Mapping to existing code

| Repo symbol | Design surface |
| --- | --- |
| `ColId` | column identity → `--chan` assignment per cell |
| `cols` / `hidden` | column order and visibility; `◂ ▸` buttons (§8.5) |
| `interlinear` | view switch (§9) |
| `sys` | transliteration scheme (§14) |
| `CUE_ICON` | **replace the Unicode symbol map with the sprite** — Unicode has no glyph for most of these cues, and the fallback behaviour across platform fonts is unpredictable |
| `cuesFor(ids)` | row rail cell contents (§10.1) |
| `conflicts` | conflict component (§10.4) |
| `mergeForPrint` | print mode (§17); `combined` → single row, `split` → absent block (§8.3) |
| `StatusTag` | status tags (§8.2) |
| `DiffFlag` | diff chips (§11) |
| `license_status` | comparator component selection (§8.4) |
| `OverlayLayer.disclosure` | L2 disclosure affordance (§12) |
| `CueCode` | **rename migration required** (§13.4) |

### 20.3 Browser requirements

`color-mix()`, `:has()`, container queries, and logical properties throughout. All are baseline in
current Chrome, Edge, Safari, and Firefox. `color-mix` is load-bearing (§4.5); the rest degrade.

Logical properties (`inline-start`, `margin-inline`) are used **everywhere** rather than `left`/`right`.
With RTL content in every view this is not stylistic tidiness — physical properties would need a
mirrored stylesheet.

---

## 21. Open decisions

Flagged rather than silently resolved.

1. **`face_east` → `face_direction` needs an owner.** The rename is a schema change with editorial
   weight (§13.4). The design assumes it; the repo has not made it.
2. **Token-level alignment data does not exist.** Interlinear token mode (§9.2) needs per-word alignment
   that `Alignment` does not model — it aligns units, not tokens. Line mode must stay the default until
   that schema question is answered.
3. **Hebrew font choice is unresolved pending a nikud test.** Taamey Frank CLM is the quality choice but
   GPL+font-exception; Noto Serif Hebrew is OFL and CDN-available. This is a licensing decision as much
   as a typographic one (§5.1).
4. **Which direction does `face_direction` actually point?** If it becomes a bearing, the UI needs a
   geolocation or manual-orientation setting, and that is a new surface not designed here.
5. **Comparator licensing is unresolved upstream.** The design handles all four `license_status` values,
   but which one Chabad material actually falls under determines whether the comparator column is
   usually text or usually a link-out — and therefore how much of the four-column layout is real.
6. **Chip labels at 11px** pass on ratio but are small (§4.4). Needs a call after user testing: 12px, or
   hold.
7. **Now-bar cue advancement** — what drives "current"? Scroll position, manual stepping, or a timed
   service mode? Each implies a different control, and none is designed here.

---

## Alpha implementation notes

- **Fonts are self-hosted** from `public/fonts/` (subset WOFF, OFL 1.1); no CDN. Frank Ruhl Libre stands in
  for the Hebrew body face until the nikud test in A21.3 picks a final family. Noto Rashi Hebrew is not
  bundled yet; the gloss register falls back to the body face.
- **State** uses `data-theme`, `data-view`, `data-translit` on `<html>` (§20.1) and persists in `localStorage`.
  URL parameters (`?view=interlinear&theme=dark`) override for deep links and screenshots.
- **Cue migration (§13.4) is applied** in `types.ts`, the JSON Schema and the seed. `face_direction` requires a
  `direction` object (`toward` a named target, or a fixed `bearing_deg`); other cues may not carry one.
- **Token interlinear mode is deferred** (A21.2). Line mode is the only interlinear mode.
- **Now bar** uses manual previous/next stepping as an interim answer to A21.7.
- **Mobile controls** stay at the top; the bottom-anchored control sheet (§15.4) is deferred.
- **Pointer-drag column reordering** is not built; the `◂ ▸` buttons and presets are the mechanism (§8.5).
