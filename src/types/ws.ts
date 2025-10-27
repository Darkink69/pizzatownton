// Типы операций
export type OperationType =
    | "AUTH_INIT"
    | "FLOORS_GET"
    | "FLOORS_BUY"
    | "FLOORS_UPGRADE"
    | "CLAIM_DO"
    | "CLAIM_REFRESH"
    | "BANK_BUY_PCOIN"
    | "BANK_CONFIRM"
    | "BANK_ORDER_GET"
    | "BANK_ORDER_VIEW"
    | "BANK_SELL_PDOLLAR"
    | (string & {}); // расширяемость

// Базовая структура WebSocket-запроса
export interface WsBase {
    type: OperationType;
    requestId: string;
    session: string;
}

// Telegram User (может быть частично заполнен)
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

// Текущее состояние пользователя (цифры + статус)
export interface UserState {
    [key: string]: any;
}

// -------------------- Запросы (RQ) --------------------

export interface AuthReq {
    referralCode: string | null;
    initData: string;
}

export interface ClaimDoRq {
    telegramId: number;
}

export interface BankBuyPCoinRq {
    amountPCoin: number;
    comment: string;
}

export interface BankConfirmRq {
    orderId: string;
    txHash: string;
}

export interface BankOrderGetRq {
    orderId: string;
}

export interface BankSellPDollarRq {
    amountPDollar: number;
}

// Полный WS-запрос
export interface WsRequest extends WsBase {
    authReq?: AuthReq;
    claimDoRq?: ClaimDoRq;
    bankBuyPCoinRq?: BankBuyPCoinRq;
    bankConfirmRq?: BankConfirmRq;
    bankOrderGetRq?: BankOrderGetRq;
    bankSellPDollarRq?: BankSellPDollarRq;
    floorsBuyRq?: { floorNumber: number };
    floorsUpgradeRq?: { floorNumber: number };
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

export interface AuthData {
    sessionId?: string;
    user?: TgUser;
    userState?: UserState;
}

export interface ClaimData {
    userResponse?: UserState;
    userState?: UserState;
}

// Ответ после создания ордера на PCoin
export interface BankCreateOrderData {
    orderId: string;
    amountTon: string;
    rate: string;
    expiresAt: string;
    merchantAddress: string;
    comment: string;
}

// Ответ при получении статуса ордера
export interface BankOrderViewData {
    orderId: string;
    status: string;
    amountTon: string;
    rate: string | number;
    expiresAt: string;
    merchantAddr: string;
    comment: string;
    amountPcoin?: number;
    txHash?: string | null;
    createdAt?: string;
    updatedAt?: string;
}