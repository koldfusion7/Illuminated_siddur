declare module "fs" { export function existsSync(p: string): boolean; export function readFileSync(p: string, enc: "utf8"): string; }
declare module "crypto" { export function createHash(a: string): { update(s: string, e: "utf8"): { digest(f: "hex"): string } }; }
