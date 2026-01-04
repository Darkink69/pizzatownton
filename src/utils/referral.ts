export const PCOIN_PERCENTS: Record<number, number> = {
    1: 0.01,
    2: 0.01,
    3: 0.01,
};

export const PDOLLAR_PERCENTS: Record<number, number> = {
    1: 0.01,
    2: 0.01,
    3: 0.02,
    4: 0.02,
    5: 0.005,
    6: 0.003,
    7: 0.002,
};

// ---------- helpers ----------
export const REFERRAL_LEVELS_PDOLLAR = [1, 2, 3, 4, 5, 6, 7] as const;
export const REFERRAL_LEVELS_PCOIN = [1, 2, 3] as const;

export function fractionToPercent(f: number): number {
    // 0.01 -> 1
    return f * 100;
}

export function getPdollarPercent(level: number): number {
    return fractionToPercent(PDOLLAR_PERCENTS[level] ?? 0);
}

export function getPcoinPercent(level: number): number {
    return fractionToPercent(PCOIN_PERCENTS[level] ?? 0);
}

export function sumFractions(map: Record<number, number>): number {
    return Object.values(map).reduce((acc, v) => acc + (Number(v) || 0), 0);
}

export const TOTAL_PCOIN_FRACTION = sumFractions(PCOIN_PERCENTS);      // 0.03
export const TOTAL_PDOLLAR_FRACTION = sumFractions(PDOLLAR_PERCENTS);  // 0.07
export const TOTAL_PCOIN_PERCENT = fractionToPercent(TOTAL_PCOIN_FRACTION);     // 3
export const TOTAL_PDOLLAR_PERCENT = fractionToPercent(TOTAL_PDOLLAR_FRACTION); // 7