import { makeAutoObservable, runInAction } from "mobx";
class Store {
  imgUrl =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  referrerId: string | null = null;
  startParam: string | null = null;
  initDataRaw!: string
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
    this.initDataRaw = initDataRaw;

    // console.log(initDataRaw);
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


// {
//   "type" : "CLAIM_DO",
//   "requestId": "",
//   "session": "caa01d47373b057393808e81bdb87ba2c7a12fa2dfbec129447b3c6a69885690",
//   "claimDoRq": {
//     "telegramId" : 813012401
//   }
// }
// запрос на начисление клайм. снятие бабла с этажей, и начисление на баланс пользака.

// {
//     "success": true,
//     "message": "ok",
//     "type": "CLAIM_DO",
//     "requestId": "",
//     "data": {
//         "userResponse": {
//             "tgId": 813012401,
//             "pizza": 48,
//             "pcoin": 250,
//             "pdollar": 0
//         }
//     }
// }
// ответ на снятие Claim который. возвращает баланс по всем полям пользака.


// {
//   "type" : "AUTH_INIT",
//   "requestId": "",
//   "session": "",
//   "authReq": {
//     "referralCode" : 111111,
//     "initData" : "user=%7B%22id%22%3A813012401%2C%22first_name%22%3A%22Wowa%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fsuxwv-xayl6LkQDl3kF8Cv8zMVLf88FUSFHhWTbdECU.svg%22%7D&chat_instance=5777142800206997280&chat_type=sender&auth_date=1755613769&signature=xJp1lVXDCJeo_LB5zjUgy1X2B4090X9O7obhbXFLsG6GKvZKBM6UBBFS-RMoBfj0bpu5eCoQkIfaz1tvWGK5Ag&hash=c5dde5cb292646f905f31c614d8db66e14d0817cdd4d143d0c9642070b7a461f"
//   }
// }
//  запрос на инициализацию

// {
//     "success": true,
//     "message": null,
//     "type": "AUTH_INIT",
//     "requestId": "",
//     "data": {
//         "sessionExpiresAt": "2025-10-25T11:44:07.306453200Z",
//         "user": {
//             "id": 2,
//             "telegramId": 813012401,
//             "locale": "RU"
//         },
//         "sessionId": "57ba131e3fd8ef2e6b67faf1dd44153bc51ab033dcf4d06138b3a961be21c410"
//     }
// }
//  ответ успешный