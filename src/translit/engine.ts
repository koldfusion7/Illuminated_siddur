/** Pluggable transliteration engine. Rule tables here are STUBS operating on nonsense
 * placeholder syllables only; real orthographic rules are pending editorial sign-off. */
export interface TranslitSystem {
  id: string; name: string; isDefault?: boolean;
  /** Ordered token -> output rules (longest match first). */
  rules: Record<string, string>;
}
export interface TranslitEngine {
  register(sys: TranslitSystem): void;
  list(): TranslitSystem[];
  defaultSystem(): TranslitSystem;
  transliterate(input: string, systemId?: string): string;
}
export function createEngine(systems: TranslitSystem[] = []): TranslitEngine {
  const reg = new Map<string, TranslitSystem>();
  const eng: TranslitEngine = {
    register(s) { reg.set(s.id, s); },
    list() { return [...reg.values()]; },
    defaultSystem() {
      const d = [...reg.values()].find((s) => s.isDefault);
      if (!d) throw new Error("No default transliteration system registered");
      return d;
    },
    transliterate(input, systemId) {
      const sys = systemId ? reg.get(systemId) : eng.defaultSystem();
      if (!sys) throw new Error(`Unknown transliteration system: ${systemId}`);
      const keys = Object.keys(sys.rules).sort((a, b) => b.length - a.length);
      let out = "", i = 0;
      while (i < input.length) {
        const k = keys.find((k) => input.startsWith(k, i));
        if (k) { out += sys.rules[k]; i += k.length; } else { out += input[i]; i++; }
      }
      return out;
    },
  };
  systems.forEach(eng.register);
  return eng;
}
/** Stub tables keyed on abstract placeholder tokens {T}, {A}, {O} (not real letters/vowels). */
export const modernSephardi: TranslitSystem = { id: "modern_sephardi", name: "Modern Israeli / Sephardi", isDefault: true, rules: { "{T}": "t", "{A}": "a", "{O}": "o" } };
export const ashkenazi: TranslitSystem = { id: "ashkenazi", name: "Ashkenazi (optional)", rules: { "{T}": "s", "{A}": "o", "{O}": "oy" } };
export const yemenite: TranslitSystem = { id: "yemenite", name: "Yemenite (optional)", rules: { "{T}": "th", "{A}": "a", "{O}": "ö" } };
export const defaultEngine = () => createEngine([modernSephardi, ashkenazi, yemenite]);
/** Demo input: nonsense placeholder syllables. */
export const DEMO_PLACEHOLDER = "z{A}{T}-b{O}{T}";
