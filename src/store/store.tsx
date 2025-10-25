import { makeAutoObservable, runInAction } from "mobx";

class Store {
  // CDN путь к картинкам
  imgUrl =
      "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  // Telegram WebApp init данные
  initDataRaw: string = "";
  referrerId: string | null = null;
  startParam: string | null = null;

  // Сессия
  sessionId: string | null = null;

  // Авторизация
  isAuthenticating = false;
  authError: string | null = null;

  // Пользователь (из AUTH_RESULT)
  user: any = {};

  // Юзер-стейт ⇒ баланс, клеймы, пост-клейм
  userState: any = {};

  constructor() {
    // Автоматическая реактивность всех полей
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

  setUser(user: any) {
    this.user = user;
  }

  setUserState(userState: any) {
    this.userState = userState;
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  setAuthError(message: string | null) {
    this.authError = message;
  }

  /**
   * ❗ Авторизация по initData — обёртка для save/init
   */
  async authenticateUser(initDataRaw: string, referralCode: string | null) {
    this.authError = null;
    this.isAuthenticating = true;
    this.initDataRaw = initDataRaw;

    console.log("📨 AUTH_REQUEST from store");
    console.log("↪️ referralCode =", referralCode);

    // ⚠ Тут AUTH_INIT уходит через WebSocketComponent (не здесь)
  }

  /**
   * Сброс при выходе пользователя
   */
  resetSession() {
    this.sessionId = null;
    this.user = {};
    this.userState = {};
    this.isAuthenticating = false;
  }
}

export default new Store();