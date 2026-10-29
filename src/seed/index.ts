import raw from "./shacharit.placeholder.json";
import srcRaw from "./sources.json";
import type { SeedBundle, BaseUnit, SourcesBundle } from "../model/types";
export const seed = raw as unknown as SeedBundle;
/** Real PD/open-licensed Hebrew (L1 Italki where available). Comparator units load lazily from public/data. */
export const sources = srcRaw as unknown as SourcesBundle;
export const unitIndex = new Map<string, BaseUnit>([...seed.units, ...seed.parallel_units].map((u) => [u.id, u]));
