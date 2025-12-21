import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bankStore } from "../store/BankStore";
import BankOrderModal from "./BankOrderModal";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import { useTranslation } from "react-i18next";

const ExchangeModal = observer(
  ({
    isOpen,
    onClose,
    initialAmount,
  }: {
    isOpen: boolean;
    onClose: () => void;
    initialAmount: string;
  }) => {
    const { t } = useTranslation();
    //const [walletAddress, setWalletAddress] = useState("");
    const [exchangeAmount, setExchangeAmount] = useState(initialAmount);
    const [showHistory, setShowHistory] = useState(false);
    const [withdrawalHistory, setWithdrawalHistory] = useState<
      Array<{
        id: number;
        date: string;
        amount: number;
        status: string;
      }>
    >([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const userPdollarBalance = Number(store.pdollar) || 0;
    const hasSufficientBalance = userPdollarBalance >= 25000;
    const canSubmit =
      exchangeAmount !== "" &&
      Number(exchangeAmount) >= 25000 &&
      Number(exchangeAmount) <= userPdollarBalance;

    // Функция для загрузки истории выводов
    const loadWithdrawalHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // Здесь нужно реализовать запрос к серверу для получения истории выводов
        // Пример запроса:
        // const response = await store.getWithdrawalHistory();
        // setWithdrawalHistory(response.data);

        // Временные данные для демонстрации
        const mockData = [
          { id: 1, date: "2024-12-18 17:59", amount: 1000, status: "Успешно" },
          { id: 2, date: "2024-12-17 14:30", amount: 500, status: "Успешно" },
          {
            id: 3,
            date: "2024-12-16 10:15",
            amount: 1500,
            status: "В обработке",
          },
          { id: 4, date: "2024-12-15 16:45", amount: 2000, status: "Успешно" },
          { id: 5, date: "2024-12-14 11:20", amount: 750, status: "Отклонено" },
        ];
        setWithdrawalHistory(mockData);
      } catch (error) {
        console.error("Ошибка загрузки истории выводов:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // При открытии истории загружаем данные
    useEffect(() => {
      if (showHistory) {
        loadWithdrawalHistory();
      }
    }, [showHistory]);

    const handleSubmit = async () => {
      const amount = Number(exchangeAmount);
      if (!amount || amount < 25000) {
        alert(t("bank.withdraw_modal.min_amount_alert"));
        return;
      }
      if (amount > userPdollarBalance) {
        alert(t("bank.withdraw_modal.insufficient_funds_alert"));
        return;
      }

      try {
        await bankStore.createManualWithdraw(amount);
        alert(t("bank.withdraw_modal.request_accepted_alert"));
        // Статус вашей заявки вы можете посмотреть в Истории транзакций.
        setExchangeAmount("");
        onClose();
      } catch (e) {
        console.error("Ошибка отправки заявки на вывод:", e);
        alert(t("bank.withdraw_modal.create_request_error_alert"));
      }
    };

    const handleShowHistory = () => {
      setShowHistory(true);
    };

    const handleBackToWithdrawal = () => {
      setShowHistory(false);
    };

    if (!isOpen) return null;

    // Если показываем историю выводов - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ МУЛЬТИЯЗЫЧНОСТИ
    if (showHistory) {
      return (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
            <h2 className="text-xl mb-6 font-bold">История выводов</h2>

            {/* Таблица истории выводов */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-amber-300">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="border border-amber-300 px-3 py-2 text-left text-sm">
                      Дата/время
                    </th>
                    <th className="border border-amber-300 px-3 py-2 text-left text-sm">
                      Сумма
                    </th>
                    <th className="border border-amber-300 px-3 py-2 text-left text-sm">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-amber-300 px-3 py-4 text-center"
                      >
                        <div className="flex justify-center items-center">
                          <span className="text-amber-600">Загрузка...</span>
                        </div>
                      </td>
                    </tr>
                  ) : withdrawalHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-amber-300 px-3 py-4 text-center"
                      >
                        <span className="text-gray-500">
                          Нет данных для отображения
                        </span>
                      </td>
                    </tr>
                  ) : (
                    withdrawalHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50">
                        <td className="border border-amber-300 px-3 py-2 text-sm">
                          {item.date}
                        </td>
                        <td className="border border-amber-300 px-3 py-2 text-sm">
                          {item.amount.toLocaleString()} TON
                        </td>
                        <td className="border border-amber-300 px-3 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              item.status === "Успешно"
                                ? "bg-green-100 text-green-800"
                                : item.status === "Отклонено"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Кнопка возврата */}
            <div className="flex justify-center">
              <button
                onClick={handleBackToWithdrawal}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Назад
              </button>
            </div>

            {/* Кнопка закрытия модального окна */}
            <button
              onClick={onClose}
              className="absolute -top-10 right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-10"
            >
              <img
                src={`${store.imgUrl}b_close.png`}
                alt="Закрыть"
                className="w-full h-full"
              />
            </button>
          </div>
        </div>
      );
    }

    // Основное окно вывода средств (с мультиязычностью)
    return (
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
          <h2 className="text-xl mb-4 font-bold">
            {t("bank.withdraw_modal.title")}
          </h2>

          {/* Блок баланса */}
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-semibold">
                {t("bank.withdraw_modal.balance_label")}
              </span>
              <span
                className={`font-bold ${
                  hasSufficientBalance ? "text-green-600" : "text-red-600"
                }`}
              >
                {userPdollarBalance.toLocaleString()}
              </span>
              <img
                src={`${store.imgUrl}icon_dollar_coin.png`}
                alt={t("bank.currency.pdollar")}
                className="w-4 h-4"
              />
            </div>
            {!hasSufficientBalance && (
              <div className="text-xs text-red-600 mt-1">
                {t("bank.withdraw_modal.insufficient_balance")}
              </div>
            )}
          </div>

          <div className="text-left text-sm font-medium text-amber-800 ">
            {t("bank.withdraw_modal.wallet_label")}
          </div>
          <div className="text-left text-xs text-amber-400 mb-4">
            {store.adrss.slice(0, 40)}...
          </div>

          {/* Ввод суммы */}
          <div className="mb-6">
            <label className="block text-left text-sm font-medium text-amber-800 mb-2">
              {t("bank.withdraw_modal.amount_label")}
            </label>
            <input
              type="number"
              value={exchangeAmount}
              onChange={(e) => setExchangeAmount(e.target.value)}
              placeholder={t("bank.withdraw_modal.amount_placeholder")}
              step="1000"
              className="w-full px-3 py-2 border-2 border-amber-800 rounded-lg text-amber-800 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="text-xs text-gray-600 mt-1 text-left">
              {t("bank.withdraw_modal.max_amount", {
                amount: userPdollarBalance.toLocaleString(),
              })}
            </div>
          </div>

          {/* Кнопка действия */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full font-bold py-3 px-6 rounded-lg transition mb-4 ${
              canSubmit
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {Number(exchangeAmount) < 25000
              ? t("bank.withdraw_modal.min_amount_button")
              : t("bank.withdraw_modal.confirm_button")}
          </button>

          {/* Кнопка перехода к истории выводов */}
          <button
            onClick={handleShowHistory}
            className="w-full text-center py-3 text-amber-600 hover:text-amber-800 font-medium transition-colors border-t border-amber-200 pt-4"
          >
            История выводов →
          </button>
          <div className="text-left text-sm font-medium text-amber-800 mt-4">
            {t("bank.withdraw_modal.last_withdraw_label")}
          </div>
          <div className="text-left text-xs text-gray-600">
            ё 12/18/2025 17:59
          </div>
          <div className="text-left text-xs text-gray-600">1000 TON</div>
          <div className="text-left text-xs text-green-600">
            {t("bank.withdraw_modal.successful_status")}
          </div>

          <button
            onClick={onClose}
            className="absolute -top-10 right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-10"
          >
            <img
              src={`${store.imgUrl}b_close.png`}
              alt={t("bank.withdraw_modal.close_alt")}
              className="w-full h-full"
            />
          </button>
        </div>
      </div>
    );
  }
);

/* =======================================================================
   Административная модалка
   ======================================================================= */
const AdminModal = observer(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { t } = useTranslation();

    useEffect(() => {
      if (isOpen) {
        store.requestAdminData();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatWalletAddress = (address: string) => {
      if (address.length <= 12) return address;
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    // Функция для перевода статуса
    const translateStatus = (status: string) => {
      switch (status) {
        case "APPROVED":
          return t("bank.admin_modal.approved")
        case "PENDING":
          return t("bank.admin_modal.pending")
        default:
          return status;
      }
    };

    return (
      <div className="fixed inset-0 z-70 bg-black flex items-center justify-center p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-80"
        >
          <img
            src={`${store.imgUrl}b_close.png`}
            alt={t("bank.admin_modal.close_alt")}
            className="w-full h-full"
          />
        </button>
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t("bank.admin_modal.title")}</h2>
          </div>
          {/* Таблица */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-amber-300">
              <thead>
                <tr className="bg-amber-100">
                  <th className="border border-amber-300 px-3 py-2 text-left">
                    {t("bank.admin_modal.telegram_id")}
                  </th>
                  <th className="border border-amber-300 px-3 py-2 text-left">
                    {t("bank.admin_modal.wallet_address")}
                  </th>
                  <th className="border border-amber-300 px-3 py-2 text-left">
                    {t("bank.admin_modal.amount_ton")}
                  </th>
                  <th className="border border-amber-300 px-3 py-2 text-left">
                    {t("bank.admin_modal.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {store.adminData.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50">
                    <td className="border border-amber-300 px-3 py-2">
                      {item.telegramId}
                    </td>
                    <td className="border border-amber-300 px-3 py-2 font-mono text-sm">
                      {formatWalletAddress(item.walletAdd)}
                    </td>
                    <td className="border border-amber-300 px-3 py-2">
                      {item.amountTon.toFixed(2)}
                    </td>
                    <td className="border border-amber-300 px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : item.status === "PENDING"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {translateStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {store.adminData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-amber-300 px-3 py-4 text-center text-gray-500"
                    >
                      {t("bank.admin_modal.no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Информация о количестве записей */}
          <div className="mt-4 text-sm text-gray-600">
            {t("bank.admin_modal.total_records", {
              count: store.adminData.length,
            })}
          </div>
        </div>
      </div>
    );
  }
);

/* =======================================================================
   Основной компонент Bank
   ======================================================================= */

const Bank = observer(() => {
  const { t } = useTranslation();
  const [tonAmount, setTonAmount] = useState(0.5);
  const [pdollarAmount, setPdollarAmount] = useState("25000");
  const [tonExchangeAmount, setTonExchangeAmount] = useState("0.25");
  const [pcoinAmount, setPcoinAmount] = useState("500");
  const [buying, setBuying] = useState(false);

  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const PDOLLAR_TO_TON_RATE = 0.00001;

  useEffect(() => {
    const isAdmin = store.checkIsAdmin();
    if (isAdmin) {
      console.log("👑 Администратор обнаружен, открываем админку");
      setIsAdminModalOpen(true);
    }
  }, []);

  const handleBuy = async () => {
    const parsed = parseInt(pcoinAmount);
    if (Number.isNaN(parsed) || parsed < 100) {
      alert(t("bank.buy_pcoin.min_pcoin_alert"));
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
          if (bankStore.order) setIsOrderModalOpen(true);
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

  // Логика открытия модалки с проверкой
  const handleExchange = () => {
    const amount = Number(pdollarAmount);

    // Если введено число меньше 25000 или вообще не число - не открываем
    if (!amount || amount < 25000) {
      alert(t("bank.exchange.min_exchange_alert"));
      return;
    }

    // Если всё ок, открываем
    setIsExchangeModalOpen(true);
  };

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
            value={Number(pizza) || 0}
            label={t("bank.currency.pizza")}
          />
          <CurrencyCard
            icon={`${store.imgUrl}icon_dollar_coin.png`}
            value={Number(pcoin) || 0}
            label={t("bank.currency.pcoin")}
          />
          <CurrencyCard
            icon={`${store.imgUrl}icon_dollar.png`}
            value={Number(pdollar) || 0}
            label={t("bank.currency.pdollar")}
          />
        </div>

        {/* 🍞 Верхняя шапка */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt={t("bank.other.testo_alt")}
            className="w-full h-auto"
          />
        </div>

        {/* 🏦 Логотип банка */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_bank.png`} alt={t("bank.title")} />
        </div>

        {/* Кнопка подключения ton connect */}
        <Link to="/ton-connect">
          <div className="absolute top-6 right-4 flex items-center space-x-3 z-40">
            {/* Блок с балансом TON */}
            <div className="relative">
              <img
                src={`${store.imgUrl}b_white.png`}
                alt={t("bank.ton_balance_alt")}
                className="w-16 h-10"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
                <img
                  src={`${store.imgUrl}icon_ton.png`}
                  alt={t("bank.ton_alt")}
                  className="w-4"
                />
                <span className="text-amber-800 text-sm shantell font-bold">
                  {Number(store.tonBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Контейнер для содержимого */}
        <div className="relative z-30 h-screen flex flex-col pt-36 sm:pt-44 pb-20">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-8 sm:gap-10 py-4">
              {/* 🪙 Первый блок — Покупка PCoin */}
              <div className="w-11/12 max-w-md">
                <div className="relative">
                  <img
                    src={`${store.imgUrl}img_window2.png`}
                    alt={t("bank.buy_pcoin.background_alt")}
                    className="w-full h-auto scale-y-110 object-contain"
                  />
                  <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
                    <div className="text-base text-center sm:text-lg text-amber-800 shantell mb-2 font-bold">
                      {t("bank.buy_pcoin.title")}
                    </div>

                    {/* Поле PCoin */}
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_dollar_coin.png`}
                      label={t("bank.buy_pcoin.pcoin_label")}
                      balance={store.pcoin ?? 0}
                      value={pcoinAmount}
                      onChange={(v) => {
                        setPcoinAmount(v);
                        setTonAmount(Number(v) / 1000);
                      }}
                      placeholder={t("bank.buy_pcoin.pcoin_placeholder")}
                      min={100}
                    />

                    {/* Стрелка */}
                    <ArrowDown />

                    {/* Поле TON */}
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_ton.png`}
                      label={t("bank.buy_pcoin.ton_label")}
                      balance={0}
                      value={String(tonAmount)}
                      onChange={(v) => setTonAmount(Number(v))}
                    />

                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell flex items-center justify-center">
                      {t("bank.buy_pcoin.rate")}
                      <img
                        src={`${store.imgUrl}icon_dollar_coin.png`}
                        alt={t("bank.buy_pcoin.pcoin_alt")}
                        className="w-6 h-6 sm:w-8 sm:h-8 ml-1"
                      />
                    </div>

                    {/* Кнопка покупки */}
                    <ActionButton
                      label={
                        buying
                          ? t("bank.buy_pcoin.creating_order")
                          : t("bank.buy_pcoin.buy_button")
                      }
                      disabled={buying}
                      onClick={handleBuy}
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
                    alt={t("bank.exchange.alt")}
                    className="w-full h-auto scale-y-110 object-contain"
                  />
                  <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
                    <div className="text-center text-lg sm:text-2xl mb-3 text-amber-800 shantell font-bold">
                      {t("bank.exchange.title")}
                    </div>

                    {/* Поле ввода PDollar */}
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_dollar.png`}
                      label={t("bank.exchange.pdollar_label")}
                      balance={store.pdollar ?? 0}
                      value={pdollarAmount}
                      onChange={(v) => {
                        const num = Number(v);
                        setPdollarAmount(v);

                        if (!isNaN(num)) {
                          const tonValue = num * PDOLLAR_TO_TON_RATE;
                          setTonExchangeAmount(tonValue.toFixed(5));
                        }
                      }}
                      placeholder={t("bank.exchange.pdollar_placeholder")}
                    />

                    <ArrowDown />
                    <CurrencyInput
                      icon={`${store.imgUrl}icon_ton.png`}
                      label={t("bank.exchange.ton_label")}
                      balance={0}
                      value={tonExchangeAmount}
                      onChange={(v) => {
                        const num = Number(v);
                        if (!isNaN(num)) {
                          setTonExchangeAmount(v);
                          const pdollarValue = num / PDOLLAR_TO_TON_RATE;
                          setPdollarAmount(String(Math.round(pdollarValue)));
                        }
                      }}
                    />

                    <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell">
                      {t("bank.exchange.rate")}
                    </div>

                    <ActionButton
                      label={t("bank.exchange.exchange_button")}
                      onClick={handleExchange}
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
      {isOrderModalOpen && (
        <BankOrderModal onClose={() => setIsOrderModalOpen(false)} />
      )}

      {/* модалка обмена */}
      {isExchangeModalOpen && (
        <ExchangeModal
          isOpen={isExchangeModalOpen}
          onClose={() => setIsExchangeModalOpen(false)}
          initialAmount={pdollarAmount}
        />
      )}

      {/* Административная модалка */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <Footer />
      <WebSocketComponent />
    </>
  );
});

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
          {(value ?? 0).toLocaleString()}
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
          <img src={icon} alt={label} className="w-8 sm:w-10" />
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
  const { t } = useTranslation();
  return (
    <div className="text-center mb-2">
      <img
        src={`${store.imgUrl}icon_arrow_down.png`}
        alt={t("bank.other.arrow_down_alt")}
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
      className={`relative w-full flex flex-col items-center justify-center transition-opacity ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : "hover:opacity-90 cursor-pointer"
      }`}
    >
      <img src={img} alt={label} className="w-1/2 h-2/3 z-50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        <span
          className={`${
            textColor || "text-amber-800"
          } text-md sm:text-lg shantell font-bold`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

export default Bank;
