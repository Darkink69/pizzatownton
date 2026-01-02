// src/utils/typeGuards.ts

export type UnknownRecord = Record<string, unknown>;
export type EntryArray = ReadonlyArray<readonly [string, unknown]>;

export function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isEntryArray(v: unknown): v is EntryArray {
  return (
      Array.isArray(v) &&
      v.every(
          (e): e is readonly [string, unknown] =>
              Array.isArray(e) && e.length === 2 && typeof e[0] === "string"
      )
  );
}

export function toRecord(v: unknown): UnknownRecord | null {
  if (isRecord(v)) return v;
  if (isEntryArray(v)) return Object.fromEntries(v);
  return null;
}

export function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (s !== "") {
      const n = Number(s);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}