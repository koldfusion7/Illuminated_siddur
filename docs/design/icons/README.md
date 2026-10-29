# Choreography cue icons

15 SVGs plus `sprite.svg`. Part of the Illuminated Siddur design system — see `../DESIGN.md` §12 for the
full specification, the confidence frames that wrap these glyphs, and the accessibility contract.

**All content in this folder is placeholder design work. No liturgical text appears in any file.**

## Drawing spec

| Property | Value |
| --- | --- |
| `viewBox` | `0 0 24 24` |
| Live area | 20 × 20 (2px optical padding on all sides) |
| Stroke | `1.75`, `currentColor`, round cap + round join |
| Fill | `none`, except solid accents (heads, pupils, needles) which use `fill="currentColor" stroke="none"` |
| Render sizes | 20px (rail), 24px (mobile strip, chips), 32px (cue inspector) |
| Colour | **Never** hard-coded. Always inherited via `currentColor`. |

### Three visual families

The set is not a flat bag of pictograms — each glyph declares its family through a shared anchor mark,
so the rail is scannable before any label is read.

| Family | Anchor mark | Members |
| --- | --- | --- |
| **Posture** | ground rule at `y=21` | `stand`, `sit`, `bow`, `kneel`, `rise_on_toes` |
| **Movement / orientation** | threshold rule at `y=3.4`, or a centre pivot dot | `steps_approach`, `steps_retreat`, `face_direction`, `turn` |
| **Gesture** | none — centred composition | `cover_eyes`, `lift_eyes`, `strike_chest`, `kiss_tzitzit`, `hand_position` |

### No RTL mirroring

**No icon in this set requires `scaleX(-1)` in an RTL context.** This is deliberate:

- `steps_approach` / `steps_retreat` encode movement on the **vertical** axis against a threshold rule
  (the threshold standing in for the ark), not on the horizontal axis. A horizontal arrow would have to
  flip with `dir`, and would then be wrong for any community whose ark is not on the wall the arrow assumed.
- `face_direction` is a **direction-neutral compass**, deliberately not an eastward arrow. See the
  `face_east` → `face_direction` note below.
- `turn` is rotational and reads identically mirrored.
- `bow` and `kneel` lean left, but lean direction in a posture glyph is body-relative and arbitrary;
  mirroring them communicates nothing extra and costs a class of layout bugs.

## Files

| File | `sprite.svg` id | Family |
| --- | --- | --- |
| `stand.svg` | `#cue-stand` | posture |
| `sit.svg` | `#cue-sit` | posture |
| `bow.svg` | `#cue-bow` | posture |
| `kneel.svg` | `#cue-kneel` | posture |
| `rise_on_toes.svg` | `#cue-rise-on-toes` | posture |
| `steps_approach.svg` | `#cue-steps-approach` | movement |
| `steps_retreat.svg` | `#cue-steps-retreat` | movement |
| `face_direction.svg` | `#cue-face-direction` | movement |
| `turn.svg` | `#cue-turn` | movement |
| `cover_eyes.svg` | `#cue-cover-eyes` | gesture |
| `lift_eyes.svg` | `#cue-lift-eyes` | gesture |
| `strike_chest.svg` | `#cue-strike-chest` | gesture |
| `kiss_tzitzit.svg` | `#cue-kiss-tzitzit` | gesture |
| `hand_position.svg` | `#cue-hand-position` | gesture |
| `cue_unknown.svg` | `#cue-unknown` | fallback |

## Mapping to the repo's `CueCode` union

The repo's current `CueCode` in `src/model/types.ts` and the requested icon vocabulary are not the same
set. This folder implements the **requested vocabulary**; the table records every delta so the rename can
be applied to `types.ts` and `schema/siddur.schema.json` as one deliberate migration rather than drifting.

| `CueCode` today | Icon delivered | Delta |
| --- | --- | --- |
| `stand` | `stand` | — |
| `sit` | `sit` | — |
| `bow` | `bow` | — |
| `cover_eyes` | `cover_eyes` | — |
| `kiss_tzitzit` | `kiss_tzitzit` | — |
| `rise_on_toes` | `rise_on_toes` | — (not in the requested list; drawn anyway — see below) |
| `three_steps_forward` | `steps_approach` | **rename.** Drops the hard-coded step count. Three is the Italki/most-rites norm, but the count belongs in `label`, not in the enum. |
| `three_steps_back` | `steps_retreat` | **rename.** Same reason. |
| `face_east` | `face_direction` | **rename, and the most substantive change.** `face_east` is only correct west of Jerusalem. It is wrong for Romaniote communities' own geography in parts of the Byzantine world, and wrong for any user east of Jerusalem. The direction is data (a bearing or a named target on the cue record), not an enum value. The glyph is a neutral compass for exactly this reason. |
| `touch_tefillin` | `hand_position` | **generalise.** `touch_tefillin` is one instance of a positioned hand. Keep the specific act in `label`; the enum covers the gesture class. |
| — | `strike_chest` | **new code required.** |
| — | `kneel` | **new code required.** |
| — | `turn` | **new code required.** |
| — | `lift_eyes` | **new code required.** Distinct from `rise_on_toes`: gaze, not heels. Easy to conflate — they must not share a glyph. |
| — | `cue_unknown` | **not an enum value.** Renderer fallback for an unrecognised `cue_code`, so a schema change upstream degrades to a labelled lozenge instead of a blank rail cell. |

Two icons exist outside the requested thirteen, both covering real gaps rather than expanding scope:

- **`rise_on_toes`** is a live value in `CueCode` today. Without a glyph it renders blank in the rail.
- **`cue_unknown`** is the fallback for codes added upstream before the icon set catches up.

## Accessibility

- In-app, icons are decorative: `aria-hidden="true" focusable="false"`, with the cue name in adjacent
  visible text. The standalone files carry `role="img"` and a `<title>` for direct embedding or docs use;
  strip both when inlining next to a text label, or the name is announced twice.
- Each glyph clears **3:1 against its own chip background** (WCAG 2.2 SC 1.4.11 Non-text Contrast), which
  is why strokes are 1.75 and not hairline.
- Icons never carry meaning alone. Cue identity is always icon **+** text label; confidence is carried by
  the frame's **stroke style** (not its hue); timing by **tick position**. See DESIGN.md §12 and §15.
- Under `forced-colors: active` the glyphs survive unchanged because they use `currentColor` throughout
  and declare no background.
