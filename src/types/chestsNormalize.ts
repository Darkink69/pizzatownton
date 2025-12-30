// src/utils/chestsNormalize.ts
import { toNumber, toRecord } from "./typeGuards";

export type NormalizedChestKeys = {
    task: number;
    referral: number;
    deposit: number;
};

export type NormalizedPizzaPieces = {
    common: number;
    uncommon: number;
    rare: number;
    mystical: number;
};

export function normalizeChestKeys(input: unknown): NormalizedChestKeys {
    const rec = toRecord(input);

    return {
        task: toNumber(rec?.task ?? rec?.TASK, 0),
        referral: toNumber(rec?.referral ?? rec?.REFERRAL, 0),
        deposit: toNumber(rec?.deposit ?? rec?.DEPOSIT, 0),
    };
}

export function normalizePizzaPieces(input: unknown): NormalizedPizzaPieces {
    const rec = toRecord(input);

    return {
        common: toNumber(rec?.common ?? rec?.COMMON, 0),
        uncommon: toNumber(rec?.uncommon ?? rec?.UNCOMMON, 0),
        rare: toNumber(rec?.rare ?? rec?.RARE, 0),
        mystical: toNumber(rec?.mystical ?? rec?.MYSTICAL, 0),
    };
}