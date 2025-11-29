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
    | "PERSON_BUY"
    | "BANK_MANUAL_WITHDRAW"
    | "TASKS_GET"
    | "TASKS_VERIFY"
    | "TASKS_COMPLETE"
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
  earningsPerHour: number;
  yieldCurrency: string;
  floorName: string;
  floorType: string;
  upgradeAmount: number | null;
  upgradeCurrency: string | null;
  purchaseCost: number | null;
  earned?: number;
  owned: boolean;
  balance?: number;

  staff?:
    | {
        staffId: number;
        staffLevel: number;
        staffName: string;
        startDate: string | null;
        endDate: string | null;
        durationDay: number | null;
        owned: boolean;
        floorId?: number;
        upgradeStaff: {
          staff_id: number;
          level: number;
          cost: number;
          incomePercent: number | null;
          loosesPercent: number | null;
        }[];
        accountantLevel?:
          | {
              id: number;
              cost: number;
              durationDay: number;
            }[]
          | null;
      }[]
    | null;
}

export interface ManualWithdrawRq {
  telegramId: number;
  username?: string;
  firstName?: string;
  pdollarAmount: number;

}

export interface StaffUpgrade {
  staff_id: number;
  level: number;
  cost: number;
  incomePercent: number;
  loosesPercent: number;
}

// -------------------- Задания (Tasks) --------------------
export interface TaskRq {
  telegramId: number;
  code: string; // "SUBSCRIBE_MAIN_CHANNEL" | "INVITE_3_FRIENDS" | ...
}

export interface TaskVerifyResponse {
  code: string;
  status: string; // "verified" | "not_enough_referrals" | "error" и т.п.
  message: string;
}

export interface TaskCompleteResponse {
  code: string;
  rewardPcoin: string | number;
  rewardPizza: string | number;
  rewardPdollar: string | number;
  message: string;
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

// -------------------- Новый блок: Персонал --------------------
export interface StaffRq {
  telegramId: number;
}

export interface BuyPersonRq {
  telegramId: number;
  staffId: number; // 1 Guard | 2 Manager | 3 Accountant
  floorId?: number; // Guard/Manager targeting floor
  level?: number; // new level (1–5)
  subscription?: number; // days (7/30/90) for Accountant
}

// -------------------- Запросы (RQ) --------------------

// Авторизация
export interface AuthReq {
  referralCode: string | null;
  initData: string;
  walletAddress?: string; 
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
  telegramId: number; // обязателен для бэка
  amountPcoin: number; // camelCase, точно как в Java
  tonComment: string; // комментарий для TON‑транзакции
}

export interface ConfirmOrderRq {
  orderId: string;
  telegramId: number; // обязателен
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

  //рефка
  referralGetRq?: ReferralGetRq;

  // банк
  createOrderRq?: CreateOrderRq; // BANK_BUY_PCOIN
  confirmOrderRq?: ConfirmOrderRq; // BANK_CONFIRM
  manualWithdrawRq?: ManualWithdrawRq;
  pdollarExchangeRq?: PDollarExchangeRq; // BANK_EXCHANGE_PDOLLAR

  // задачи
  taskRq?: TaskRq;
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

export interface ReferralGetRq {
  telegramId: number;
}

export interface ReferralInfoData {
  totalReferrals: number;
  earnedPcoin: number;
  earnedPdollar: number;
  link: string;
  referralLink?: string;
}

// -------------------- Банк --------------------

// Ответ после создания ордера PCoin
export interface BankCreateOrderData {
  orderId: string;
  amountTon: string; // BigDecimal -> String
  rate: string;
  expiresAt: string; // ISO‑дата
  merchantAddr: string; // merchantAddress из Java
  comment: string; // переданный tonComment
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

// -------------------- Персонал (Staff) --------------------
export interface LevelsDto {
  id: number;
  level: number;
  description: string;
  cost: number;
}

export interface SubscriptionsDto {
  id: number;
  durationDays: number;
  cost: number;
}

export interface CharacterLevelDto {
  id: number;
  name: string;
  description: string;
  levels: LevelsDto[];
}

export interface CharacterSubscriptionDto {
  id: number;
  name: string;
  description: string;
  accountants: SubscriptionsDto[];
}

export interface StaffAllResponse {
  managers: CharacterLevelDto;
  guards: CharacterLevelDto;
  accountant: CharacterSubscriptionDto;
}

export interface StaffBuyUpdateResponse {
  user: {
    tgId: number;
    pcoin: number;
    pizza: number;
    pdollar: number;
  };
  userStaff: {
    staffId: number;
    staffLevel: number;
    staffName: string;
    startDate: string;
    endDate?: string;
    durationDay?: number;
    floorId?: number;
    owned?: boolean;
    upgradeStaff?: {
      level: number;
      cost: number;
      incomePercent: number | null;
      loosesPercent: number | null;
    }[];
    accountantLevel?:
      | {
          id: number;
          cost: number;
          durationDay: number;
        }[]
      | null;
  };
}

export interface Accountant {
  staffId: number;
  staffLevel: number;
  staffName: "Accountant";
  startDate: string | null;
  endDate: string | null;
  durationDay: number | null;
  owned: boolean;
  upgradeStaff:
    | null
    | {
        staff_id: number;
        level: number;
        cost: number;
        incomePercent: number;
        loosesPercent: number;
      }[];
  accountantLevel: {
    id: number;
    cost: number;
    duration: number; // или durationDay
  }[];
  floorId: 0;
}

export interface FloorsData {
  userFloorList: UserFloor[];
  pdollarAmount: number;
  pizzaAmount: number;
  user: TgUser;
  accountant?: Accountant | null;
}
