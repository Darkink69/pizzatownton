import React, { useEffect, useState } from "react";
import store from "../store/store";
import { QRCodeCanvas } from "qrcode.react";

// Конвертация TON в nanoTON (для URL тонкой оплаты)
const tonToNano = (ton: string): string => {
    const val = parseFloat(ton);
    return isNaN(val) ? "0" : Math.floor(val * 1e9).toString();
};

// Радиальный круг
const CIRCLE_RADIUS = 40;
const CIRCLE_CIRC = 2 * Math.PI * CIRCLE_RADIUS;

export const BankOrderModal: React.FC = () => {
    const { order } = store.bank;
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [percent, setPercent] = useState(100);

    const isConfirmed = order?.status === "CONFIRMED";

    // Таймер отображения времени и прогресса
    useEffect(() => {
        if (!order?.expiresAt || !order?.createdAt) return;

        const exp = new Date(order.expiresAt).getTime();
        const start = new Date(order.createdAt).getTime();
        const duration = exp - start;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, exp - now);
            const progress = Math.max((remaining / duration) * 100, 0);

            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setPercent(Math.floor(progress));
            setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);

            if (remaining <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [order?.expiresAt, order?.createdAt]);

    // Автообновление статуса
    useEffect(() => {
        if (!order || isConfirmed) return;

        const interval = setInterval(() => {
            store.bankRequestOrderView();
        }, 5000);

        return () => clearInterval(interval);
    }, [order, isConfirmed]);

    // Авто-закрытие по подтверждению
    useEffect(() => {
        if (!isConfirmed) return;

        const timeout = setTimeout(() => {
            store.bank.order = null;
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isConfirmed]);

    if (!order) return null;

    const { amountTon, rate, merchantAddr, comment } = order;

    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
                <h2 className="text-xl mb-4 font-bold">Оплата TON</h2>

                <div className="mb-2">
                    Сумма к оплате:{" "}
                    <strong className="text-blue-700">{amountTon} TON</strong>
                </div>

                {merchantAddr && (
                    <div className="mb-2 text-sm break-all">
                        Адрес:{" "}
                        <strong className="text-gray-800">{merchantAddr}</strong>
                    </div>
                )}

                {comment && (
                    <div className="mb-2 text-sm break-all">
                        Комментарий:{" "}
                        <strong className="text-gray-800">{comment}</strong>
                    </div>
                )}

                <div className="mb-4">
                    Курс:{" "}
                    <span className="text-md font-semibold text-gray-800">
            1 TON = {rate} PCOIN
          </span>
                </div>

                {/* QR-код */}
                {merchantAddr && comment && amountTon && (
                    <div className="mb-4 flex justify-center">
                        <QRCodeCanvas
                            value={`ton://transfer/${merchantAddr}?amount=${tonToNano(
                                amountTon
                            )}&text=${comment}`}
                            size={200}
                            level="M"
                            bgColor="#fff"
                            fgColor="#000"
                            marginSize={4} // ✅ заменено с includeMargin
                        />
                    </div>
                )}

                {/* Цветной SVG таймер */}
                <div className="my-4 flex justify-center">
                    <div className="relative w-[100px] h-[100px]">
                        <svg className="w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8e44ad" />
                                    <stop offset="50%" stopColor="#e67e22" />
                                    <stop offset="100%" stopColor="#f1c40f" />
                                </linearGradient>
                            </defs>

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
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-md font-bold text-amber-900">
                            {timeLeft}
                        </div>
                    </div>
                </div>

                {/* ✅ Подтверждение */}
                {isConfirmed ? (
                    <div className="mt-4 animate-scale-pop text-green-600 text-lg font-bold">
                        ✅ Оплата подтверждена
                    </div>
                ) : (
                    <button
                        onClick={() => store.bankRequestOrderView()}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                    >
                        Я оплатил
                    </button>
                )}

                {/* ❌ Закрытие вручную */}
                {!isConfirmed && (
                    <button
                        onClick={() => (store.bank.order = null)}
                        className="absolute top-2 right-2 text-[20px] text-gray-700 hover:text-red-900"
                        title="Закрыть"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};