// src/types/chests.ts

/**
 * Типы сундуков.
 * task - за задания/активности.
 * referral - за рефералов.
 * deposit - за депозиты.
 */
export const CHEST_TYPES = {
  TASK: "task",
  REFERRAL: "referral",
  DEPOSIT: "deposit",
} as const;

export type ChestType = (typeof CHEST_TYPES)[keyof typeof CHEST_TYPES];

export const chestTypeList = Object.values(CHEST_TYPES);

/**
 * Редкость кусочков пиццы и NFT-боксов.
 * common - обычный.
 * uncommon - необычный.
 * rare - редкий.
 * mystical - мистический.
 */
export const RARITIES = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  MYSTICAL: "mystical",
} as const;

export type Rarity = (typeof RARITIES)[keyof typeof RARITIES];

export const rarityList = Object.values(RARITIES);

/**
 * Типы наград, которые могут выпасть из сундука.
 * pizza_piece - кусочек пиццы.
 * pizza_soft - игровая валюта Pizza.
 * pcoin - игровая валюта PCoin.
 * pdollar - игровая валюта PDollar.
 * item - особый предмет.
 */
export const REWARD_TYPES = {
  PIZZA_PIECE: "pizza_piece",
  PIZZA_SOFT: "pizza_soft",
  PCOIN: "pcoin",
  PDOLLAR: "pdollar",
  ITEM: "item",
} as const;

export type RewardType = (typeof REWARD_TYPES)[keyof typeof REWARD_TYPES];

/**
 * Описывает одну награду, полученную из сундука.
 */
export interface Reward {
  type: RewardType;
  rarity: Rarity | null;
  amount: number;
}

/**
 * Состояние ключей для разных типов сундуков.
 */
export type ChestKeys = Record<ChestType, number>;

/**
 * Количество кусочков пиццы разной редкости.
 */
export type PizzaPieces = Record<Rarity, number>;

/**
 * Данные о пользователе.
 */
export interface UserData {
  tgId: number;
  pizza: number;
  pcoin: number;
  pdollar: number;
}
