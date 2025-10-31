import { makeAutoObservable } from "mobx";
import store from "./store.tsx";

// Типы DTO
export interface BankOrder {
  orderId: string;
  status: string;
  amountTon: string;
  rate: string;
  expiresAt: string;
  merchantAddr: string;
  tonComment: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

class BankStore {
  order: BankOrder | null = null;
  lastOrderId: string | null = null;
  creating: boolean = false;
  error: string | null = null;
  sessionId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setSession(sessionId: string | null) {
    this.sessionId = sessionId;
  }

  reset() {
    this.order = null;
    this.lastOrderId = null;
    this.creating = false;
    this.error = null;
  }

  private generateOrderComment(): string {
    return `ORD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }

  async createOrder(amountPcoin: number) {
    this.creating = true;
    const tonComment = this.generateOrderComment();
    this.error = null;

    const requestId = `ord_${Math.random().toString(36).slice(2, 10)}`;

    try {
      store.send({
        type: "BANK_BUY_PCOIN",
        requestId,
        session: store.sessionId!,
        createOrderRq: {
          telegramId: store.user.telegramId!,
          amountPcoin,
          tonComment: tonComment,
        },
      });

      // После этого ответ придёт в websocket.tsx:
      // case "BANK_BUY_PCOIN" → store.setBankCreateOrder(parsed.data)
    } catch (e: any) {
      console.error("CREATE_ORDER_ERROR (WS):", e);
      this.error = e?.message ?? "Ошибка при создании заказа";
      this.creating = false;
    }
  }

  async fetchOrder(orderId: string) {
    const tgId = store.user.telegramId ?? store.user.id;
    const session = this.sessionId;

    if (!session || !tgId) {
      console.warn("Нет sessionId или telegramId — fetchOrder прерван");
      return;
    }

    const requestId = `confirm_${Math.random().toString(36).slice(2, 10)}`;

    try {
      store.send({
        type: "BANK_CONFIRM",
        requestId,
        session,
        confirmOrderRq: {
          orderId,
          telegramId: tgId,
        },
      });

      // Ответ придёт через websocket.tsx → case "BANK_CONFIRM"
      // и попадёт в setBankOrderView или другую обработку
    } catch (e: any) {
      console.warn("Ошибка WS-запроса заказа:", e);
    }
  }
}

export const bankStore = new BankStore();
