import { makeAutoObservable, runInAction } from "mobx";
import store from "./store.tsx";

// Типы DTO
export interface BankOrder {
  orderId: string;
  status: string;
  amountTon: string;
  rate: string;
  expiresAt: string;
  merchantAddress: string;
  comment: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

// BankStore
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
    const comment = this.generateOrderComment();
    this.error = null;

    const requestId = `ord_${Math.random().toString(36).slice(2, 10)}`;

    // Сохраниваем ожидание requestId
    try {
      store.send({
        type: "BANK_BUY_PCOIN",
        requestId,
        session: store.sessionId!,
        createOrderRq: {
          telegramId: store.user.telegramId!,
          amountPcoin,
          tonComment: comment,
        },
      });

      // Устанавливаем "заказ создаётся", пока не придет ответ,
      // который обработается в websocket.tsx через:
      // case "BANK_BUY_PCOIN" → store.setBankCreateOrder(parsed.data)

    } catch (e: any) {
      console.error("CREATE_ORDER_ERROR (WS):", e);
      this.error = e?.message ?? "Ошибка при создании заказа";
      this.creating = false;
    }
  }
  async fetchOrder(orderId: string) {
    if (!this.sessionId) {
      console.warn("Нет sessionId – BankStore.fetchOrder прерван");
      return;
    }
    try {
      const res = await fetch(`/api/bank/orders/${orderId}`, {
        headers: {
          "X-Session-Id": this.sessionId,
        },
      });
      if (!res.ok) {
        console.warn("Ошибка запроса заказа", res.status);
        return;
      }
      const data = await res.json();
      runInAction(() => {
        this.order = {
          orderId: data.orderId,
          status: data.status,
          amountTon: data.amountTon,
          rate: data.rate,
          expiresAt: data.expiresAt,
          merchantAddress: data.merchantAddr,
          comment: data.comment,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          txHash: data.txHash,
        };
      });
    } catch (e) {
      console.warn("Ошибка получения заказа:", e);
    }
  }
}

export const bankStore = new BankStore();
