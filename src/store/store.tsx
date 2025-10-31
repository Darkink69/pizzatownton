import { makeAutoObservable, runInAction } from "mobx";
import type { TgUser, UserState, WsRequest } from "../types/ws"; // ⛔️ Больше НЕ импортим Bank DTO
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
      ],
      userFloorList: [
        {
          floorId: 1,
          level: 1,
          yieldPerHour: 100,
          yieldCurrency: "pizza",
          floorName: "Basement",
          floorType: "basement",
        },
        {
          floorId: 2,
          level: 1,
          yieldPerHour: 84,
          yieldCurrency: "pdollar",
          floorName: "1 floor",
          floorType: "regular",
        },
      ],
      pdollarAmount: 250,
    },
  };

  bank = bankStore; // ✅ подключаем внешний стор

  constructor() {
    makeAutoObservable(this);
  }

  // Контекст + авторизация
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
    this.userState = { ...this.userState, ...userState };
  }

  setSessionId(sessionId?: string | null) {
    this.sessionId = sessionId ?? null;
    // Передаём session в BankStore тоже
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
      // AUTH_INIT идет через WebSocket
    } finally {
      this.isAuthenticating = false;
    }
  }

  private ensureWs() {
    if (!this.wsSend) throw new Error("WS sender is not set");
    if (!this.sessionId) throw new Error("No session id");
  }

  // Этажи
  requestFloors() {
    try {
      this.ensureWs();
      this.wsSend!({
        type: "FLOORS_GET",
        requestId: genId(),
        session: this.sessionId!,
      });
    } catch (e) {
      console.warn("FLOORS_GET failed", e);
    }
  }

  setFloorsData(d: any) {
    this.userFloors = d;
  }

  // Клейм
  claimDo() {
    try {
      this.ensureWs();
      const tgId = this.user?.telegramId ?? this.user?.id ?? 0;
      this.wsSend!({
        type: "CLAIM_DO",
        requestId: genId(),
        session: this.sessionId!,
        claimDoRq: { telegramId: tgId },
      });
    } catch (e) {
      console.warn("CLAIM_DO error:", e);
    }
  }

  resetSession() {
    this.sessionId = null;
    this.user = {};
    this.userState = {};
    this.floors = [];
    this.floorsLoaded = false;
    this.authError = null;
    this.bank.reset(); // сбрасываем и банк
  }
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default new Store();
