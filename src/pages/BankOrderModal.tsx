import React, { useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import store from "../store/store";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { encodeCommentAsPayload } from "../utils/ton";

/**
 * Преобразует TON в наноTON (1 TON = 1e9)
 */
function tonToNano(ton: number): string {
  return BigInt(Math.floor(ton * 1e9)).toString();
}

// функция для расчета суммы к зачислению
const calculatePcoinAmount = (tonAmount: number): number => {
  const pcoinBeforeFee = tonAmount * 1000; // 1 TON = 1000 PCoin
  const referralFee = pcoinBeforeFee * 0.07; // 7% комиссия
  return Math.floor(pcoinBeforeFee - referralFee);
};

interface BankOrderModalProps {
  onClose: () => void;
}

const BankOrderModal: React.FC<BankOrderModalProps> = ({ onClose }) => {
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
    // const total = exp - Date.now();

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
        window.history.replaceState(null, "", "/bank"); // или navigate("/bank")
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPaid, isExpired]);

  if (!order) return null;

  const {
    // orderId,
    merchantAddr,
    // rate,
    tonComment = order.tonComment || "",
  } = order;

  const handleTonConnectPayment = async () => {
    onClose();
    if (store.bank.order) {
      store.bank.order = null;
    }
    if (!merchantAddr || numericAmountTon <= 0 || !tonComment) return;

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: merchantAddr,
            amount: tonToNano(numericAmountTon),
            payload: encodeCommentAsPayload(tonComment),
          },
        ],
      });

      console.log("✅ Транзакция отправлена");
    } catch (e) {
      console.warn("❌ Отменено пользователем или ошибка", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[50] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
        <h2 className="text-xl mb-4 font-bold">Оплата TON</h2>

        {/* Новый блок с суммами */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-amber-800 shantell">Сумма к оплате:</span>
            <strong className="text-blue-700 shantell">
              {numericAmountTon} TON
            </strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-amber-800 shantell">Сумма к зачислению:</span>
            <strong className="text-green-700 shantell">
              {calculatePcoinAmount(numericAmountTon)} PCoin
            </strong>
          </div>

          <div className="text-xs text-gray-600 text-left mt-1">
            *Из суммы пополнения вычитается 7% на реферальное вознаграждение.
          </div>
        </div>

        {/* Остальной код без изменений */}
        {!wallet && (
          <div className="mb-4 flex justify-center">
            <TonConnectButton />
          </div>
        )}

        {wallet && !isPaid && !isExpired && (
          <button
            onClick={handleTonConnectPayment}
            className="mb-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition"
          >
            💸 Оплатить через кошелёк
          </button>
        )}

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
};

export default BankOrderModal;
