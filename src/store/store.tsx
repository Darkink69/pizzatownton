import { makeAutoObservable } from "mobx";

class Store {
  imgUrl =
    "https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/";

  user = {
  "floorList": [
    {
      "floorId": 1,
      "level": 5,
      "costCurrency": "PCoin",
      "costAmount": 1000,
      "yieldPerHour": 50,
      "yieldCurrency": "Pizza",
      "floorName": "Basement"
    },
    {
      "floorId": 2,
      "level": 3,
      "costCurrency": "GOLD",
      "costAmount": 750,
      "yieldPerHour": 30,
      "yieldCurrency": "SILVER",
      "floorName": "1 floor"
    },
    {
      "floorId": 3,
      "level": 1,
      "costCurrency": "GOLD",
      "costAmount": 500,
      "yieldPerHour": 15,
      "yieldCurrency": "SILVER",
      "floorName": "regular"
    }
  ],
  "userFloorList": [
    {
      "floorId": 1,
      "level": 5,
      "yieldPerHour": 50,
      "yieldCurrency": "Pizza",
      "floorName": "regular",
      "floorType": "Basement"
    },
    {
      "floorId": 3,
      "level": 1,
      "yieldPerHour": 15,
      "yieldCurrency": "SILVER",
      "floorName": "regular",
      "floorType": "RESOURCE"
    }
  ]
}


  constructor() {
    makeAutoObservable(this);
  }

  //   setUser(user: any) {
  //     this.user = user;
  //   }
}

export default new Store();
