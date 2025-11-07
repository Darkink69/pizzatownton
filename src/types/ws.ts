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
    | "BANK_ORDER_VIEW"
    | "BANK_ORDER_STATUS_CHANGED"
    | (string & {}); // резерв на будущее

// -------------------- База запроса --------------------
export interface WsBase {
  type: OperationType;
  requestId: string;
  session: string;
}

export interface UserFloor {
  floorId: number;
  level: number;
  yieldPerHour: number;
  yieldCurrency: string;
  floorName: string;
  floorType: string;
  upgradeAmount: number | null;
  upgradeCurrency: string | null;
  purchaseCost: number | null;
  owned: boolean;
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

// -------------------- Состояние пользователя --------------------
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

// Фарм — клейм
export interface ClaimDoRq {
  telegramId: number;
  floorId: number;
}

export interface ClaimRefreshRq {
  telegramId: number;
}

// Банк
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

// -------------------- Банк --------------------

// Ответ после создания ордера PCoin
export interface BankCreateOrderData {
  orderId: string;
  amountTon: string;    // BigDecimal -> String
  rate: string;
  expiresAt: string;    // ISO‑дата
  merchantAddr: string; // merchantAddress из Java
  comment: string;      // переданный tonComment
}

// Ответ на BANK_CONFIRM/BANK_ORDER_VIEW/STATUS_CHANGED
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