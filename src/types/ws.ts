// -------------------- Типы операций --------------------
export type OperationType =
    | "AUTH_INIT"
    | "FLOORS_GET"
    | "FLOORS_BUY"
    | "FLOORS_UPGRADE"
    | "CLAIM_DO"
    | "CLAIM_REFRESH"
    | "BANK_BUY_PCOIN"
    | "BANK_CONFIRM"
    | "BANK_EXCHANGE_PDOLLAR"
    | (string & {}); // резерв для будущих кейсов

// -------------------- База запроса --------------------
export interface WsBase {
  type: OperationType;
  requestId: string;
  session: string;
}

// -------------------- Пользователь --------------------
export interface TgUser {
  id?: number;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  locale?: string;
  photoUrl?: string;
  [k: string]: any;
}

// -------------------- Общее состояние --------------------
export interface UserState {
  [key: string]: any;
}

// -------------------- Запросы (RQ) --------------------

// Авторизация
export interface AuthReq {
  referralCode: string | null;
  initData: string;
}

// Этажи
export interface GetFloorRq {
  telegramId: number;
}

export interface BuyFloorRq {
  telegramId: number;
  floorId: number;
}

export interface UpdateFloorRq {
  telegramId: number;
  floorId: number;
}

// Фарм — клейм и обновление
export interface ClaimDoRq {
  telegramId: number;
}

export interface ClaimRefreshRq {
  telegramId: number;
}

// Банк — операции
export interface CreateOrderRq {
  telegramId: number;   // обязателен для бэка
  amountPcoin: number;  // camelCase, точно как в Java
  tonComment: string;   // комментарий для TON‑транзакции
}

export interface ConfirmOrderRq {
  orderId: string;
  telegramId: number;   // обязателен
}

export interface PDollarExchangeRq {
  telegramId?: number;
  amountPDollar: number;
}

// -------------------- Полный WS-запрос --------------------
export interface WsRequest extends WsBase {
  // авторизация
  authReq?: AuthReq;

  // этажи
  getFloorRq?: GetFloorRq;
  buyFloorRq?: BuyFloorRq;
  updateFloorRq?: UpdateFloorRq;

  // фарм
  claimDoRq?: ClaimDoRq;
  claimRefreshRq?: ClaimRefreshRq;

  // банк
  createOrderRq?: CreateOrderRq;        // BANK_BUY_PCOIN
  confirmOrderRq?: ConfirmOrderRq;      // BANK_CONFIRM
  pdollarExchangeRq?: PDollarExchangeRq;// BANK_EXCHANGE_PDOLLAR

  [key: string]: any;
}

// -------------------- Ответы (RS) --------------------
export interface WsResponse<T = any> {
  success: boolean;
  message?: string | null;
  type: OperationType;
  requestId: string;
  data?: T;
  [key: string]: any;
}

// Авторизация
export interface AuthData {
  sessionId?: string;
  user?: TgUser;
  userState?: UserState;
}

// Клейм
export interface ClaimData {
  userResponse?: UserState;
  userState?: UserState;
}

// Ответ после создания ордера PCoin
export interface BankCreateOrderData {
  orderId: string;
  amountTon: string;        // Java BigDecimal -> String
  rate: string;
  expiresAt: string;        // ISO
  merchantAddr: string;     // merchantAddress из Java
  comment: string;          // переданный tonComment
}

// Ответ на BANK_CONFIRM/BANK_ORDER_VIEW
export interface BankOrderViewData {
  orderId: string;
  status: string;
  amountTon: string | number;
  rate: string | number;
  expiresAt: string;
  merchantAddr: string;
  comment: string;
  amountPcoin?: number;
  txHash?: string | null;
  createdAt?: string;
  updatedAt?: string;
  telegramId?: number;
}