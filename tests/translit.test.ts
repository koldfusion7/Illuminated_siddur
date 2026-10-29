import { defaultEngine, createEngine, DEMO_PLACEHOLDER } from "../src/translit/engine";
const e = defaultEngine();
test("Modern Israeli / Sephardi is the default", () => {
  expect(e.defaultSystem().id).toBe("modern_sephardi");
  expect(e.transliterate(DEMO_PLACEHOLDER)).toBe("zat-bot");
});
test("optional systems are selectable", () => {
  expect(e.list().map((s) => s.id)).toEqual(["modern_sephardi", "ashkenazi", "yemenite"]);
  expect(e.transliterate(DEMO_PLACEHOLDER, "ashkenazi")).toBe("zos-boys");
  expect(e.transliterate(DEMO_PLACEHOLDER, "yemenite")).toBe("zath-böth");
});
test("unknown system and missing default throw", () => {
  expect(() => e.transliterate("x", "nope")).toThrow();
  expect(() => createEngine().defaultSystem()).toThrow();
});
