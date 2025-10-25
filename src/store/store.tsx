import { makeAutoObservable, runInAction } from "mobx";

type TGUser = {
  id?: number;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  locale?: string;
  [k: string]: any;
};

type UserState = {
  balance?: number;
  [k: string]: any;
};

// 1) Твой прежний CDN как дефолт (быстрый возврат картинок/видео)
const DEFAULT_CDN_URL =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

// 2) Можно переопределить на этапе билда
const ENV_IMG_URL = import.meta.env.VITE_IMG_URL as string | undefined;

// 3) Опционально можно прокинуть в рантайме через window.__IMG_URL__ (если добавишь config.js)
const RUNTIME_IMG_URL =
    typeof window !== "undefined"
        ? ((window as any).__IMG_URL__ as string | undefined)
        : undefined;

// 4) Локальный fallback, если решишь хранить ассеты в образе (public/assets/*)
const LOCAL_ASSETS =
    typeof window !== "undefined" ? `${window.location.origin}/assets/` : "/assets/";

// Итоговый выбор приоритетов: ENV → RUNTIME → CDN → LOCAL
const RAW_IMG_URL = ENV_IMG_URL || RUNTIME_IMG_URL || DEFAULT_CDN_URL || LOCAL_ASSETS;

const IMG_URL = RAW_IMG_URL.endsWith("/") ? RAW_IMG_URL : RAW_IMG_URL + "/";

class Store {
  // CDN / статика
  imgUrl: string = IMG_URL;

  // Telegram WebApp init данные
  initDataRaw: string = "";
  referrerId: string | null = null;
  startParam: string | null = null;

  // Сессия
  sessionId: string | null = null;

  // Авторизация
  isAuthenticating = false;
  authError: string | null = null;

  // Пользователь и стейт
  user: TGUser = {};
  userState: UserState = {};

  constructor() {
    makeAutoObservable(this);
  }

  setInitDataRaw(data: string) {
    this.initDataRaw = data;
  }

  setReferralContext(startParam: string | null, referrerId: string | null) {
    runInAction(() => {
      this.startParam = startParam;
      this.referrerId = referrerId;
    });
  }

  setUser(user: TGUser) {
    this.user = user ?? {};
  }

  setUserState(userState: UserState) {
    this.userState = userState ?? {};
  }

  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
  }

  setAuthError(message: string | null) {
    this.authError = message;
  }

  hydrateFromAuthInit(payload?: {
    sessionId?: string;
    user?: TGUser;
    userState?: UserState;
  }) {
    if (!payload) return;
    if (payload.sessionId) this.setSessionId(payload.sessionId);
    if (payload.user) this.setUser(payload.user);
    if (payload.userState) this.setUserState(payload.userState);
  }

  /**
   * Обертка под авторизацию (инициация), фактический AUTH_INIT уходит через WS-компонент
   */
  async authenticateUser(initDataRaw: string, _referralCode: string | null) {
    this.authError = null;
    this.isAuthenticating = true;
    this.initDataRaw = initDataRaw;

    try {
      // no-op (AUTH_INIT уходит из WebSocketComponent)
    } finally {
      this.isAuthenticating = false;
    }
  }

  resetSession() {
    this.sessionId = null;
    this.user = {};
    this.userState = {};
    this.isAuthenticating = false;
    this.authError = null;
  }
}

export default new Store();