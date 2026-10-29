import raw from "./shacharit.placeholder.json";
import type { SeedBundle, BaseUnit } from "../model/types";
export const seed = raw as unknown as SeedBundle;
export const unitIndex = new Map<string, BaseUnit>([...seed.units, ...seed.parallel_units].map((u) => [u.id, u]));
