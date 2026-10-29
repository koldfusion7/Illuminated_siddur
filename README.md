# Illuminated Siddur

**This repository holds placeholder content only.** It contains no prayer text in any language. Every unit is a labelled stub such as `PLACEHOLDER: Italki L1 / Shacharit / SHEMA unit 1`.

This is the Phase 0/1 architecture scaffold for a layered siddur study app:
- **L1:** Italki / Benei Roma floor
- **L2:** disclosed Arizal overlays
- **L3:** Romaniote parallel peer
- **Comparator:** Chabad, read-only

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack
Vite + React 18 + TypeScript, Vitest, and Ajv for schema validation.

## Run
```bash
npm install
npm run dev      # reader at http://localhost:5173
npm test         # merge, transliteration and schema tests
npm run build    # type-check + production build
node src/seed/build-seed.mjs   # regenerate the placeholder seed JSON
```

## Layout
- `schema/siddur.schema.json`: JSON Schema for the data model
- `src/model/types.ts`: TypeScript types
- `src/seed/`: skeleton weekday Shacharit (IDs and labels only)
- `src/merge/`: alignment and print-merge logic
- `src/translit/`: pluggable transliteration engine (stub tables)
- `src/ui/`: minimal reader
- `tests/`: Vitest suites
