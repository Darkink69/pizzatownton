import {makeAutoObservable, runInAction} from "mobx";
import type {TgUser, UserFloor, UserState, WsRequest} from "../types/ws";
import {bankStore} from "./BankStore";

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
    adrss!: string;

    pcoin = 0;
    pdollar = 0;
    pizza = 0;

    floorsLoaded = false;

    userFloors = {
        success: false,
        message: "",
        type: "FLOORS_GET" as const,
        requestId: "",
        data: {
            userFloorList: [] as UserFloor[],
            pdollarAmount: 0,
            user: {} as TgUser,
        },
    };

    bank = bankStore;

    constructor() {
        makeAutoObservable(this);
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
    updateUserData(userData: { pcoin?: number; pdollar?: number; pizza?: number }) {
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

            runInAction(() => {

                // 🔹 Сначала обновляем балансы из бэка
                if (data.user) {
                    this.pcoin = Number(data.user.pcoin ?? this.pcoin);
                    this.pdollar = Number(data.user.pdollar ?? this.pdollar);
                    this.pizza = Number(data.user.pizza ?? this.pizza);
                }

                // 🔹 Нормализуем приходящий список этажей
                let list = Array.isArray(data.userFloorList)
                    ? data.userFloorList.map((f: any) => ({
                        ...f,
                        owned: f.owned ?? f.isOwned ?? false,
                    }))
                    : [];

                // 🔹 Basement всегда помечаем как купленный
                list = list.map((f: any) =>
                    f.floorId === 1
                        ? { ...f, owned: true, purchaseCost: null, upgradeCurrency: "stars" }
                        : f
                );

                this.userFloors = {
                    success: !!response.success,
                    message: response.message ?? "",
                    type: response.type ?? "FLOORS_GET",
                    requestId: response.requestId ?? "",
                    data: {
                        userFloorList: list,
                        pdollarAmount: Number(data.pdollarAmount ?? 0),
                        user: data.user ?? {},
                    },
                };

                this.floorsLoaded = true;
            });


            console.group("📊 Floors after normalization");
            this.safeUserFloorList.forEach(f => {
                console.log(
                    `id=${f.floorId} | owned=${f.owned} | cost=${f.purchaseCost} | cur=${f.upgradeCurrency}`
                );
            });
            console.groupEnd();

            console.log("🧱 Floors synced:", this.safeUserFloorList);
        } catch (e) {
            console.warn("setFloorsData failed:", e);
        }
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
    }

    setUserState(userState?: UserState) {
        if (!userState) return;
        runInAction(() => (this.userState = {...this.userState, ...userState}));
    }

    setSessionId(sessionId?: string | null) {
        this.sessionId = sessionId ?? null;
        this.bank.setSession(this.sessionId ?? null);
    }

    setAuthError(message: string | null) {
        this.authError = message;
    }

    setAdrss(a: string) {
        this.adrss = a;
    }

    setTonBalance(b: string) {
        this.tonBalance = b;
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
                getFloorRq: {telegramId: this.user.telegramId},
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
                claimDoRq: {telegramId: tgId, floorId},
            });

            return true;
        } catch (e) {
            console.warn("CLAIM_DO error:", e);
            return false;
        }
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
                this.userFloors.data.userFloorList =
                    this.safeUserFloorList.map((f) =>
                        f.floorId === floorId
                            ? { ...f, owned: true, purchaseCost: null }
                            : f
                    );
            });

            return true;
        } catch (e) {
            console.warn("FLOORS_BUY failed", e);
            return false;
        }
    }

    upgradeFloor(floorId: number): boolean {
        const floor = this.safeUserFloorList.find(f => f.floorId === floorId);
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
                updateFloorRq: {telegramId: tgId, floorId},
            });

            this.deductCurrency(cost, currency);

            runInAction(() => {
                this.userFloors.data.userFloorList =
                    this.safeUserFloorList.map((f: UserFloor) =>
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
        return this.safeUserFloorList.find(f => f.floorId === floorId);
    }

    canUpgradeFloor(floorId: number): boolean {
        const floor = this.getFloorById(floorId);
        if (!floor || !floor.owned || !floor.upgradeAmount) return false;
        return this.hasEnoughCurrency(floor.upgradeAmount, floor.upgradeCurrency ?? "pcoin");
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
    async authenticateUser(initDataRaw: string, referralCode: string | null): Promise<void> {
        this.authError = null;
        this.isAuthenticating = true;
        this.initDataRaw = initDataRaw;
        try {
            console.log("authenticateUser called", {initDataRaw, referralCode});
        } catch (err: any) {
            console.warn("authenticateUser error:", err);
            this.authError = "Ошибка при авторизации";
        } finally {
            runInAction(() => (this.isAuthenticating = false));
        }
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
            this.sessionId = null;
            this.user = {};
            this.userState = {};
            this.floorsLoaded = false;
            this.pcoin = 0;
            this.pdollar = 0;
            this.pizza = 0;
            this.userFloors = {
                ...this.userFloors,
                data: {userFloorList: [], pdollarAmount: 0, user: {}},
            };
        });
        this.bank.reset();
    }
}

function genId(): string {
    return Math.random().toString(36).slice(2, 10);
}

export default new Store();