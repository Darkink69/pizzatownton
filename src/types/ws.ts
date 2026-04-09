import type {
  ChestType,
  NftGiftsGetListRq,
  NftGiftsWithdrawRequestRq,
  Rarity,
  Reward,
  UserData,
} from "./chests";

// -------------------- Типы операций --------------------
export type OperationType =
  | "AUTH_INIT"
  | "FLOORS_GET"
  | "FLOORS_BUY"
  | "FLOORS_UPGRADE"
  | "CLAIM_DO"
  | "CLAIM_REFRESH"
  | "BANK_BUY_PCOIN"
  | "BANK_BUY_ENTRY"
  | "BANK_CONFIRM"
  | "BANK_EXCHANGE_PDOLLAR"
  | "BANK_ORDER_VIEW"
  | "BANK_ORDER_STATUS_CHANGED"
  | "PERSON_BUY"
  | "BANK_MANUAL_WITHDRAW"
  | "TASKS_GET"
  | "TASKS_VERIFY"
  | "TASKS_COMPLETE"
  | "BANK_LINK_WALLET"
  | "ADMIN_ALL"
  | "ADMIN_DETAIL"
  | "ADMIN_OPERATION"
  | "PIZZA_BOX_OPEN"
  | "COMBO_TODAY"
  | "COMBO_PICK"
  | "CHEST_GET_STATE"
  | "CHEST_OPEN"
  | "PIZZA_CRAFT_BOX"
  | "BANK_MANUAL_WITHDRAW_HISTORY"
  | "BANK_EXCHANGE_PDOLLAR_TO_PCOIN"
  | "NFT_GIFTS_GET_LIST"
  | "NFT_GIFTS_WITHDRAW_REQUEST"
  | "FIX_CLICK_JETTON_LINK"
  | "CHECK_JETTON_PAYMENT"
  | "JETTON_BOX_BUY"
  | "FOOD_GET"
  | "FOOD_BUY"
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
  yieldPerHour: number; // инкремент на уровне (как в бэке)
  earningsPerHour: number; // итог по этажу (user_floors.earnings_per_hour)
  yieldCurrency: string;
  floorName: string;
  floorType: string;
  upgradeAmount: number | null;
  upgradeCurrency: string | null;
  purchaseCost: number | null;
  earned?: number;
  owned: boolean;
  balance?: number;

  // суточный расход на текущем уровне (участвует в dailyTotal)
  foodCostPcoin?: number | string | null;

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

export interface BankCreateEntryOrderData {
  orderId: string;
  amountTon: string;
  expiresAt: string;      // ISO
  merchantAddr: string;
  comment: string;        // ORD-XXXXXX
}

export interface UserFoodStatusDto {
  stockPcoin: number | string;
  stockUpdatedAt: string | null;

  dailyTotal: number | string;
  weeklyPrice: number | string;

  daysLeft: number | string;
  active: boolean;
}

export interface FoodBuyResponse {
  status: UserFoodStatusDto | null;
  user: {
    tgId: number;
    pizza: number;
    pcoin: number;
    pdollar: number;
  } | null;
  message: string;
}

export interface FoodGetRq {
  telegramId: number;
  floorId?: number | null;
}

export interface FoodBuyRq {
  telegramId: number;
  floorId?: number | null;
}

export interface JettonRq {
  telegramId: number;
}

export interface JettonResponse {
  haveDepo: boolean;
  pcoin: number;
  pizza: number;
  pdollar: number;

  // выпало (можно оставить для модалки)
  commonSlice: number;
  unCommonSlice: number;
  rareSlice: number;
  mystikalSlice: number;

  pieces?: unknown;
}

export interface ManualWithdrawRq {
  telegramId: number;
  username?: string;
  firstName?: string;
  pdollarAmount: number;
}

export type AdminWithdrawStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | (string & {});

export interface StaffUpgrade {
  staff_id: number;
  level: number;
  cost: number;
  incomePercent: number;
  loosesPercent: number;
}

// -------------------- Административные запросы --------------------
export interface AdminAllRq {
  telegramId: number;
}

export interface AdminOperationRq {
  id: number; // id заявки
  telegramId: number; // tg админа
  operation: "CONFIRMED" | "REJECTED" | "COMPLETE" | "PENDING";
}

export interface AdminWithdrawDetailData {
  id: number;
  telegramId: number;
  tonAddress: string;
  amount: number;              // tonAmount
  createdAt: string;

  totalWithdraws: number;      // totalWithdraws (COMPLETED ton)
  totalIncome: number;         // totalIncome (PAID ton)

  isBlogger: boolean;
  refIncomeTon: number;
  refWithdrawsTon: number;
  refCount: number;

  openedTotalFloors: number;
  openedRegularFloors: number;
  pdollarPerHourTotal: number;
  pizzaPerHourTotal: number;

  buyPcoinCount: number;
  buyPcoinTonTotal: number;
  buyPcoinPcoinTotal: number;
}

// -------------------- Тип для данных администратора --------------------
export interface AdminWithdrawalData {
  id: number;
  telegramId: number; // tg пользователя, который выводит
  walletAdd: string;
  amountPdollar: number;
  amountTon: string | number; // важно
  status: AdminWithdrawStatus;
  attention: boolean;
  isBlogger: boolean;
}

export interface AdminDetailRq {
  id: number;
  telegramId: number;
}

// -------------------- Запрос на привязку кошелька --------------------
export interface LinkWalletRq {
  telegramId: number;
  tonAddress: string;
}

// -------------------- Задания (Tasks) --------------------
export interface TaskRq {
  telegramId: number;
  code: string; // "SUBSCRIBE_MAIN_CHANNEL" | "INVITE_3_FRIENDS" | ...
}

export interface TaskWithProgress {
  code: string;
  title: string | null;
  description: string | null;
  current: number | null;
  target: number | null;
  completed: boolean | null;
}

export interface TaskVerifyResponse {
  code: string;
  status: string;
  message?: string | null;
}

export interface TaskCompleteResponse {
  code: string;
  rewardPcoin?: string | number | null;
  rewardPizza?: string | number | null;
  rewardPdollar?: string | number | null;
  message?: string | null;
}

export interface ComboTodayRq {
  telegramId: number;
}

export interface ComboPickRq {
  telegramId: number;
  index: number; // Индекс с 1
}

export interface ComboGameData {
  picksUsed: number;
  hits: number;
  selected?: Array<number | null>;
  isAvailable: boolean;
  isWin: boolean;
  winAmount: number | null;
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
  isPaidAccess?: boolean;

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

export interface PizzaBoxOpenRq {
  telegramId: number;
}

export interface PizzaBoxOpenResp {
  user: {
    tgId: number;
    pizza: number;
    pcoin: number;
    pdollar: number;
  };
  pizzaSpent: number;
  pcoinReward: number;
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

export interface PDollarToPcoinExchangeRq {
  telegramId: number;
  amountPDollar: number;
}

export interface PDollarToPcoinExchangeResponseData {
  amountPDollar: number;
  amountPcoin: number | string;
  ratePcoinPerPdollar: number | string;
}

// --- Сундуки (Chests) ---
export interface ChestGetStateRq {
  telegramId: number;
}

export interface ChestOpenRq {
  telegramId: number;
  chestType: ChestType;
}

export interface PizzaCraftBoxRq {
  telegramId: number;
  rarity: Rarity;
}

export interface ReferralLevelInfoData {
  level: number;
  countRef: number;
  // бэк-формат:
  earnedPcoin?: string | number;
  earnedPdollar?: string | number;
  // (опционально) старый формат/на будущее:
  pcoin?: string | number;
  pdollar?: string | number;
}

export interface ReferralInfoData {
  totalReferrals: number;
  earnedPcoin: number;
  earnedPdollar: number;
  link: string;
  referralLink?: string;

  levels?: ReferralLevelInfoData[]; // <-- NEW
}

// -------------------- Полный WS-запрос --------------------
export interface WsRequest extends WsBase {
  // авторизация
  authReq?: AuthReq;

  // привязка кошелька
  linkWalletRq?: LinkWalletRq;

  // административные запросы
  adminAllRq?: AdminAllRq;
  adminOperationRq?: AdminOperationRq;
  adminDetailRq?: AdminDetailRq;
  // этажи
  getFloorRq?: GetFloorRq;
  buyFloorRq?: BuyFloorRq;
  updateFloorRq?: UpdateFloorRq;

  // фарм
  claimDoRq?: ClaimDoRq;
  claimRefreshRq?: ClaimRefreshRq;

  //рефка
  referralGetRq?: ReferralGetRq;

  // лутбокс (коробка пиццы)
  pizzaBoxOpenRq?: PizzaBoxOpenRq;

  // jetton (коробка NY)
  jettonRq?: JettonRq;

  // сундуки и крафт
  chestGetStateRq?: ChestGetStateRq;
  chestOpenRq?: ChestOpenRq;
  pizzaCraftBoxRq?: PizzaCraftBoxRq;
  nftGiftsGetListRq?: NftGiftsGetListRq;
  nftGiftsWithdrawRequestRq?: NftGiftsWithdrawRequestRq;

  // банк
  createOrderRq?: CreateOrderRq; // BANK_BUY_PCOIN
  confirmOrderRq?: ConfirmOrderRq; // BANK_CONFIRM
  manualWithdrawRq?: ManualWithdrawRq;
  manualWithdrawHistoryRq?: ManualWithdrawHistoryRq;
  pdollarExchangeRq?: PDollarExchangeRq; // BANK_EXCHANGE_PDOLLAR
  pdollarToPcoinExchangeRq?: PDollarToPcoinExchangeRq;

  // задачи
  taskRq?: TaskRq;
  comboRq?: ComboTodayRq;
  pickComboRq?: ComboPickRq;

  // food
  foodGetRq?: FoodGetRq;
  foodBuyRq?: FoodBuyRq;

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
  jettonBoxReceived: boolean;
}

// Клейм
export interface ClaimData {
  userResponse?: UserState;
  userState?: UserState;
}

export type NftWithdrawStatus =
  | "AVAILABLE"
  | "REQUESTED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | (string & {});

export interface NftGiftItemDto {
  id: number | string;
  code: string; // например "B_DAY_CANDLE"
  name: string; // "B-Day Candle"
  rarity: string; // "common" | ...
  createdAt: string; // ISO
  withdrawStatus: NftWithdrawStatus;
}

export interface NftGiftsGetListPayload {
  items: NftGiftItemDto[];
}

export interface NftGiftsWithdrawRequestPayload {
  itemId: number | string;
  withdrawStatus: NftWithdrawStatus;
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

// --- Сундуки (Chests) Payloads ---

/**
 * Payload для ответа на CHEST_GET_STATE.
 */
export interface ChestGetStatePayload {
  keys: unknown; // потом normalizeChestKeys
  pieces: unknown; // потом normalizePizzaPieces
}

/**
 * Payload для ответа на CHEST_OPEN.
 */
export interface ChestOpenPayload {
  chestType: ChestType | string;
  rewards: Reward[];
  keys: unknown;
  pieces: unknown;
  user: UserData;
}

/**
 * Payload для ответа на PIZZA_CRAFT_BOX.
 */
export interface PizzaCraftBoxPayload {
  piecesRarity: Rarity | string;
  piecesLeft: number | string;
  nftPrizeId: number | string;
  nftPrizeName: string;
  received: boolean;
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

// Интерфейс для запроса истории выводов
export interface ManualWithdrawHistoryRq {
  telegramId: number;
}

// Интерфейс для элемента истории выводов
export interface ManualWithdrawHistoryItem {
  createdAt: string; // "2025-12-20T18:50:38.571066Z"
  tonAmount: number; // 0.458200000
  status: "COMPLETED" | "PENDING" | "FAILED" | (string & {});
}

// Интерфейс для ответа с историей выводов
export interface ManualWithdrawHistoryData {
  telegramId: number;
  items: ManualWithdrawHistoryItem[];
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
