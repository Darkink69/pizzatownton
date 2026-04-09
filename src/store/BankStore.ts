import { makeAutoObservable } from "mobx";
import store from "./store.tsx";
import type {WsRequest} from "../types/ws.ts";

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
  lastBuyAt: number = 0;
  entryOrder: BankOrder | null = null;
  entryCreating = false;
  entryError: string | null = null;

  constructor() {
    makeAutoObservable(this);
    const saved = localStorage.getItem("lastBuyAt");
    if (saved) this.lastBuyAt = parseInt(saved);
  }

  get buyCooldown(): number {
    const diff = Math.floor((Date.now() - this.lastBuyAt) / 1000);
    return diff < 10 ? 10 - diff : 0;
  }

  get canBuy(): boolean {
    return this.buyCooldown === 0 && !this.creating;
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


  async createEntryOrder() {
    if (this.entryCreating) return;

    this.entryCreating = true;
    this.error = null;

    const tgId = store.user.telegramId ?? store.user.id;
    const session = store.sessionId;

    if (!tgId || !session) {
      this.error = "Нет sessionId или telegramId";
      this.entryCreating = false;
      return;
    }

    const tonComment = this.generateOrderComment(); // ORD-XXXXXX
    const requestId = `entry_${Math.random().toString(36).slice(2, 10)}`;

    const rq = {
      type: "BANK_BUY_ENTRY",
      requestId,
      session,
      createOrderRq: {
        telegramId: tgId,
        amountPcoin: 1,
        tonComment,
      },
    };

    const ok = store.send(rq as any);
    if (!ok) {
      this.error = "Ошибка: WebSocket не подключён";
      this.entryCreating = false;
    }

    // entryCreating сбросим когда придёт ответ в обработчике WS
  }

  // ------------------------------------------------------------------------
  // 💸 ПОКУПКА PCoin
  // ------------------------------------------------------------------------

  async createOrder(amountPcoin: number) {
    if (!this.canBuy) {
      const wait = this.buyCooldown;
      this.error = `Подождите ${wait}с до следующей покупки`;
      console.warn(this.error);
      return;
    }

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


      // Запускаем кулдаун
      this.lastBuyAt = Date.now();
      localStorage.setItem("lastBuyAt", String(this.lastBuyAt));

      console.log(
          "🪙 Отправлен запрос на создание ордера PCoin:",
          amountPcoin,
          "— кулдаун активирован"
      );

      // Ответ придёт в websocket.tsx → case "BANK_BUY_PCOIN"
      console.log("🪙 Отправлен запрос на создание ордера PCoin:", amountPcoin);
    } catch (e: any) {
      console.error("CREATE_ORDER_ERROR (WS):", e);
      this.error = e?.message ?? "Ошибка при создании заказа";
    } finally {
      this.creating = false; // важно сбрасывать, иначе canBuy остаётся false
    }
  }

  // ------------------------------------------------------------------------
// 🔁 ОБМЕН PDollar → PCoin
// ------------------------------------------------------------------------
  async exchangePdollarToPcoin(amountPDollar: number) {
    this.creating = true;
    this.error = null;

    const amountInt = Math.floor(Number(amountPDollar) || 0);
    if (amountInt <= 0) {
      this.error = "Некорректная сумма";
      this.creating = false;
      return;
    }

    const tgId = store.user.telegramId ?? store.user.id;
    const session = store.sessionId;

    if (!session || !tgId) {
      this.error = "Нет sessionId или telegramId";
      this.creating = false;
      return;
    }

    const rq: WsRequest = {
      type: "BANK_EXCHANGE_PDOLLAR_TO_PCOIN",
      requestId: `ex_pd_pc_${Math.random().toString(36).slice(2, 10)}`,
      session,
      pdollarToPcoinExchangeRq: {
        telegramId: tgId,
        amountPDollar: amountInt,
      },
    };

    const ok = store.send(rq);
    if (!ok) {
      this.error = "Ошибка: WebSocket не подключён.";
    }

    this.creating = false;
  }

  // ------------------------------------------------------------------------
  // 📤 РУЧНОЙ ВЫВОД PDollar → TON
  // ------------------------------------------------------------------------

  async createManualWithdraw(pdollarAmount: number) {
    this.creating = true;
    this.error = null;
    // ✅ tgId берём универсально
    const tgId = store.user.telegramId ?? store.user.id;
    if (!tgId) {
      this.error = "Нет telegramId";
      this.creating = false;
      return;
    }



    const requestId = `withdraw_${Math.random().toString(36).slice(2, 10)}`;

    const success = store.send({
      type: "BANK_MANUAL_WITHDRAW",
      requestId,
      session: store.sessionId!,
      manualWithdrawRq: {
        telegramId: tgId,
        username: store.user.username ?? "",
        firstName: store.user.firstName ?? "",
        pdollarAmount

      },
    });

    if (success) {
      console.log("📤 Запрос на ручной вывод PDollar отправлен:", pdollarAmount);
      this.creating = false;
    } else {
      this.error = "Ошибка при создании заявки: WebSocket не подключён.";
      this.creating = false;
    }
  }

  // ------------------------------------------------------------------------
  //  ПРОСМОТР СТАТУСА ОРДЕРА (например, PCoin‑оплата)
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