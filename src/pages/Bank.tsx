import { useState } from "react";
import { Link } from "react-router-dom";
import { bankStore } from "../store/BankStore";
import BankOrderModal from "./BankOrderModal";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";

// Новый компонент модального окна для обмена
function ExchangeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [walletAddress, setWalletAddress] = useState("");
  const [exchangeAmount, setExchangeAmount] = useState("");

  // Получаем текущий баланс PDollar из store
  const userPdollarBalance = store.pdollar;

  // Проверяем, достаточно ли средств у пользователя
  const hasSufficientBalance = userPdollarBalance >= 100000;

  // Проверяем, можно ли отправить форму (все поля валидны)
  const canSubmit =
    walletAddress.trim() &&
    exchangeAmount &&
    Number(exchangeAmount) >= 100000 &&
    Number(exchangeAmount) <= userPdollarBalance;

  const handleSubmit = () => {
    if (!walletAddress.trim()) {
      alert("Пожалуйста, введите адрес кошелька TON");
      return;
    }
    if (!exchangeAmount || Number(exchangeAmount) < 100000) {
      alert("Нельзя вывести сумму менее 100000 Pdollars");
      return;
    }
    if (Number(exchangeAmount) > userPdollarBalance) {
      alert("Недостаточно средств для вывода");
      return;
    }

    alert("Ваша заявка на вывод принята");
    setWalletAddress("");
    setExchangeAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
        <h2 className="text-xl mb-4 font-bold">Заявка на вывод</h2>

        {/* Информация о балансе */}
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-semibold">Ваш баланс PDollar:</span>
            <span
              className={`font-bold ${
                hasSufficientBalance ? "text-green-600" : "text-red-600"
              }`}
            >
              {userPdollarBalance.toLocaleString()}
            </span>
            <img
              src={`${store.imgUrl}icon_dollar_coin.png`}
              alt="PDollar"
              className="w-4 h-4"
            />
          </div>
          {!hasSufficientBalance && (
            <div className="text-xs text-red-600 mt-1">
              ❌ Недостаточно средств для вывода (минимум 100,000)
            </div>
          )}
        </div>

        {/* Поле для адреса кошелька */}
        <div className="mb-4">
          <label className="block text-left text-sm font-medium text-amber-800 mb-2">
            Введите адрес кошелька TON
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            className="w-full px-3 py-2 border-2 border-amber-800 rounded-lg text-amber-800 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Поле для суммы */}
        <div className="mb-6">
          <label className="block text-left text-sm font-medium text-amber-800 mb-2">
            Введите сумму в Pdollars{" "}
            <span>
              <img
                src={`${store.imgUrl}icon_dollar_coin.png`}
                alt="Coin"
                className="w-4 sm:w-5 inline"
              />
            </span>{" "}
            которую хотите обменять. Минимальная сумма вывода - 100000 Pdollars.
          </label>
          <input
            type="number"
            value={exchangeAmount}
            onChange={(e) => setExchangeAmount(e.target.value)}
            placeholder={`${Math.min(
              100000,
              userPdollarBalance
            ).toLocaleString()}`}
            min="100000"
            max={userPdollarBalance}
            step="1000"
            className="w-full px-3 py-2 border-2 border-amber-800 rounded-lg text-amber-800 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {/* Подсказка о доступной сумме */}
          <div className="text-xs text-gray-600 mt-1 text-left">
            Доступно для вывода: {userPdollarBalance.toLocaleString()} PDollar
          </div>
        </div>

        {/* Кнопка подтверждения */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full font-bold py-3 px-6 rounded-lg transition ${
            canSubmit
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {canSubmit ? "Подтвердить" : "Введите данные для вывода"}
        </button>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[20px] text-gray-700 hover:text-red-900"
          title="Закрыть"
        >
          X
        </button>
      </div>
    </div>
  );
}

function Bank() {
  const [tonAmount, setTonAmount] = useState(0.5);
  const [pdollarAmount, setPdollarAmount] = useState("100000");
  const [tonExchangeAmount, setTonExchangeAmount] = useState("1");
  const [pcoinAmount, setPcoinAmount] = useState("500");
  const [buying, setBuying] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  const handleBuy = async () => {
    const parsed = parseInt(pcoinAmount);
    if (Number.isNaN(parsed) || parsed < 100) {
      alert("Минимум — 100PCoin");
      return;
    }
    try {
      setBuying(true);
      bankStore.order = null;
      await bankStore.createOrder(parsed);

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

  // const handleExchange = () => {
  //   setIsExchangeModalOpen(true);
  // };

  const { pizza, pdollar, pcoin } = store;

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Фон */}
        <div className="absolute inset-0 bg-[#FFBC6B]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${store.imgUrl}bg_pizza.png')` }}
          />
        </div>

        {/* 💰 Панель валют */}
        <div className="absolute top-22 md:top-24 left-1/2 -translate-x-1/2 z-40 w-10/12 max-w-md flex justify-between gap-2 sm:gap-3">
          <CurrencyCard
            icon={`${store.imgUrl}icon_pizza.png`}
            value={pizza}
            label="Pizza"
          />
          <CurrencyCard
            icon={`${store.imgUrl}icon_dollar_coin.png`}
            value={pcoin}
            label="PCoin"
          />
          <CurrencyCard
            icon={`${store.imgUrl}icon_dollar.png`}
            value={pdollar}
            label="PDollar"
          />
        </div>

        {/* 🍞 Верхняя шапка */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full h-auto"
          />
        </div>

        {/* 🏦 Логотип банка */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_bank.png`} alt="bank" />
        </div>

        {/* Кнопка подключения ton connect */}
        <div className="absolute top-12 right-4 flex items-center space-x-3 z-40">
          <Link to="/ton-connect">
            <div className="rounded-full w-10 flex items-center justify-center">
              <img
                src={`${store.imgUrl}icon_ton.png`}
                alt="TON connect"
                className="w-8 h-8"
              />
            </div>
          </Link>
        </div>

        {/* Контейнер для содержимого */}
        <div className="relative z-30 h-screen flex flex-col pt-36 sm:pt-44 pb-20">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-8 sm:gap-10 py-4">
              {/* 🪙 Первый блок — Покупка PCoin */}
              <div className="w-11/12 max-w-md">
                <div className="relative">
                  <img
                    src={`${store.imgUrl}img_window2.png`}
                    alt="Modal background"
                    className="w-full h-auto scale-y-110 object-contain"
                  />
                  <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
                    <div className="text-base text-center sm:text-lg text-amber-800 shantell mb-2 font-bold">
                      Сколько PCoin вы хотите купить
                    </div>

                    {/* Поле PCoin */}
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_dollar_coin.png`}
                      label="PCoin"
                      balance={store.pcoin}
                      value={pcoinAmount}
                      onChange={(v) => {
                        setPcoinAmount(v);
                        setTonAmount(Number(v) / 1000);
                      }}
                      placeholder="500"
                      min={100}
                    />

                    {/* Стрелка */}
                    <ArrowDown />

                    {/* Поле TON */}
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_ton.png`}
                      label="TON"
                      balance={0}
                      value={String(tonAmount)}
                      onChange={(v) => setTonAmount(Number(v))}
                    />

                    {/* Курс */}
                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell flex items-center justify-center">
                      Курс: 1 TON = 1000 PCoin
                      <img
                        src={`${store.imgUrl}icon_dollar_coin.png`}
                        alt="PCoin"
                        className="w-6 h-6 sm:w-8 sm:h-8 ml-1"
                      />
                    </div>

                    {/* Кнопка покупки */}
                    <ActionButton
                      label={buying ? "Создание заказа..." : "Купить"}
                      onClick={handleBuy}
                      disabled={buying}
                      img={`${store.imgUrl}b_blue2.png`}
                      textColor="text-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* 💱 Второй блок — Обмен */}
              <div className="w-11/12 max-w-md mt-4">
                <div className="relative">
                  <img
                    src={`${store.imgUrl}img_window2.png`}
                    alt="Exchange"
                    className="w-full h-auto scale-y-110 object-contain"
                  />
                  <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
                    <div className="text-center text-lg sm:text-2xl mb-3 text-amber-800 shantell font-bold">
                      ОБМЕННИК
                    </div>

                    <CurrencyInput
                      icon={`${store.imgUrl}icon_dollar.png`}
                      label="PDollar"
                      balance={store.pdollar}
                      value={pdollarAmount}
                      onChange={setPdollarAmount}
                    />
                    <ArrowDown />
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_ton.png`}
                      label="TON"
                      balance={0}
                      value={tonExchangeAmount}
                      onChange={setTonExchangeAmount}
                    />

                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell">
                      100000 PDOLLAR за 1 TON
                    </div>

                    <ActionButton
                      label="ОБМЕНЯТЬ"
                      // onClick={handleExchange}
                      onClick={() => alert("Ваша заявка принята")}
                      img={`${store.imgUrl}b_blue2.png`}
                      textColor="text-blue-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* модалка заказа */}
      {bankStore.order && <BankOrderModal />}

      {/* модалка обмена */}
      <ExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />

      <Footer />
      <WebSocketComponent />
    </>
  );
}

/* ====== Подкомпоненты ====== */

function CurrencyCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="relative flex-1 max-w-[32%] drop-shadow-md transition-all">
      <img
        src={`${store.imgUrl}img_block.png`}
        alt={label}
        className="w-full h-12 rounded-lg"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <img src={icon} alt={label} className="w-5 sm:w-7 h-4" />
        <span className="font-bold text-amber-800 shantell text-sm sm:text-lg leading-tight">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function CurrencyInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  min,
}: {
  icon: string;
  label: string;
  balance: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div>
      <div className="flex justify-center items-center mb-1">
        <div className="flex items-center gap-2">
          <img src={icon} alt={label} className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
            {label}
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="bg-white rounded-xl px-4 py-4 mb-3 border-2 border-amber-800 shadow-inner text-center">
          <input
            type="number"
            min={min}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="text-center mb-2">
      <img
        src={`${store.imgUrl}icon_arrow_down.png`}
        alt="down"
        className="w-6 h-auto sm:w-8 inline-block"
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  img,
  textColor,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  img: string;
  textColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-full flex justify-center hover:opacity-90 transition-opacity cursor-pointer"
    >
      <img src={img} alt={label} className="w-1/3 h-auto" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${
            textColor || "text-amber-800"
          } text-md sm:text-lg shantell`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

export default Bank;
