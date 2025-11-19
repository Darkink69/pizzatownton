import React, { useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import store from "../store/store";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { encodeCommentAsPayload } from "../utils/ton";

function tonToNano(ton: number): string {
  return BigInt(Math.floor(ton * 1e9)).toString();
}

const BankOrderModal: React.FC = () => {
  const { order } = store.bank;

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const isPaid = order?.status === "PAID";
  const isExpired = order?.status === "EXPIRED";
  const numericAmountTon = Number(order?.amountTon ?? 0);

  // Таймер до истечения срока действия
  useEffect(() => {
    if (!order?.expiresAt || isPaid || isExpired) return;

    const exp = new Date(order.expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(exp - now, 0);

      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt]);

  // Автообновление статуса ордера
  useEffect(() => {
    if (!order?.orderId || isPaid || isExpired) return;

    const interval = setInterval(() => {
      store.bank.fetchOrder(order.orderId);
    }, 5000);

    return () => clearInterval(interval);
  }, [order?.orderId, order?.status]);

  // Автоматическое закрытие модалки при успешной оплате или истечении времени
  useEffect(() => {
    if (isPaid || isExpired) {
      const timer = setTimeout(() => {
        store.bank.order = null;
        window.history.replaceState(null, "", "/bank");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPaid, isExpired]);

  const handleTonConnectPayment = async () => {
    // СРАЗУ ЗАКРЫВАЕМ МОДАЛЬНОЕ ОКНО ПРИ НАЖАТИИ
    store.bank.order = null;

    if (!order?.merchantAddr || numericAmountTon <= 0 || !order?.tonComment)
      return;

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: order.merchantAddr,
            amount: tonToNano(numericAmountTon),
            payload: encodeCommentAsPayload(order.tonComment),
          },
        ],
      });

      console.log("✅ Транзакция отправлена");
    } catch (e) {
      console.warn("❌ Отменено пользователем или ошибка", e);
    }
  };

  if (!order) return null;

  // const {
  //   merchantAddr,
  //   tonComment = order.tonComment || "",
  // } = order;

  return (
    <div className="fixed inset-0 z-[50] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
        <h2 className="text-xl mb-4 font-bold">Оплата TON</h2>

        <div className="mb-2">
          Сумма:{" "}
          <strong className="text-blue-700">{numericAmountTon} TON</strong>
        </div>

        {/* Подключение кошелька */}
        {!wallet && (
          <div className="mb-4 flex justify-center">
            <TonConnectButton />
          </div>
        )}

        {/* Кнопка оплаты через TonConnect */}
        {wallet && !isPaid && !isExpired && (
          <button
            onClick={handleTonConnectPayment}
            className="mb-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition"
          >
            💸 Оплатить через кошелёк
          </button>
        )}

        {/* Закрыть */}
        <button
          onClick={() => (store.bank.order = null)}
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
};

export default BankOrderModal;
