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
    | "BANK_SELL_PDOLLAR"       // старый тип — оставляем для совместимости
    | "BANK_EXCHANGE_PDOLLAR"   // НОВОЕ: соответствует бэку
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

// НОВОЕ: точный контракт под Java BankService.createOrder
export interface CreateOrderRq {
    telegramId: number;     // обязателен для бэка
    amountPcoin: number;    // camelCase и строчная c — как в Java
    tonComment: string;     // комментарий, который пойдёт в TON-транзакцию
}

// Оставляем старый интерфейс, но добавляем алиасы полей, чтобы не падали старые места.
// Рекомендуется мигрировать на CreateOrderRq.
export interface BankBuyPCoinRq {
    // новый вариант (желательно использовать)
    amountPcoin?: number;
    tonComment?: string;

    // backward-compat: старые имена
    amountPCoin?: number;   // старое имя — с большой C
    comment?: string;       // старое имя поля комментария

    // иногда вы передаёте telegramId с фронта — пусть будет опционально
    telegramId?: number;
}

// НОВОЕ: контракт под Java BankService.getOrder (используется при type=BANK_CONFIRM)
export interface ConfirmOrderRq {
    orderId: string;
    telegramId: number; // обязателен для бэка
}

export interface BankConfirmRq {
    // старый вариант — оставляем, но бэку нужен telegramId, а txHash бэку не требуется
    orderId: string;
    txHash?: string;        // не используется бэком
    telegramId?: number;    // добавили для совместимости
}

export interface BankOrderGetRq {
    orderId: string;
}

export interface BankSellPDollarRq {
    amountPDollar: number;
}

// НОВОЕ: под Java BankService.exchangePDollarToTon (type=BANK_EXCHANGE_PDOLLAR)
export interface PDollarExchangeRq {
    amountPDollar: number;
}

// Полный WS-запрос
export interface WsRequest extends WsBase {
    authReq?: AuthReq;
    claimDoRq?: ClaimDoRq;

    // НОВОЕ: используем это для BANK_BUY_PCOIN
    createOrderRq?: CreateOrderRq;

    // старый вариант — оставляем, но рекомендуется мигрировать на createOrderRq
    bankBuyPCoinRq?: BankBuyPCoinRq;

    // НОВОЕ: используем это для BANK_CONFIRM (getOrder)
    confirmOrderRq?: ConfirmOrderRq;

    // старый вариант — оставляем для совместимости
    bankConfirmRq?: BankConfirmRq;

    bankOrderGetRq?: BankOrderGetRq;

    // старый (внутренний) кейс — оставляем
    bankSellPDollarRq?: BankSellPDollarRq;

    // НОВОЕ: под BANK_EXCHANGE_PDOLLAR
    pdollarExchangeRq?: PDollarExchangeRq;

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
    amountTon: string;         // Java даёт строку (toPlainString)
    rate: string;              // то же
    expiresAt: string;         // ISO
    merchantAddress: string;   // именно 'merchantAddress'
    comment: string;           // tonComment, который передали
}

// Ответ при получении статуса ордера (BANK_CONFIRM)
export interface BankOrderViewData {
    orderId: string;
    status: string;
    amountTon: string | number; // может прийти как число — даём гибкость
    rate: string | number;
    expiresAt: string;
    merchantAddress: string;       // именно 'merchantAddr' из Java
    comment: string;

    amountPcoin?: number;
    txHash?: string | null;
    createdAt?: string;
    updatedAt?: string;


    telegramId?: number;
}