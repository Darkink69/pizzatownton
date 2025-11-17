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

/**
 * MobX‑хранилище для всех операций банка (покупка PCoin, ручной вывод PDollar и т.п.)
 */
class BankStore {
  order: BankOrder | null = null;
  lastOrderId: string | null = null;
  creating = false;
  error: string | null = null;


  constructor() {
    makeAutoObservable(this);
  }

  /** Сброс состояния хранилища */
  reset() {
    this.order = null;
    this.lastOrderId = null;
    this.creating = false;
    this.error = null;
  }

  /** Вспомогательный метод для генерации комментария к TON‑транзакции */
  private generateOrderComment(): string {
    return `ORD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }

  // ------------------------------------------------------------------------
  // 💸 ПОКУПКА PCoin
  // ------------------------------------------------------------------------

  async createOrder(amountPcoin: number) {
    this.creating = true;
    this.error = null;
    const tonComment = this.generateOrderComment();
    const requestId = `ord_${Math.random().toString(36).slice(2, 10)}`;

    try {
      store.send({
        type: "BANK_BUY_PCOIN",
        requestId,
        session: store.sessionId!,
        createOrderRq: {
          telegramId: store.user.telegramId!,
          amountPcoin,
          tonComment,
        },
      });

      // Ответ придёт в websocket.tsx → case "BANK_BUY_PCOIN"
      console.log("🪙 Отправлен запрос на создание ордера PCoin:", amountPcoin);
    } catch (e: any) {
      console.error("CREATE_ORDER_ERROR (WS):", e);
      this.error = e?.message ?? "Ошибка при создании заказа";
      this.creating = false;
    }
  }

  // ------------------------------------------------------------------------
  // 📤 РУЧНОЙ ВЫВОД PDollar → TON
  // ------------------------------------------------------------------------

  async createManualWithdraw(pdollarAmount: number, tonAddress: string) {
    this.creating = true;
    this.error = null;
    const requestId = `withdraw_${Math.random().toString(36).slice(2, 10)}`;

    const success = store.send({
      type: "BANK_MANUAL_WITHDRAW",
      requestId,
      session: store.sessionId!,
      manualWithdrawRq: {
        telegramId: store.user.telegramId!,
        username: store.user.username ?? "",
        firstName: store.user.firstName ?? "",
        pdollarAmount,
        tonAddress,
      },
    });

    if (success) {
      console.log("📤 Запрос на ручной вывод PDollar отправлен:", pdollarAmount);
    } else {
      this.error = "Ошибка при создании заявки: WebSocket не подключён.";
      this.creating = false;
    }
  }

  // ------------------------------------------------------------------------
  // 🔁 ПРОСМОТР СТАТУСА ОРДЕРА (например, PCoin‑оплата)
  // ------------------------------------------------------------------------

  async fetchOrder(orderId: string) {
    const tgId = store.user.telegramId ?? store.user.id;
    const session = store.sessionId;

    if (!session || !tgId) {
      console.warn("⚠ Нет sessionId или telegramId — fetchOrder прерван");
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
      console.log("🔎 Проверка статуса ордера:", orderId);
    } catch (e: any) {
      console.warn("Ошибка WS‑запроса заказа:", e);
      this.error = e?.message ?? "Ошибка при запросе статуса ордера";
    }
  }
}

export const bankStore = new BankStore();