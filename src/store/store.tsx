import { makeAutoObservable, runInAction } from "mobx";
import type { TgUser, UserFloor, UserState, WsRequest } from "../types/ws";
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

  tonBalance: string = "0";
  adrss: string = "Подключите кошелек чтобы увидеть адрес";

  pcoin = 0;
  pdollar = 0;
  pizza = 0;

  claimProgress = 0;

  floorsLoaded = false;

  referral = {
    totalReferrals: 0,
    earnedPcoin: 0,
    earnedPdollar: 0,
    link: "",
  };

  // ---------------- TASK: INVITE_3_FRIENDS ----------------
  taskInvite3Status: "idle" | "checking" | "verified" | "rewarded" | "error" =
    "idle";
  taskInvite3Error: string | null = null;

  staffData: any = null;
  userStaff: any = null;
  accountantEndTime: any;

  sendHireStaff(
    staffId: number,
    level?: number,
    subscription?: number,
    floorId?: number,
    staffName?: string
  ): boolean {
    if (!this.wsSend || !this.sessionId || !this.user?.telegramId) return false;

    //  для бухгалтера (floorId = 0)
    if (floorId === 0) {
      // подставляем правильные staffId из Redis/БД
      if (subscription === 7) staffId = 81;
      if (subscription === 14) staffId = 82;
      if (subscription === 30) staffId = 83;
    } else if (floorId && staffName && level) {
      // обычный случай Guard / Manager
      const nextId = this.getNextStaffId(floorId, staffName, level);
      if (nextId) staffId = nextId;
    }

    const rq = {
      type: "PERSON_BUY",
      requestId: genId(),
      session: this.sessionId,
      buyPersonRq: {
        telegramId: this.user.telegramId,
        staffId,
        level,
        subscription,
        floorId,
      },
    };
    this.wsSend(rq);
    console.log("✅ PERSON_BUY отправлен:", JSON.stringify(rq, null, 2));
    return true;
  }

  getNextStaffId(
    floorId: number,
    staffName: string,
    nextLevel: number
  ): number | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor || !Array.isArray(floor.staff)) return undefined;

    const current = floor.staff.find((s) => s.staffName === staffName);
    if (!current || !Array.isArray(current.upgradeStaff)) return undefined;

    const next = current.upgradeStaff.find((up) => up.level === nextLevel);

    console.group(`🔍 getNextStaffId debug`);
    console.log("floorId:", floorId);
    console.log("staffName:", staffName);
    console.log("nextLevel:", nextLevel);
    console.log("upgradeStaff:", current.upgradeStaff);
    console.log("nextFound:", next);
    console.groupEnd();

    if (next?.staff_id) return next.staff_id;

    return current.staffId;
  }

  updateClaimProgress(percent: string | number) {
    runInAction(() => {
      this.claimProgress = Number(percent) || 0;
    });
  }

  setReferralData(data: {
    totalReferrals?: number;
    earnedPcoin?: number;
    earnedPdollar?: number;
    link?: string;
  }) {
    runInAction(() => {
      this.referral.totalReferrals = Number(data.totalReferrals ?? 0);
      this.referral.earnedPcoin = Number(data.earnedPcoin ?? 0);
      this.referral.earnedPdollar = Number(data.earnedPdollar ?? 0);
      this.referral.link = data.link ?? "";
    });
  }

  requestReferralInfo() {
    if (this.wsSend && this.sessionId && this.user?.telegramId) {
      const rq: WsRequest = {
        type: "REFERRAL_GET",
        requestId: genId(),
        session: this.sessionId,
        referralGetRq: { telegramId: this.user.telegramId },
      };
      this.wsSend(rq);
      console.log("📨 REFERRAL_GET запрос отправлен:", rq);
      return true;
    }
    console.warn("⚠️ Не удалось отправить REFERRAL_GET");
    return false;
  }

  userFloors = {
    success: false,
    message: "",
    type: "FLOORS_GET" as const,
    requestId: "",
    data: {
      userFloorList: [] as UserFloor[],
      pdollarAmount: 0,
      pizzaAmount: 0,
      user: {} as TgUser,
    },
  };

  bank = bankStore;

  constructor() {
    makeAutoObservable(this);
    //  Восстанавливаем данные при старте
    const savedUser = localStorage.getItem("user");
    const savedStaff = localStorage.getItem("staffData");
    const savedFloors = localStorage.getItem("userFloors");

    if (savedUser) this.user = JSON.parse(savedUser);
    if (savedStaff) this.staffData = JSON.parse(savedStaff);
    if (savedFloors) this.userFloors = JSON.parse(savedFloors);

    const savedAccountant = localStorage.getItem("accountantData");
    if (savedAccountant) {
      try {
        this.userStaff = JSON.parse(savedAccountant);
        this.accountantEndTime = this.userStaff?.endDate ?? null;
      } catch (e) {
        console.warn("Ошибка чтения accountantData:", e);
      }
    }

    const savedTon = localStorage.getItem("tonBalance");
    if (savedTon) this.tonBalance = savedTon;
  }

  // -------------------------------------------------------------------------
  // BASIC GETTERS
  // -------------------------------------------------------------------------
  get safeUserFloorList(): UserFloor[] {
    return this.userFloors?.data?.userFloorList ?? [];
  }

  get areFloorsLoaded(): boolean {
    return this.userFloors?.success === true;
  }

  get currentBalance(): number {
    return this.pcoin ?? 0;
  }

  // -------------------------------------------------------------------------
  // CURRENCY OPERATIONS
  // -------------------------------------------------------------------------
  getCurrentBalanceForCurrency(currency: string): number {
    switch (currency) {
      case "pcoin":
        return this.pcoin;
      case "pizza":
      case "stars":
        return this.pizza;
      case "pdollar":
        return this.pdollar;
      default:
        return 0;
    }
  }

  hasEnoughCurrency(amount: number, currency: string): boolean {
    return this.getCurrentBalanceForCurrency(currency) >= amount;
  }

  deductCurrency(amount: number, currency: string): void {
    runInAction(() => {
      switch (currency) {
        case "pcoin":
          this.pcoin -= amount;
          break;
        case "pizza":
        case "stars":
          this.pizza -= amount;
          break;
        case "pdollar":
          this.pdollar -= amount;
          break;
      }
    });
  }

  // -------------------------------------------------------------------------
  // USER DATA
  // -------------------------------------------------------------------------
  updateUserData(userData: {
    pcoin?: number;
    pdollar?: number;
    pizza?: number;
  }) {
    runInAction(() => {
      if (userData.pcoin !== undefined) this.pcoin = userData.pcoin;
      if (userData.pdollar !== undefined) this.pdollar = userData.pdollar;
      if (userData.pizza !== undefined) this.pizza = userData.pizza;
    });
  }

  // -------------------------------------------------------------------------
  // FLOORS
  // -------------------------------------------------------------------------

  setFloorsData(payload: any) {
    try {
      const response = payload || {};
      const data = response.data || {};
      const incoming = data.userFloorList ?? [];

      runInAction(() => {
        // 1. Сохраняем бухгалтера в стор и в localStorage
        if (data.accountant !== undefined && data.accountant !== null) {
          this.userStaff = data.accountant;
          this.accountantEndTime = data.accountant.endDate ?? null;
          localStorage.setItem(
            "accountantData",
            JSON.stringify(data.accountant)
          );
        }

        if (data.user) {
          this.pcoin = Number(data.user.pcoin ?? this.pcoin);
          this.pdollar = Number(data.user.pdollar ?? this.pdollar);
          this.pizza = Number(
            // берём сначала pizzaAmount, потом user.pizza, потом текущее
            data.pizzaAmount ?? data.user.pizza ?? this.pizza
          );
        } else if (
          data.pizzaAmount !== undefined &&
          data.pizzaAmount !== null
        ) {
          this.pizza = Number(data.pizzaAmount);
        }

        if (data.pizzaAmount !== undefined && data.pizzaAmount !== null) {
          this.pizza = Number(data.pizzaAmount);
        }

        let normalized = Array.isArray(incoming)
          ? incoming.map((f: any) => ({
              ...f,
              owned: f.owned ?? f.isOwned ?? false,
              earned: f.earned ?? 0,
            }))
          : [];

        normalized = normalized.map((f: any) =>
          f.floorId === 1
            ? {
                ...f,
                owned: true,
                purchaseCost: null,
                upgradeCurrency: "stars",
              }
            : f
        );

        const merged = normalized.map((floor) => {
          const existing = this.safeUserFloorList.find(
            (x) => x.floorId === floor.floorId
          );

          // если сервер прислал staff → используем его
          const preservedStaff = Array.isArray(floor.staff)
            ? floor.staff
            : existing?.staff ?? [];

          const preservedBalance = existing?.balance ?? floor.balance ?? 0;

          return {
            ...floor,
            staff: preservedStaff,
            balance: preservedBalance,
          };
        });

        this.userFloors = {
          success: !!response.success,
          message: response.message ?? "",
          type: response.type ?? "FLOORS_GET",
          requestId: response.requestId ?? "",
          data: {
            userFloorList: merged,
            pdollarAmount: Number(data.pdollarAmount ?? 0),
            pizzaAmount: Number(data.pizzaAmount ?? 0),
            user: data.user ?? {},
            accountant: data.accountant ?? this.userStaff ?? null,
          } as any,
        };
        localStorage.setItem("userFloors", JSON.stringify(this.userFloors));
        this.floorsLoaded = true;
      });

      console.group("📊 Floors after fresh update from server");
      console.log("💰 pcoin сейчас:", this.pcoin);

      this.safeUserFloorList.forEach((f) => {
        console.log(
          `id=${f.floorId} | owned=${f.owned} | staff=${
            Array.isArray(f.staff) ? f.staff.length : "—"
          }`
        );
      });
      console.groupEnd();
    } catch (e) {
      console.warn("setFloorsData failed:", e);
    }
  }

  lastClaimRewards: {
    floorId: number;
    amount: number;
    currency: string;
  } | null = null;

  claimAnimations: { floorId: number; amount: number; currency: string }[] = [];

  addClaimAnimation(floorId: number, amount: number, currency: string) {
    this.claimAnimations.push({ floorId, amount, currency });
    // автоматически удалить через пару секунд
    setTimeout(() => {
      runInAction(() => {
        this.claimAnimations = this.claimAnimations.filter(
          (a) => a.floorId !== floorId
        );
      });
    }, 2000);
  }

  // -------------------------------------------------------------------------
  // WEBSOCKET / AUTH
  // -------------------------------------------------------------------------
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
    localStorage.setItem("user", JSON.stringify(this.user));
  }

  setUserState(userState?: UserState) {
    if (!userState) return;
    runInAction(() => (this.userState = { ...this.userState, ...userState }));
  }

  setSessionId(sessionId?: string | null) {
    this.sessionId = sessionId ?? null;
  }

  setAuthError(message: string | null) {
    this.authError = message;
  }

  setAdrss(a: string) {
    this.adrss = a;
  }

  setTonBalance(b: string) {
    runInAction(() => {
      this.tonBalance = b;
      localStorage.setItem("tonBalance", b);
    });
  }

  // -------------------------------------------------------------------------
  // SEND REQUESTS
  // -------------------------------------------------------------------------
  send(rq: WsRequest): boolean {
    if (!this.wsSend) {
      console.warn("WS not connected — send aborted:", rq?.type);
      return false;
    }
    this.wsSend(rq);
    return true;
  }

  requestFloorsData() {
    if (this.wsSend && this.sessionId && this.user?.telegramId) {
      this.wsSend({
        type: "FLOORS_GET",
        requestId: genId(),
        session: this.sessionId,
        getFloorRq: { telegramId: this.user.telegramId },
      });
      return true;
    }
    return false;
  }

  sendClaimDo(floorId: number) {
    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;

      this.wsSend!({
        type: "CLAIM_DO",
        requestId: genId(),
        session: this.sessionId!,
        claimDoRq: { telegramId: tgId, floorId },
      });

      return true;
    } catch (e) {
      console.warn("CLAIM_DO error:", e);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // TASKS: INVITE_3_FRIENDS
  // -------------------------------------------------------------------------
  verifyInvite3Task() {
    if (!this.wsSend || !this.sessionId || !this.user?.telegramId) {
      console.warn("⚠️ Не удалось отправить TASKS_VERIFY — нет сессии или ws");
      return;
    }

    runInAction(() => {
      this.taskInvite3Status = "checking";
      this.taskInvite3Error = null;
    });

    const rq: WsRequest = {
      type: "TASKS_VERIFY",
      requestId: genId(),
      session: this.sessionId!,
      taskRq: {
        telegramId: this.user.telegramId!,
        code: "INVITE_3_FRIENDS",
      },
    };

    console.log("📨 TASKS_VERIFY INVITE_3_FRIENDS:", rq);
    this.wsSend(rq);
  }

  completeInvite3Task() {
    if (!this.wsSend || !this.sessionId || !this.user?.telegramId) {
      console.warn(
        "⚠️ Не удалось отправить TASKS_COMPLETE — нет сессии или ws"
      );
      return;
    }

    if (this.taskInvite3Status !== "verified") {
      console.warn("⚠️ TASKS_COMPLETE возможен только после verified");
      return;
    }

    const rq: WsRequest = {
      type: "TASKS_COMPLETE",
      requestId: genId(),
      session: this.sessionId!,
      taskRq: {
        telegramId: this.user.telegramId!,
        code: "INVITE_3_FRIENDS",
      },
    };

    console.log("📨 TASKS_COMPLETE INVITE_3_FRIENDS:", rq);
    this.wsSend(rq);
  }

  resetInvite3TaskState() {
    runInAction(() => {
      this.taskInvite3Status = "idle";
      this.taskInvite3Error = null;
    });
  }

  // -------------------------------------------------------------------------
  // FLOORS OPERATIONS
  // -------------------------------------------------------------------------
  buyNewFloor(floorId: number): boolean {
    const floor = this.getFloorById(floorId);

    // ⛔ Basement не покупаем
    if (!floor || floorId === 1 || floor.owned) return false;

    const price = Number(floor.purchaseCost ?? 0);
    const currency = floor.upgradeCurrency ?? "pcoin";

    if (price <= 0) return false;
    if (!this.hasEnoughCurrency(price, currency)) {
      console.warn(`Недостаточно ${currency} для покупки этажа ${floorId}`);
      return false;
    }

    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      this.wsSend!({
        type: "FLOORS_BUY",
        requestId: genId(),
        session: this.sessionId!,
        buyFloorRq: { telegramId: tgId, floorId },
      });

      this.deductCurrency(price, currency);

      // обновляем массив этажей
      runInAction(() => {
        this.userFloors.data.userFloorList = this.safeUserFloorList.map((f) =>
          f.floorId === floorId ? { ...f, owned: true, purchaseCost: null } : f
        );
      });

      return true;
    } catch (e) {
      console.warn("FLOORS_BUY failed", e);
      return false;
    }
  }

  upgradeFloor(floorId: number): boolean {
    const floor = this.safeUserFloorList.find((f) => f.floorId === floorId);
    if (!floor || !floor.owned || !floor.upgradeAmount) return false;

    const cost = floor.upgradeAmount;
    const currency = floor.upgradeCurrency ?? "pcoin";

    if (!this.hasEnoughCurrency(cost, currency)) {
      console.warn(`Недостаточно ${currency} для апгрейда этажа ${floorId}`);
      return false;
    }

    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      this.wsSend!({
        type: "FLOORS_UPGRADE",
        requestId: genId(),
        session: this.sessionId!,
        updateFloorRq: { telegramId: tgId, floorId },
      });

      this.deductCurrency(cost, currency);

      runInAction(() => {
        this.userFloors.data.userFloorList = this.safeUserFloorList.map(
          (f: UserFloor) =>
            f.floorId === floorId
              ? { ...f, owned: true, purchaseCost: null }
              : f
        );
      });
      return true;
    } catch (e) {
      console.warn("FLOORS_UPGRADE failed", e);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // GETTERS / CHECKERS
  // -------------------------------------------------------------------------
  getFloorById(floorId: number): UserFloor | undefined {
    return this.safeUserFloorList.find((f) => f.floorId === floorId);
  }

  canUpgradeFloor(floorId: number): boolean {
    const floor = this.getFloorById(floorId);
    if (!floor || !floor.owned || !floor.upgradeAmount) return false;
    return this.hasEnoughCurrency(
      floor.upgradeAmount,
      floor.upgradeCurrency ?? "pcoin"
    );
  }

  getFloorCost(floorId: number): number {
    return this.getFloorById(floorId)?.purchaseCost ?? 0;
  }

  getUpgradeCost(floorId: number): number {
    return this.getFloorById(floorId)?.upgradeAmount ?? 0;
  }

  canBuyFloor(floorId: number): boolean {
    const floor = this.getFloorById(floorId);
    if (!floor || floorId === 1 || floor.owned) return false;

    const price = Number(floor.purchaseCost ?? 0);
    const currency = floor.upgradeCurrency ?? "pcoin";

    return price > 0 && this.hasEnoughCurrency(price, currency);
  }

  // -------------------------------------------------------------------------
  // AUTHENTICATION STUB
  // -------------------------------------------------------------------------
  async authenticateUser(
    initDataRaw: string,
    referralCode: string | null
  ): Promise<void> {
    this.authError = null;
    this.isAuthenticating = true;
    this.initDataRaw = initDataRaw;
    try {
      console.log("authenticateUser called", { initDataRaw, referralCode });
    } catch (err: any) {
      console.warn("authenticateUser error:", err);
      this.authError = "Ошибка при авторизации";
    } finally {
      runInAction(() => (this.isAuthenticating = false));
    }
  }

  // -------------------------------------------------------------------------
  // STAFF UPDATE
  // -------------------------------------------------------------------------
  updateAfterStaffBuy(data: any) {
    if (!data?.userStaff) return;
    const { userStaff, user } = data;

    runInAction(() => {
      // 🔹 Специальная ветка: бухгалтер (floorId = 0)
      if (userStaff.floorId === 0 && userStaff.staffName === "Accountant") {
        this.userStaff = userStaff; // сохраняем отдельно
        this.accountantEndTime = userStaff.endDate;
        console.log(
          `💼 Accountant обновлён: длительность ${userStaff.durationDay} дн., до ${userStaff.endDate}`
        );
        //  Выходим из метода, бухгалтер не принадлежит этажу
        return;
      }
      // ищем нужный этаж
      const floor = this.safeUserFloorList.find(
        (f) => f.floorId === userStaff.floorId
      );
      if (!floor) {
        console.warn(
          `⚠️ Этаж ${userStaff.floorId} не найден для обновления staff`
        );
        return;
      }

      // гарантируем, что floor.staff — массив
      if (!Array.isArray(floor.staff)) {
        floor.staff = [];
      }

      // Находим или создаём персонажа по имени
      let staff = floor.staff.find((s) => s.staffName === userStaff.staffName);
      if (!staff) {
        staff = {
          staffId: userStaff.staffId,
          staffName: userStaff.staffName,
          staffLevel: userStaff.staffLevel ?? 1,
          startDate: userStaff.startDate,
          endDate: userStaff.endDate,
          durationDay: userStaff.durationDay,
          upgradeStaff: [],
          accountantLevel: userStaff.accountantLevel,
          owned: true,
        };
        floor.staff.push(staff);
      } else {
        staff.staffId = userStaff.staffId;
        staff.staffLevel = userStaff.staffLevel ?? staff.staffLevel;
        staff.startDate = userStaff.startDate;
        staff.endDate = userStaff.endDate;
        staff.owned = true;
      }

      // 🧩 гарантируем наличие обеих ролей (Guard / Manager)
      const roles = ["Guard", "Manager"];
      const staffList = floor.staff ?? (floor.staff = []); // создаём или берём существующий массив
      for (const role of roles) {
        if (!staffList.find((s) => s.staffName === role)) {
          staffList.push({
            staffId: 0,
            staffName: role,
            staffLevel: 0,
            startDate: null,
            endDate: null,
            durationDay: null,
            upgradeStaff: [],
            accountantLevel: [],
            owned: false,
          });
        }
      }

      // 🔁 обновляем балансы пользователя, если сервер прислал fresh‑данные
      if (user) {
        if (user.pcoin !== undefined) this.pcoin = user.pcoin;
        if (user.pdollar !== undefined) this.pdollar = user.pdollar;
        if (user.pizza !== undefined) this.pizza = user.pizza;
      }

      console.log(
        `🧍 ${userStaff.staffName} обновлён/добавлен: lvl=${userStaff.staffLevel}, floor=${userStaff.floorId}`
      );
    });
  }

  // -------------------------------------------------------------------------
  // SYSTEM & RESET
  // -------------------------------------------------------------------------
  private ensureWs() {
    if (!this.wsSend) throw new Error("WS sender is not set");
    if (!this.sessionId) throw new Error("No session id");
  }

  resetSession() {
    runInAction(() => {
      // очищаем все текущие данные в MobX
      this.sessionId = null;
      this.user = {};
      this.userState = {};
      this.floorsLoaded = false;

      this.pcoin = 0;
      this.pdollar = 0;
      this.pizza = 0;

      this.userFloors = {
        success: false,
        message: "",
        type: "FLOORS_GET",
        requestId: "",
        data: {
          userFloorList: [],
          pdollarAmount: 0,
          pizzaAmount: 0,
          user: {},
        },
      };

      this.staffData = null;
      this.userStaff = null;
      this.referral = {
        totalReferrals: 0,
        earnedPcoin: 0,
        earnedPdollar: 0,
        link: "",
      };
      this.taskInvite3Status = "idle";
      this.taskInvite3Error = null;
      this.claimProgress = 0;
    });

    // сбрасываем внешние стейты
    this.bank.reset?.();

    // чистим локальный кэш
    localStorage.removeItem("user");
    localStorage.removeItem("userFloors");
    localStorage.removeItem("staffData");

    console.log("🧹 Сессия полностью сброшена");
  }
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default new Store();
