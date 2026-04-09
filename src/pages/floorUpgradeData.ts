// floorUpgradeData.ts

export interface FloorUpgradeLevel {
  pcoinCost: number;
  incomeBonus: number;
}

export interface FloorUpgradeData {
  [floorId: number]: FloorUpgradeLevel[];
}

export const floorUpgradeData: FloorUpgradeData = {

  1: [], 
  
  // 2 - 1 этаж
  2: [
    { pcoinCost: 500, incomeBonus: 84 },
    { pcoinCost: 625, incomeBonus: 104 },
    { pcoinCost: 780, incomeBonus: 130 },
    { pcoinCost: 970, incomeBonus: 164 },
    { pcoinCost: 1200, incomeBonus: 206 },
  ],
  // 3 - 2 этаж
  3: [
    { pcoinCost: 1500, incomeBonus: 260 },
    { pcoinCost: 1800, incomeBonus: 314 },
    { pcoinCost: 2300, incomeBonus: 402 },
    { pcoinCost: 2900, incomeBonus: 528 },
    { pcoinCost: 3600, incomeBonus: 636 },
  ],
  // 4 - 3 этаж
  4: [
    { pcoinCost: 4500, incomeBonus: 798 },
    { pcoinCost: 5600, incomeBonus: 996 },
    { pcoinCost: 7000, incomeBonus: 1250 },
    { pcoinCost: 8700, incomeBonus: 1440 },
    { pcoinCost: 11000, incomeBonus: 1560 },
  ],
  // 5 - 4 этаж
  5: [
    { pcoinCost: 13500, incomeBonus: 1990 },
    { pcoinCost: 16800, incomeBonus: 3000 },
    { pcoinCost: 21000, incomeBonus: 3800 },
    { pcoinCost: 26000, incomeBonus: 4700 },
    { pcoinCost: 33000, incomeBonus: 6100 },
  ],
  // 6 - 5 этаж
  6: [
    { pcoinCost: 40500, incomeBonus: 7500 },
    { pcoinCost: 50600, incomeBonus: 9400 },
    { pcoinCost: 63200, incomeBonus: 11800 },
    { pcoinCost: 79000, incomeBonus: 14800 },
    { pcoinCost: 98800, incomeBonus: 18600 },
  ],
  // 7 - 6 этаж
  7: [
    { pcoinCost: 120000, incomeBonus: 22800 },
    { pcoinCost: 150000, incomeBonus: 28600 },
    { pcoinCost: 187000, incomeBonus: 35800 },
    { pcoinCost: 235000, incomeBonus: 45400 },
    { pcoinCost: 293000, incomeBonus: 57400 },
  ],
  // 8 - 7 этаж
  8: [
    { pcoinCost: 365000, incomeBonus: 72400 },
    { pcoinCost: 456000, incomeBonus: 91000 },
    { pcoinCost: 570000, incomeBonus: 114400 },
    { pcoinCost: 713000, incomeBonus: 145000 },
    { pcoinCost: 890000, incomeBonus: 183000 },
  ],
  // 9 - 8 этаж
  9: [
    { pcoinCost: 1000000, incomeBonus: 208000 },
    { pcoinCost: 1200000, incomeBonus: 254000 },
    { pcoinCost: 1560000, incomeBonus: 334000 },
    { pcoinCost: 2000000, incomeBonus: 433000 },
    { pcoinCost: 2500000, incomeBonus: 550000 },
  ],
};

// Функция для получения данных улучшения для конкретного этажа
export const getFloorUpgradeData = (floorId: number): FloorUpgradeLevel[] => {
  return floorUpgradeData[floorId] || [];
};

// Функция для получения стоимости улучшения для текущего уровня
export const getCurrentUpgradeCost = (
  floorId: number,
  currentLevel: number
): number => {
  const upgrades = getFloorUpgradeData(floorId);
  if (currentLevel >= upgrades.length) return 0;
  return upgrades[currentLevel]?.pcoinCost || 0;
};

// Функция для получения бонуса дохода для текущего уровня
export const getCurrentIncomeBonus = (
  floorId: number,
  currentLevel: number
): number => {
  const upgrades = getFloorUpgradeData(floorId);
  if (currentLevel >= upgrades.length) return 0;
  return upgrades[currentLevel]?.incomeBonus || 0;
};