// import { makeAutoObservable, runInAction } from "mobx";

// Типы DTO
export interface BankOrder {
  orderId: string;
  status: string;
  amountTon: string;
  rate: string;
  expiresAt: string;
  merchantAddr: string;
  comment: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

// BankStore
class BankStore {
  //     order: BankOrder | null = null;
  //     lastOrderId: string | null = null;
  //     creating: boolean = false;
  //     error: string | null = null;
  //     sessionId: string | null = null;
  //     constructor() {
  //         makeAutoObservable(this);
  //     }
  //     setSession(sessionId: string | null) {
  //         this.sessionId = sessionId;
  //     }
  //     reset() {
  //         this.order = null;
  //         this.lastOrderId = null;
  //         this.creating = false;
  //         this.error = null;
  //     }
  //     private generateOrderComment(): string {
  //         return `ORD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  //     }
  //     async createOrder(amountPcoin: number) {
  //         if (!this.sessionId) {
  //             console.warn("Нет sessionId – BankStore.createOrder прерван");
  //             this.error = "Не авторизован";
  //             return;
  //         }
  //         this.creating = true;
  //         this.error = null;
  //         try {
  //             const comment = this.generateOrderComment();
  //             const res = await fetch("/api/bank/orders", {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json",
  //                     "X-Session-Id": this.sessionId,
  //                 },
  //                 body: JSON.stringify({
  //                     amountPcoin,
  //                     comment,
  //                 }),
  //             });
  //             if (!res.ok) {
  //                 const text = await res.text();
  //                 throw new Error(`Response ${res.status}: ${text}`);
  //             }
  //             const data = await res.json();
  //             runInAction(() => {
  //                 this.lastOrderId = data.orderId;
  //                 this.order = {
  //                     orderId: data.orderId,
  //                     amountTon: data.amountTon,
  //                     rate: data.rate,
  //                     expiresAt: data.expiresAt,
  //                     merchantAddr: data.merchantAddress,
  //                     comment: data.comment,
  //                     status: "NEW",
  //                 };
  //             });
  //         } catch (e: any) {
  //             console.error("BANK_CREATE_ORDER_ERROR:", e);
  //             this.error = e?.message ?? "Произошла ошибка";
  //         } finally {
  //             this.creating = false;
  //         }
  //     }
  //     async fetchOrder(orderId: string) {
  //         if (!this.sessionId) {
  //             console.warn("Нет sessionId – BankStore.fetchOrder прерван");
  //             return;
  //         }
  //         try {
  //             const res = await fetch(`/api/bank/orders/${orderId}`, {
  //                 headers: {
  //                     "X-Session-Id": this.sessionId,
  //                 },
  //             });
  //             if (!res.ok) {
  //                 console.warn("Ошибка запроса заказа", res.status);
  //                 return;
  //             }
  //             const data = await res.json();
  //             runInAction(() => {
  //                 this.order = {
  //                     orderId: data.orderId,
  //                     status: data.status,
  //                     amountTon: data.amountTon,
  //                     rate: data.rate,
  //                     expiresAt: data.expiresAt,
  //                     merchantAddr: data.merchantAddr,
  //                     comment: data.comment,
  //                     createdAt: data.createdAt,
  //                     updatedAt: data.updatedAt,
  //                     txHash: data.txHash,
  //                 };
  //             });
  //         } catch (e) {
  //             console.warn("Ошибка получения заказа:", e);
  //         }
  //     }
}

export const bankStore = new BankStore();
