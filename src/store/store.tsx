import { makeAutoObservable, runInAction } from "mobx";
class Store {
  imgUrl =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  referrerId: string | null = null;
  startParam: string | null = null;
  userData: any = {};
  isAuthenticating = false;
  authError: string | null = null;
  userState: any = {};
  user: any = {};

  constructor() {
    makeAutoObservable(this);
  }

  setReferralContext(startParam: string | null, referrerId: string | null) {
    runInAction(() => {
      this.startParam = startParam;
      this.referrerId = referrerId;
    });
  }

  async authenticateUser(initDataRaw: string, referralCode: string | null) {
    this.isAuthenticating = true;
    this.authError = null;

    console.log(initDataRaw);
    console.log(referralCode);
  }

  loadReferralInfo(_id: any) {
    throw new Error("Method not implemented.");
  }

  setUser(user: any) {
    this.user = user;
  }
  setUserState(userState: any) {
    this.userState = userState;
  }
}

export default new Store();
