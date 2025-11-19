import React, { useEffect } from "react";
// import { QRCodeCanvas } from "qrcode.react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import store from "../store/store";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { encodeCommentAsPayload } from "../utils/ton";

// Helpers for QR progress ring
// const CIRCLE_RADIUS = 40;
// const CIRCLE_CIRC = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * Преобразует TON в наноTON (1 TON = 1e9)
 */
function tonToNano(ton: number): string {
  return BigInt(Math.floor(ton * 1e9)).toString();
}

/**
 * Генерирует ссылку для QR оплаты через tonkeeper / Telegram Wallet
 */
// function generateTonTransferLink(
//   address: string,
//   amountTon: number,
//   comment?: string
// ): string {
//   const amountNano = tonToNano(amountTon);
//   const encodedComment = encodeURIComponent(comment?.trim() || "");
//   return `ton://transfer/${address}?amount=${amountNano}&text=${encodedComment}`;
// }

// Словарь UI по статусу ордера
// const statusUi: Record<
//   string,
//   { title: string; color: string; icon: string; animation?: string }
// > = {
//   NEW: {
//     title: "Ожидает оплаты",
//     color: "text-gray-700",
//     icon: "🕓",
//     animation: "animate-pulse",
//   },
//   WAITING_PAYMENT: {
//     title: "Ожидание перевода",
//     color: "text-blue-700",
//     icon: "⌛",
//     animation: "animate-pulse",
//   },
//   PAID: {
//     title: "Оплачен успешно",
//     color: "text-green-600",
//     icon: "✅",
//     animation: "animate-scale-pop",
//   },
//   EXPIRED: {
//     title: "Время оплаты истекло",
//     color: "text-red-500",
//     icon: "⏰",
//     animation: "animate-fade-in",
//   },
//   CANCELLED: {
//     title: "Отменён",
//     color: "text-yellow-600",
//     icon: "⚠️",
//     animation: "animate-fade-in",
//   },
//   FAILED: {
//     title: "Ошибка оплаты",
//     color: "text-red-600",
//     icon: "❌",
//     animation: "animate-shake",
//   },
// };

interface BankOrderModalProps {
  onClose: () => void;
}

const BankOrderModal: React.FC<BankOrderModalProps> = ({ onClose }) => {
  const { order } = store.bank;

  // const [timeLeft, setTimeLeft] = useState("00:00");
  // const [percent, setPercent] = useState(100);

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const isPaid = order?.status === "PAID";
  const isExpired = order?.status === "EXPIRED";
  // const statusInfo = order?.status ? statusUi[order.status] : null;
  const numericAmountTon = Number(order?.amountTon ?? 0);

  // Таймер до истечения срока действия
  useEffect(() => {
    if (!order?.expiresAt || isPaid || isExpired) return;

    const exp = new Date(order.expiresAt).getTime();
    // const total = exp - Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(exp - now, 0);
      // const progress = Math.max((remaining / total) * 100, 0);

      // const mins = Math.floor(remaining / 60000);
      // const secs = Math.floor((remaining % 60000) / 1000);
      // setPercent(Math.floor(progress));
      // setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);

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

        <div className="mb-2">
          Сумма:{" "}
          <strong className="text-blue-700">{numericAmountTon} TON</strong>
        </div>

        {/* {merchantAddr && (
          <div className="mb-1 text-sm break-all text-gray-800">
            Платёжи на этот кошелёк: <strong>{merchantAddr}</strong>
          </div>
        )}

        {tonComment && (
          <div className="mb-2 text-sm text-gray-800 break-all">
            Комментарий: <strong>{tonComment}</strong>
          </div>
        )}

        <div className="mb-3 text-md font-semibold text-gray-800">
          Курс: 1 TON = {rate} PCoin
        </div> */}

        {/* QR-код */}
        {/* <div className="my-4 flex justify-center">
          {merchantAddress && numericAmountTon > 0 ? (
            <QRCodeCanvas
              value={generateTonTransferLink(
                merchantAddress,
                numericAmountTon,
                tonComment
              )}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          ) : (
            <div className="text-sm text-red-600">
              ⚠ Недостаточно данных для генерации QR.
            </div>
          )}
        </div> */}

        {/* Статус */}
        {/* {statusInfo && (
          <div
            className={`mt-4 text-md font-semibold flex items-center justify-center gap-2 ${statusInfo.color} ${statusInfo.animation}`}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.title}</span>
          </div>
        )} */}

        {/* Таб таймера */}
        {/* {!isPaid && !isExpired && (
          <div className="my-4 flex justify-center">
            <div className="relative w-[100px] h-[100px]">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={CIRCLE_RADIUS}
                  stroke="#eee"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={CIRCLE_RADIUS}
                  stroke="url(#gradient-ring)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={CIRCLE_CIRC}
                  strokeDashoffset={(1 - percent / 100) * CIRCLE_CIRC}
                  strokeLinecap="round"
                  className="pulse-ring"
                />
                <defs>
                  <linearGradient
                    id="gradient-ring"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#8e44ad" />
                    <stop offset="50%" stopColor="#e67e22" />
                    <stop offset="100%" stopColor="#f1c40f" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-md font-bold text-amber-900">
                {timeLeft}
              </div>
            </div>
          </div>
        )} */}

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

        {/* "Я оплатил" — ручной refresh */}
        {/* {!isPaid && !isExpired && (
          <button
            onClick={() => orderId && store.bank.fetchOrder(orderId)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Я оплатил
          </button>
        )} */}

        {/* Закрыть */}
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
