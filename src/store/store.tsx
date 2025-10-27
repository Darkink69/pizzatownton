import { makeAutoObservable, runInAction } from "mobx";
import type {
  TgUser,
  UserState,
  WsRequest,
  BankCreateOrderData,
  BankOrderViewData,
} from "../types/ws";

const DEFAULT_CDN_URL =
  "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

const ENV_IMG_URL = import.meta.env.VITE_IMG_URL as string | undefined;
const RUNTIME_IMG_URL =
  typeof window !== "undefined"
    ? ((window as any).__IMG_URL__ as string | undefined)
    : undefined;
const LOCAL_ASSETS =
  typeof window !== "undefined"
    ? `${window.location.origin}/assets/`
    : "/assets/";

const RAW_IMG_URL =
  ENV_IMG_URL || RUNTIME_IMG_URL || DEFAULT_CDN_URL || LOCAL_ASSETS;
const IMG_URL = RAW_IMG_URL.endsWith("/") ? RAW_IMG_URL : `${RAW_IMG_URL}/`;

class Store {
  // ——— Статика ———
  imgUrl: string = IMG_URL;

  // Контекст Telegram/WebApp
  initDataRaw: string = "";
  referrerId: string | null = null;
  startParam: string | null = null;

  // Сессия
  sessionId: string | null = null;

  // Авторизация
  isAuthenticating = false;
  authError: string | null = null;

  // Пользователь
  user: TgUser = {};
  userState: UserState = {};

  // Этажи
  floors: any[] = [];
  floorsLoaded = false;

  // Банк
  bank = {
    creating: false,
    error: null as string | null,
    lastOrderId: null as string | null,
    order: null as BankOrderViewData | null,
  };

  // WebSocket отправка
  private wsSend: ((rq: WsRequest) => void) | null = null;
  tonBalance: any;

  constructor() {
    makeAutoObservable(this);
  }

  // ——— Setters ———
  setWsSender(fn: (rq: WsRequest) => void) {
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

  setSessionId(sessionId: string | null | undefined) {
    this.sessionId = sessionId ?? null;
  }

  setAuthError(message: string | null) {
    this.authError = message;
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

  // Авторизация
  async authenticateUser(initDataRaw: string, _referralCode: string | null) {
    this.authError = null;
    this.isAuthenticating = true;
    this.initDataRaw = initDataRaw;
    try {
      // AUTH_INIT уходит через WebSocketComponent
    } finally {
      this.isAuthenticating = false;
    }
  }

  // ——— Floors ———
  private ensureWs() {
    if (!this.wsSend) throw new Error("WS sender is not set");
    if (!this.sessionId) throw new Error("No session");
  }

  requestFloors() {
    try {
      this.ensureWs();
      this.wsSend!({
        type: "FLOORS_GET",
        requestId: genId(),
        session: this.sessionId!,
      });
    } catch (e) {
      console.warn("FLOORS_GET send failed:", e);
    }
  }

  buyFloor(floorNumber: number) {
    try {
      this.ensureWs();
      this.wsSend!({
        type: "FLOORS_BUY",
        requestId: genId(),
        session: this.sessionId!,
        floorsBuyRq: { floorNumber },
      });
    } catch (e) {
      console.warn("FLOORS_BUY send failed:", e);
    }
  }

  upgradeFloor(floorNumber: number) {
    try {
      this.ensureWs();
      this.wsSend!({
        type: "FLOORS_UPGRADE",
        requestId: genId(),
        session: this.sessionId!,
        floorsUpgradeRq: { floorNumber },
      });
    } catch (e) {
      console.warn("FLOORS_UPGRADE send failed:", e);
    }
  }

  // ——— Claim ———
  claimDo() {
    try {
      this.ensureWs();
      const tgId =
        (this.user?.telegramId as number | undefined) ||
        (this.user?.id as number | undefined) ||
        0;

      this.wsSend!({
        type: "CLAIM_DO",
        requestId: genId(),
        session: this.sessionId!,
        claimDoRq: { telegramId: tgId },
      });
    } catch (e) {
      console.warn("CLAIM_DO send failed:", e);
    }
  }

  // ——— BANK ———

  bankCreateOrder(amountPCoin: number) {
    this.bank.error = null;
    try {
      this.ensureWs();
      this.bank.creating = true;

      const comment = this.generateOrderComment();

      this.wsSend!({
        type: "BANK_BUY_PCOIN",
        requestId: genId(),
        session: this.sessionId!,
        bankBuyPCoinRq: {
          amountPCoin: Math.floor(amountPCoin),
          comment,
        },
      });
    } catch (e) {
      this.bank.creating = false;
      this.bank.error = "Не удалось создать заказ";
    }
  }

  // Пример: ORD-6F8C21
  private generateOrderComment(): string {
    return `ORD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }

  bankOnOrderCreated(d: BankCreateOrderData) {
    this.bank.creating = false;
    this.bank.lastOrderId = d.operationId;
    this.bank.order = {
      operationId: d.operationId,
      status: "NEW",
      amountTon: d.amountTon,
      rate: d.rate,
      expiresAt: d.expiresAt,
    };
  }

  bankRequestOrderView() {
    if (!this.bank.lastOrderId) return;
    try {
      this.ensureWs();
      this.wsSend!({
        type: "BANK_ORDER_GET",
        requestId: genId(),
        session: this.sessionId!,
        bankOrderGetRq: { operationId: this.bank.lastOrderId },
      });
    } catch (e) {
      console.warn("BANK_ORDER_GET failed:", e);
    }
  }

  bankOnOrderView(d: BankOrderViewData) {
    this.bank.order = { ...(this.bank.order || {}), ...d };
  }

  bankConfirm(txHash: string) {
    if (!this.bank.lastOrderId) return;
    try {
      this.ensureWs();
      this.wsSend!({
        type: "BANK_CONFIRM",
        requestId: genId(),
        session: this.sessionId!,
        bankConfirmRq: {
          operationId: this.bank.lastOrderId,
          txHash,
        },
      });
    } catch (e) {
      this.bank.error = "Ошибка подтверждения оплаты";
    }
  }

  bankOnConfirmed(newBalances?: Partial<UserState>) {
    if (newBalances) this.setUserState(newBalances);
  }

  // ——— Reset session ———
  resetSession() {
    this.sessionId = null;
    this.user = {};
    this.userState = {};
    this.floors = [];
    this.floorsLoaded = false;
    this.isAuthenticating = false;
    this.authError = null;
    this.bank = {
      creating: false,
      error: null,
      lastOrderId: null,
      order: null,
    };
  }
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default new Store();
