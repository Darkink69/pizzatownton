import { makeAutoObservable } from "mobx";

class Store {
  imgUrl =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  constructor() {
    makeAutoObservable(this);
  }

  //   setUser(user: any) {
  //     this.user = user;
  //   }
}

export default new Store();
