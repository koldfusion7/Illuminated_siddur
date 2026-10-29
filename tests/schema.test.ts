import Ajv from "ajv";
import schema from "../schema/siddur.schema.json";
import { seed } from "../src/seed";
test("seed validates against JSON Schema and is placeholder-only", () => {
  const v = new Ajv({ allErrors: true }).compile(schema);
  expect(v(seed)).toBe(true);
  for (const u of [...seed.units, ...seed.parallel_units]) expect(u.text.startsWith("PLACEHOLDER")).toBe(true);
});
