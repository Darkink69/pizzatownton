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

    // try {
    //   const rc =
    //     referralCode && /^\d+$/.test(referralCode) ? referralCode : null;
    //   let url = `/api/v1/users/register`;
    //   if (rc) url += `?referralCode=${encodeURIComponent(rc)}`;

    //   const res = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Accept: "application/json",
    //     },
    //     body: JSON.stringify({ initDataRaw }),
    //   });

    //   if (!res.ok) {
    //     const errorText = await res.text().catch(() => "");
    //     let message = `Auth failed: ${res.status}`;
    //     try {
    //       if (errorText) {
    //         const errJson = JSON.parse(errorText);
    //         message = errJson?.message || message;
    //       }
    //     } catch {
    //       /* ignore */
    //     }
    //     throw new Error(message);
    //   }

    //   const text = await res.text();
    //   if (!text || !text.trim())
    //     throw new Error("Пустой ответ от /users/register");
    //   const userData = JSON.parse(text);

    //   runInAction(() => {
    //     this.setUserState(userData);
    //     this.setUser(userData);
    //   });

    //   if (userData?.id) {
    //     void this.loadReferralInfo(userData.id);
    //   }
    // } catch (e: any) {
    //   console.error("Authentication process failed:", e);
    //   runInAction(() => {
    //     this.authError = e?.message || "Authentication failed";
    //   });
    // } finally {
    //   runInAction(() => {
    //     this.isAuthenticating = false;
    //   });
    // }
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
