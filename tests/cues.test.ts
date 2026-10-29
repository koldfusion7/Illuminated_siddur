import Ajv from "ajv";
import schema from "../schema/siddur.schema.json";
import { seed } from "../src/seed";
import { CUE_CODES, LEGACY_CUE_MAP, CUE_FAMILY } from "../src/model/types";
import { existsSync } from "fs";

const validate = new Ajv({ allErrors: true }).compile(schema);
const base = seed.choreography[0];

test("new cue codes exist in types and schema, legacy codes are gone", () => {
  const enumCodes = (schema as any).definitions.unit_choreography.properties.cue_code.enum;
  expect(enumCodes).toEqual([...CUE_CODES]);
  for (const c of ["kneel", "turn", "lift_eyes", "strike_chest", "steps_approach", "steps_retreat", "face_direction", "hand_position"]) expect(enumCodes).toContain(c);
  for (const old of Object.keys(LEGACY_CUE_MAP)) expect(enumCodes).not.toContain(old);
  for (const c of seed.choreography) expect(CUE_CODES).toContain(c.cue_code);
});

test("every cue code has a family and an SVG icon", () => {
  for (const c of CUE_CODES) {
    expect(CUE_FAMILY[c]).toBeDefined();
    expect(existsSync(`public/icons/${c}.svg`)).toBe(true);
  }
  expect(existsSync("public/icons/cue_unknown.svg")).toBe(true);
});

test("face_direction carries direction data; other cues may not", () => {
  const fd = seed.choreography.filter((c) => c.cue_code === "face_direction");
  expect(fd.length).toBeGreaterThan(0);
  for (const c of fd) expect(c.direction).toBeDefined();
  const ok = (x: object) => validate({ ...seed, choreography: [x] });
  expect(ok({ ...base, cue_code: "face_direction", direction: { kind: "toward", target: "jerusalem", resolve: "user_location" } })).toBe(true);
  expect(ok({ ...base, cue_code: "face_direction", direction: { kind: "bearing", bearing_deg: 110 } })).toBe(true);
  expect(ok({ ...base, cue_code: "face_direction" })).toBe(false);
  expect(ok({ ...base, cue_code: "face_direction", direction: { kind: "bearing", bearing_deg: 400 } })).toBe(false);
  expect(ok({ ...base, cue_code: "bow", direction: { kind: "toward", target: "ark" } })).toBe(false);
  expect(ok({ ...base, cue_code: "face_east" })).toBe(false);
});
