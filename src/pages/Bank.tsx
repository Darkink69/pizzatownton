import { useState } from "react";
import { Link } from "react-router-dom";
import { bankStore } from "../store/BankStore";
import BankOrderModal from "./BankOrderModal";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";

function Bank() {
  const [tonAmount, setTonAmount] = useState(0.5);
  const [pdollarAmount, setPdollarAmount] = useState("100");
  const [tonExchangeAmount, setTonExchangeAmount] = useState("0,02");
  const [pcoinAmount, setPcoinAmount] = useState("500");
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    const parsed = parseInt(pcoinAmount);
    if (Number.isNaN(parsed) || parsed < 100) {
      alert("Минимум — 100 PCoin");
      return;
    }

    try {
      setBuying(true);

      // Сбрасываем предыдущий заказ
      bankStore.order = null;

      await bankStore.createOrder(parsed);

      // Ждем появления заказа с таймаутом
      let attempts = 0;
      const checkOrder = () => {
        attempts++;
        if (bankStore.order || attempts > 10) {
          setBuying(false);
          return;
        }
        setTimeout(checkOrder, 100);
      };

      checkOrder();
    } catch (e) {
      console.warn("Ошибка создания заказа:", e);
      setBuying(false);
    }
  };

  const handleExchange = () => {
    alert(`Вы обменяли ${pdollarAmount} PDOLLAR на ${tonExchangeAmount} TON`);
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFBC6B]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat sm:bg-auto sm:bg-center md:bg-auto md:bg-center lg:bg-contain lg:bg-center"
            style={{
              backgroundImage: `url('${store.imgUrl}bg_pizza.png')`,
            }}
          />
        </div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_bank.png`} alt="bank" />
        </div>

        <div className="absolute top-12 right-4 flex items-center space-x-3 z-40">
          <Link to="/ton-connect">
            <div className="rounded-full w-10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="20" fill="#009FFF" />
                <path
                  d="M29.4499 21.6401V22.6401C29.4499 22.9101 29.2399 23.1301 28.9599 23.1401H27.4999C26.9699 23.1401 26.4899 22.7501 26.4499 22.2301C26.4199 21.9201 26.5399 21.6301 26.7399 21.4301C26.9199 21.2401 27.1699 21.1401 27.4399 21.1401H28.9499C29.2399 21.1501 29.4499 21.3701 29.4499 21.6401Z"
                  fill="white"
                />
                <path
                  d="M25.9892 20.6901C25.4892 21.1801 25.2492 21.9101 25.4492 22.6701C25.7092 23.6001 26.6192 24.1901 27.5792 24.1901H28.4492C28.9992 24.1901 29.4492 24.6401 29.4492 25.1901V25.3801C29.4492 27.4501 27.7592 29.1401 25.6892 29.1401H14.2092C12.1392 29.1401 10.4492 27.4501 10.4492 25.3801V18.6501C10.4492 17.4201 11.0392 16.3301 11.9492 15.6501C12.5792 15.1701 13.3592 14.8901 14.2092 14.8901H25.6892C27.7592 14.8901 29.4492 16.5801 29.4492 18.6501V19.0901C29.4492 19.6401 28.9992 20.0901 28.4492 20.0901H27.4292C26.8692 20.0901 26.3592 20.3101 25.9892 20.6901Z"
                  fill="white"
                />
                <path
                  d="M24.1991 12.82C24.4691 13.09 24.2391 13.51 23.8591 13.51L16.1791 13.5C15.7391 13.5 15.5091 12.96 15.8291 12.65L17.4491 11.02C18.8191 9.66 21.0391 9.66 22.4091 11.02L24.1591 12.79C24.1691 12.8 24.1891 12.81 24.1991 12.82Z"
                  fill="white"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Контейнер для скролла */}
        <div className="relative z-30 h-screen flex flex-col pt-25 sm:pt-40 pb-20">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 py-4">
              {/* Первый блок - ПОКУПКА МОНЕТ */}
              <div className="w-11/12 max-w-md">
                <div className="relative">
                  <img
                    src={`${store.imgUrl}img_window2.png`}
                    alt="Modal background"
                    className="w-full h-auto object-contain"
                  />

                  {/* Контент поверх фона */}
                  <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-5">
                    {/* <div className="text-center text-lg sm:text-2xl mb-2 sm:mb-3 text-amber-800 shantell leading-tight tracking-wide">
                      Покупка PCoin
                    </div> */}
                    <div className="text-base text-center sm:text-lg text-amber-800 shantell sm:p-4 md:p-5 mb-2">
                      Сколько PCoin вы хотите купить:
                    </div>
                    {/* Нижний блок валюты */}
                    <div className="">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="PCOIN"
                            className="w-6 h-6 sm:w-8 sm:h-8 inline-block"
                          />

                          <span className="font-bold text-md sm:text-lg text-amber-800 shantell">
                            PCoin
                          </span>
                        </div>
                        <div className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          Баланс: {store.pcoin}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                          <input
                            className="absolute inset-0 bg-transparent w-full px-4 py-4 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                            value={pcoinAmount}
                            onChange={(e) => {
                              setPcoinAmount(e.target.value);
                              setTonAmount(Number(e.target.value) / 1000);
                            }}
                            type="number"
                            min="100"
                            step="100"
                            placeholder="500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Стрелка вниз */}
                    <div className="text-center">
                      <img
                        src={`${store.imgUrl}icon_arrow_down.png`}
                        alt="down"
                        className="w-6 h-auto sm:w-8 inline-block"
                      />
                    </div>

                    {/* Верхний блок валюты */}
                    <div className="">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`${store.imgUrl}icon_ton.png`}
                            alt="TON"
                            className="w-6 h-auto sm:w-8 inline-block"
                          />
                          <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
                            TON
                          </span>
                        </div>
                        <div className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          Баланс: 0
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                          <input
                            type="text"
                            value={tonAmount}
                            onChange={(e) =>
                              setTonAmount(Number(e.target.value))
                            }
                            className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Курс обмена */}
                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell flex items-center justify-center">
                      Курс: 1 TON = 1000 PCoin
                      <img
                        src={`${store.imgUrl}icon_dollar_coin.png`}
                        alt="PCOIN"
                        className="w-6 h-6 sm:w-8 sm:h-8 ml-1 mr-1"
                      />
                    </div>

                    {/* Кнопка действия */}
                    <button
                      className="relative w-full flex justify-center hover:opacity-90 transition-opacity cursor-pointer"
                      disabled={buying}
                      onClick={handleBuy}
                    >
                      <img
                        src={`${store.imgUrl}b_blue2.png`}
                        alt=""
                        className="w-1/3 scale-x-150 h-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-blue-900 text-md sm:text-lg shantell">
                          {buying ? "Создание заказа..." : "Купить"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Второй блок - ОБМЕННИК */}
              <div className="w-11/12 max-w-md">
                <div className="relative">
                  {/* Фон модального окна */}
                  <img
                    src={`${store.imgUrl}img_window2.png`}
                    alt="Modal background"
                    className="w-full h-auto object-contain"
                  />

                  {/* Контент поверх фона */}
                  <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-5">
                    <div className="text-center text-lg sm:text-2xl mb-2 sm:mb-3 text-amber-800 shantell leading-tight tracking-wide">
                      ОБМЕННИК
                    </div>

                    {/* Верхний блок валюты */}
                    <div className="">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`${store.imgUrl}icon_dollar.png`}
                            alt="Pdollar"
                            className="w-6 h-auto sm:w-8 inline-block"
                          />
                          <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
                            Pdollar
                          </span>
                        </div>
                        <div className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          Баланс: {store.pdollar}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                          <input
                            type="text"
                            value={pdollarAmount}
                            onChange={(e) => setPdollarAmount(e.target.value)}
                            className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Стрелка вниз */}
                    <div className="text-center">
                      <img
                        src={`${store.imgUrl}icon_arrow_down.png`}
                        alt="down"
                        className="w-6 h-auto sm:w-8 inline-block"
                      />
                    </div>

                    {/* Нижний блок валюты */}
                    <div className="">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={`${store.imgUrl}icon_ton.png`}
                          alt="TON"
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
                          TON
                        </span>
                      </div>
                      <div className="relative">
                        <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                          <input
                            type="text"
                            value={tonExchangeAmount}
                            onChange={(e) =>
                              setTonExchangeAmount(e.target.value)
                            }
                            className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Курс обмена */}
                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell">
                      0.5 PDOLLAR за 1 TON
                    </div>

                    {/* Кнопка действия */}
                    <button
                      onClick={handleExchange}
                      className="relative w-full flex justify-center hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_blue2.png`}
                        alt="ОБМЕНЯТЬ"
                        className="w-1/3 h-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-blue-900 text-md sm:text-lg shantell">
                          ОБМЕНЯТЬ
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Модалка оплаты */}
      {bankStore.order && <BankOrderModal />}
      <Footer />
      <WebSocketComponent />
    </>
  );
}

export default Bank;
