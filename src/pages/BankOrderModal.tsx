import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import store from "../store/store";

import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

// Helpers
const CIRCLE_RADIUS = 40;
const CIRCLE_CIRC = 2 * Math.PI * CIRCLE_RADIUS;

function tonToNano(ton: string | number): string {
  const amount = typeof ton === "string" ? parseFloat(ton) : ton;
  return BigInt(Math.floor((amount || 0) * 1e9)).toString();
}

// Словарь отображения статусов
const statusUi: Record<
  string,
  { title: string; color: string; icon: string; animation?: string }
> = {
  NEW: {
    title: "Ожидает оплаты",
    color: "text-gray-700",
    icon: "🕓",
    animation: "animate-pulse",
  },
  WAITING_PAYMENT: {
    title: "Ожидание перевода",
    color: "text-blue-700",
    icon: "⌛",
    animation: "animate-pulse",
  },
  PAID: {
    title: "Оплачен успешно",
    color: "text-green-600",
    icon: "✅",
    animation: "animate-scale-pop",
  },
  EXPIRED: {
    title: "Время оплаты истекло",
    color: "text-red-500",
    icon: "⏰",
    animation: "animate-fade-in",
  },
  CANCELLED: {
    title: "Отменён",
    color: "text-yellow-600",
    icon: "⚠️",
    animation: "animate-fade-in",
  },
  FAILED: {
    title: "Ошибка оплаты",
    color: "text-red-600",
    icon: "❌",
    animation: "animate-shake",
  },
};

const BankOrderModal: React.FC = () => {
  const { order } = store.bank;

  const [timeLeft, setTimeLeft] = useState("00:00");
  const [percent, setPercent] = useState(100);

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const isWalletConnected = !!wallet;

  const isPaid = order?.status === "PAID";
  const isExpired = order?.status === "EXPIRED";
  const statusInfo = order?.status ? statusUi[order.status] : null;

  // Таймер до EXPIRES_AT
  useEffect(() => {
    if (!order?.expiresAt || isPaid || isExpired) return;

    const exp = new Date(order.expiresAt).getTime();
    const total = exp - Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(exp - now, 0);
      const progress = Math.max((remaining / total) * 100, 0);

      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setPercent(Math.floor(progress));
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);

      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt]);

  // Автообновление статуса заказа
  useEffect(() => {
    if (!order?.orderId || isPaid || isExpired) return;

    const interval = setInterval(() => {
      store.bank.fetchOrder(order.orderId); // ✅ исправлено
    }, 5000);

    return () => clearInterval(interval);
  }, [order?.orderId, order?.status]);

  if (!order) return null;

  const { orderId, amountTon, rate, merchantAddr, comment } = order;

  const handleTonConnectPayment = async () => {
    if (!merchantAddr || !amountTon || !comment) return;

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
        messages: [
          {
            address: merchantAddr,
            amount: tonToNano(amountTon),
            payload: `comment:${comment}`,
          },
        ],
      });

      console.log("✅ Запрос TonConnect отправлен");
    } catch (e) {
      console.warn("❌ Пользователь отменил отправку TON:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
        <h2 className="text-xl mb-4 font-bold">Оплата TON</h2>

        <div className="mb-2">
          Сумма: <strong className="text-blue-700">{amountTon} TON</strong>
        </div>

        {merchantAddr && (
          <div className="mb-1 text-sm break-all text-gray-800">
            Адрес: <strong>{merchantAddr}</strong>
          </div>
        )}

        {comment && (
          <div className="mb-2 text-sm text-gray-800 break-all">
            Комментарий: <strong>{comment}</strong>
          </div>
        )}

        <div className="mb-3 text-md font-semibold text-gray-800">
          Курс: 1 TON = {rate} PCoin
        </div>

        {/* QR-код */}
        <div className="my-4 flex justify-center">
          <QRCodeCanvas
            value={`ton://transfer/${merchantAddr}?amount=${tonToNano(
              amountTon ?? 0
            )}&text=${comment ?? ""}`}
            size={200}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {/* Статус */}
        {statusInfo && (
          <div
            className={`mt-4 text-md font-semibold flex items-center justify-center gap-2 ${statusInfo.color} ${statusInfo.animation}`}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.title}</span>
          </div>
        )}

        {/* Таймер */}
        {!isPaid && !isExpired && (
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
        )}

        {/* Кнопка Ton Connect */}
        {isWalletConnected && !isPaid && !isExpired && (
          <button
            onClick={handleTonConnectPayment}
            className="mb-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Оплатить через кошелёк
          </button>
        )}

        {/* Кнопка ручной проверки */}
        {!isPaid && !isExpired && (
          <button
            onClick={() => orderId && store.bank.fetchOrder(orderId)} // ✅ исправлено
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Я оплатил
          </button>
        )}

        <button
          onClick={() => (store.bank.order = null)}
          className="absolute top-2 right-2 text-[20px] text-gray-700 hover:text-red-900"
          title="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BankOrderModal;
