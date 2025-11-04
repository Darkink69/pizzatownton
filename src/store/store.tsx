import { makeAutoObservable, runInAction } from "mobx";
import type { TgUser, UserState, WsRequest } from "../types/ws";
import { bankStore } from "./BankStore";

class Store {
  imgUrl =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  initDataRaw = "";
  referrerId: string | null = null;
  startParam: string | null = null;
  private wsSend: ((rq: WsRequest) => void) | null = null;
  sessionId: string | null = null;
  isAuthenticating = false;
  authError: string | null = null;

  user: TgUser = {};
  userState: UserState = {};
  tonBalance: any = "0";
  adrss!: string;
  
  pcoin = 0;
  pdollar = 10000;
  pizza = 0;

  floors: any[] = [];
  floorsLoaded = false;

  userFloors = {
    success: true,
    message: "Ok",
    type: "FLOORS_GET",
    requestId: "019a2fb3-3584-736e-87c1-74d852bedeec",
    data: {
      floorList: [
        {
          floorId: 1,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 625,
          yieldPerHour: 104,
          yieldCurrency: "pdollar",
          floorName: "1 floor",
        },
        {
          floorId: 2,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 1250,
          yieldPerHour: 208,
          yieldCurrency: "pdollar",
          floorName: "2 floor",
        },
        {
          floorId: 3,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 2500,
          yieldPerHour: 416,
          yieldCurrency: "pdollar",
          floorName: "3 floor",
        },
        {
          floorId: 4,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 5000,
          yieldPerHour: 832,
          yieldCurrency: "pdollar",
          floorName: "4 floor",
        },
        {
          floorId: 5,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 10000,
          yieldPerHour: 1664,
          yieldCurrency: "pdollar",
          floorName: "5 floor",
        },
        {
          floorId: 6,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 20000,
          yieldPerHour: 3328,
          yieldCurrency: "pdollar",
          floorName: "6 floor",
        },
        {
          floorId: 7,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 40000,
          yieldPerHour: 6656,
          yieldCurrency: "pdollar",
          floorName: "7 floor",
        },
        {
          floorId: 8,
          level: 1,
          costCurrency: "pcoin",
          costAmount: 80000,
          yieldPerHour: 13312,
          yieldCurrency: "pdollar",
          floorName: "8 floor",
        },
      ],
      userFloorList: [
        {
          floorId: 1,
          level: 1,
          // costAmount: 625,
          upgradeAmount: 1000,
          yieldPerHour: 104,
          yieldCurrency: "pdollar",
          floorName: "1",
          floorType: "regular",
        }
      ],
      pdollarAmount: 0,
    },
  };

  bank = bankStore;

  constructor() {
    makeAutoObservable(this);
  }

  // Безопасный геттер для userFloorList
  get safeUserFloorList() {
    return this.userFloors?.data?.userFloorList || [];
  }

  // Безопасный геттер для floorList
  get safeFloorList() {
    return this.userFloors?.data?.floorList || [];
  }

  // Проверка загружены ли данные
  get areFloorsLoaded() {
    return !!this.userFloors?.data?.userFloorList;
  }

  // Геттер для текущего баланса
  get currentBalance() {
    return this.pdollar || 0;
  }

  // Функция проверки достаточности средств
  hasEnoughMoney(amount: number): boolean {
    return this.currentBalance >= amount;
  }

  // Функция списания денег
  deductMoney(amount: number): boolean {
    if (!this.hasEnoughMoney(amount)) {
      return false;
    }

    runInAction(() => {
      this.pdollar = this.currentBalance - amount;
    });

    return true;
  }

  // Функция добавления денег
  addMoney(amount: number) {
    runInAction(() => {
      this.pdollar = this.currentBalance + amount;
    });
  }

  // Обновление данных пользователя из CLAIM_DO
  updateUserData(userData: { pcoin?: number; pdollar?: number; pizza?: number }) {
    runInAction(() => {
      if (userData.pcoin !== undefined) this.pcoin = userData.pcoin;
      if (userData.pdollar !== undefined) this.pdollar = userData.pdollar;
      if (userData.pizza !== undefined) this.pizza = userData.pizza;
    });
  }

  // Обновление данных этажей из FLOORS_GET или FLOORS_BUY
setFloorsData(response: any) {
  runInAction(() => {
    // Полностью заменяем данные на те, что пришли с сервера
    this.userFloors = response;
    
    // Обновляем балансы из ответа
    if (response.data?.pdollarAmount !== undefined) {
      this.pdollar = response.data.pdollarAmount;
    }
    if (response.data?.pcoinAmount !== undefined) {
      this.pcoin = response.data.pcoinAmount;
    }
    if (response.data?.pizzaAmount !== undefined) {
      this.pizza = response.data.pizzaAmount;
    }
  });
}

  setWsSend(fn: (rq: WsRequest) => void) {
    this.wsSend = fn;
  }

  setInitDataRaw(data: string) {
    this.initDataRaw = data;
  }

  setReferralContext(startParam: string | null, referrerId: string | null) {
    runInAction(() => {
      this.startParam = startParam;
      this.referrerId = referrerId;
    });
  }

  setUser(user?: TgUser) {
    this.user = user ?? {};
  }

  setUserState(userState?: UserState) {
    if (!userState) return;
    runInAction(() => {
      this.userState = { ...this.userState, ...userState };
    });
  }

  setSessionId(sessionId?: string | null) {
    this.sessionId = sessionId ?? null;
    this.bank.setSession(this.sessionId ?? null);
  }

  setAuthError(message: string | null) {
    this.authError = message;
  }

  setAdrss(adrss: string) {
    this.adrss = adrss;
  }

  setTonBalance(balanceTon: string) {
    this.tonBalance = balanceTon;
  }

  send(rq: WsRequest): boolean {
    if (!this.wsSend) {
      console.warn("WS is not connected — send aborted:", rq?.type);
      return false;
    }
    this.wsSend(rq);
    return true;
  }

  // Принудительный запрос данных этажей
  requestFloorsData() {
    if (this.wsSend && this.sessionId && this.user?.telegramId) {
      this.wsSend({
        type: "FLOORS_GET",
        requestId: genId(),
        session: this.sessionId,
        getFloorRq: {
          telegramId: this.user.telegramId,
        },
      });
      return true;
    }
    return false;
  }

  // Отправка CLAIM_DO запроса
  sendClaimDo() {
    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      this.wsSend!({
        type: "CLAIM_DO",
        requestId: genId(),
        session: this.sessionId!,
        claimDoRq: { telegramId: tgId },
      });
      return true;
    } catch (e) {
      console.warn("CLAIM_DO error:", e);
      return false;
    }
  }

  hydrateFromAuthInit(payload?: {
    sessionId?: string;
    user?: TgUser;
    userState?: UserState;
  }) {
    if (!payload) return;
    if (payload.sessionId !== undefined) this.setSessionId(payload.sessionId);
    this.setUser(payload.user);
    if (payload.userState) this.setUserState(payload.userState);
  }

  async authenticateUser(initDataRaw: string, _referralCode: string | null) {
    this.authError = null;
    this.isAuthenticating = true;
    this.initDataRaw = initDataRaw;
    try {
    } finally {
      this.isAuthenticating = false;
    }
  }

  private ensureWs() {
    if (!this.wsSend) throw new Error("WS sender is not set");
    if (!this.sessionId) throw new Error("No session id");
  }

  // Получение стоимости улучшения для этажа
getUpgradeCost(floorId: number): number {
  const floor = this.safeUserFloorList.find(f => f.floorId === floorId);
  return floor?.upgradeAmount || 0;
}

 // Покупка этажа через вебсокет
buyNewFloor(floorId: number) {
  runInAction(() => {
    const existingFloor = this.safeUserFloorList.find(
      floor => floor.floorId === floorId
    );
    
    if (existingFloor) {
      console.warn(`Этаж ${floorId} уже куплен`);
      return false;
    }

    const floorTemplate = this.safeFloorList.find(
      floor => floor.floorId === floorId
    );

    if (!floorTemplate) {
      console.warn(`Шаблон для этажа ${floorId} не найден`);
      return false;
    }

    if (!this.hasEnoughMoney(floorTemplate.costAmount)) {
      console.warn(`Недостаточно денег для покупки этажа ${floorId}`);
      return false;
    }

    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      this.wsSend!({
        type: "FLOORS_BUY",
        requestId: genId(),
        session: this.sessionId!,
        buyFloorRq: {
          floorId: floorId,
          telegramId: tgId,
        },
      });

      this.deductMoney(floorTemplate.costAmount);

      // Создаем новый этаж с временным upgradeAmount (0)
      // Сервер пришлет актуальное значение в ответе FLOORS_BUY
      const newFloor = {
        floorId: floorId,
        level: 1,
        costAmount: floorTemplate.costAmount,
        upgradeAmount: 0, // Временное значение, будет обновлено сервером
        yieldPerHour: floorTemplate.yieldPerHour,
        yieldCurrency: floorTemplate.yieldCurrency,
        floorName: `${floorId}`,
        floorType: "regular",
      };

      const newUserFloorList = [...this.safeUserFloorList, newFloor];
      newUserFloorList.sort((a, b) => a.floorId - b.floorId);
      
      this.userFloors = {
        ...this.userFloors,
        data: {
          ...this.userFloors.data,
          userFloorList: newUserFloorList
        }
      };

      return true;
    } catch (e) {
      console.warn("FLOORS_BUY failed", e);
      return false;
    }
  });
}


// Улучшение этажа через вебсокет
upgradeFloor(floorId: number) {
  runInAction(() => {
    const floor = this.safeUserFloorList.find(f => f.floorId === floorId);
    
    if (!floor) {
      console.warn(`Этаж ${floorId} не найден`);
      return false;
    }

    if (floor.level >= 5) {
      console.warn(`Этаж ${floorId} уже имеет максимальный уровень`);
      return false;
    }

    const upgradeCost = this.getUpgradeCost(floorId);

    if (!this.hasEnoughMoney(upgradeCost)) {
      console.warn(`Недостаточно денег для улучшения этажа ${floorId}`);
      return false;
    }

    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      
      // Отправляем запрос на улучшение - сервер пришлет обновленные данные
      this.wsSend!({
        type: "FLOORS_UPGRADE",
        requestId: genId(),
        session: this.sessionId!,
        upgradeFloorRq: {
          floorId: floorId,
          telegramId: tgId,
        },
      });

      // Локально списываем деньги (сервер подтвердит операцию)
      this.deductMoney(upgradeCost);

      return true;
    } catch (e) {
      console.warn("FLOORS_UPGRADE failed", e);
      return false;
    }
  });
}

  canBuyFloor(floorId: number): boolean {
    const existingFloor = this.safeUserFloorList.find(
      floor => floor.floorId === floorId
    );
    
    if (existingFloor) {
      return false;
    }

    const floorTemplate = this.safeFloorList.find(
      floor => floor.floorId === floorId
    );

    if (!floorTemplate) {
      return false;
    }

    return this.hasEnoughMoney(floorTemplate.costAmount);
  }

  getFloorCost(floorId: number): number {
    const floorTemplate = this.safeFloorList.find(
      floor => floor.floorId === floorId
    );
    return floorTemplate ? floorTemplate.costAmount : 0;
  }

  canUpgradeFloor(floorId: number): boolean {
    const floor = this.safeUserFloorList.find(
      floor => floor.floorId === floorId
    );
    
    if (!floor) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost(floorId);
    return floor.level < 5 && this.hasEnoughMoney(upgradeCost);
  }

  getFloorById(floorId: number) {
    return this.safeUserFloorList.find(floor => floor.floorId === floorId);
  }

  // Старая функция для совместимости
  sendFloorsBuy(floorId: number) {
    this.buyNewFloor(floorId);
    return true;
  }

  resetSession() {
    runInAction(() => {
      this.sessionId = null;
      this.user = {};
      this.userState = {};
      this.floors = [];
      this.floorsLoaded = false;
      this.authError = null;
      this.pcoin = 0;
      this.pdollar = 0;
      this.pizza = 0;
      this.userFloors = {
        ...this.userFloors,
        data: {
          ...this.userFloors.data,
          userFloorList: [
            {
              floorId: 1,
              level: 1,
              upgradeAmount: 1000,
              yieldPerHour: 104,
              yieldCurrency: "pdollar",
              floorName: "1",
              floorType: "regular",
            }
          ],
        }
      };
    });
    this.bank.reset();
  }
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default new Store();