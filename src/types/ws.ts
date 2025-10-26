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
    | (string & {});

// Базовая структура запроса
export interface WsBase {
    type: OperationType;
    requestId: string;
    session: string;
}

// Пользователь из Telegram (может быть пустым)
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

export interface UserState {
    [key: string]: any;
}

// ---------------------
//          RQ
// ---------------------

export interface AuthReq {
    referralCode: string | null;
    initData: string;
}

export interface ClaimDoRq {
    telegramId: number;
}

export interface BankBuyPCoinRq {
    amountPCoin: number;
    comment: string; // ✅ ОБЯЗАТЕЛЬНО
}

export interface BankConfirmRq {
    operationId: string;
    txHash: string;
}

export interface BankOrderGetRq {
    operationId: string;
}

export interface BankSellPDollarRq {
    amountPDollar: number;
}

// Полная структура запроса
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

// ---------------------
//          RS
// ---------------------

// Базовый ответ
export interface WsResponse<T = any> {
    success: boolean;
    message?: string | null;
    type: OperationType;
    requestId: string;
    data?: T;
    [key: string]: any;
}

// Ответ на AUTH_INIT
export interface AuthData {
    sessionId?: string;
    user?: TgUser;
    userState?: UserState;
}

// Ответ на CLAIM
export interface ClaimData {
    userResponse?: UserState;
    userState?: UserState;
}

// Ответ на создание ордера
export interface BankCreateOrderData {
    operationId: string;
    amountTon: string;
    rate: string;
    expiresAt: string;
}

// Ответ на просмотр ордера
export interface BankOrderViewData {
    operationId: string;
    status?: string | null;
    merchantAddr?: string | null;
    comment?: string | null;
    amountPcoin?: number | null;
    amountTon?: string | null;
    rate?: string | number | null;
    expiresAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

// Устаревшее, но безопасное
export type TGUser = TgUser;