// Создайте новый файл websocket.demo.tsx или модифицируйте существующий:

import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import store from "../store/store";
import type { WsRequest } from "../types/ws";

// Моковые данные для демо
const mockFloorsData = {
  success: true,
  data: {
    userFloorList: [
      {
        floorId: 1,
        name: "Basement",
        owned: true,
        level: 1,
        incomePerHour: 100,
        purchaseCost: null,
        upgradeAmount: 500,
        upgradeCurrency: "pcoin",
        staff: [
          { staffId: 1, staffName: "Guard", staffLevel: 1, owned: true },
          { staffId: 2, staffName: "Manager", staffLevel: 0, owned: false },
        ],
      },
      {
        floorId: 2,
        name: "Floor 1",
        owned: true,
        level: 2,
        incomePerHour: 250,
        purchaseCost: 1000,
        upgradeAmount: 1000,
        upgradeCurrency: "pcoin",
        staff: [],
      },
      {
        floorId: 3,
        name: "Floor 2",
        owned: false,
        level: 0,
        incomePerHour: 500,
        purchaseCost: 5000,
        upgradeAmount: 2500,
        upgradeCurrency: "pcoin",
        staff: [],
      },
    ],
    pdollarAmount: 1000,
    pizzaAmount: 50000,
    user: { pcoin: 5000, pdollar: 1000, pizza: 50000 },
  },
};

const WebSocketComponent = observer(() => {
  const mockIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Проверяем, запущено ли в Telegram
    const isTelegramWebApp = !!(window as any).Telegram?.WebApp?.initDataUnsafe;

    if (!isTelegramWebApp) {
      console.log("🎮 Демо-режим: WebSocket отключен, использую мок-данные");

      // Устанавливаем моковые данные
      store.setFloorsData(mockFloorsData);
      store.setSessionId(`demo_session_${Date.now()}`);
      store.isAuthed = true;

      // Создаем моковый sender
      const mockSend = (rq: WsRequest): boolean => {
        console.log("📨 [DEMO] Mock request:", rq.type);

        // Симулируем ответы на некоторые запросы
        setTimeout(() => {
          switch (rq.type) {
            case "CHEST_GET_STATE":
              store.updateChestsState({
                keys: { task: 3, referral: 2, deposit: 1 },
                pieces: { common: 10, uncommon: 5, rare: 2, mystical: 1 },
              });
              break;
            case "REFERRAL_GET":
              store.setReferralData({
                totalReferrals: 5,
                earnedPcoin: 500,
                earnedPdollar: 50,
                link: "https://t.me/demo_bot?start=ref_demo",
                levels: [],
              });
              break;
            case "CLAIM_REFRESH":
              store.updateClaimProgress(Math.floor(Math.random() * 100));
              break;
          }
        }, 100);

        return true;
      };

      store.setWsSend(mockSend);

      // Симулируем периодическое обновление прогресса
      mockIntervalRef.current = window.setInterval(() => {
        if (store.sessionId) {
          const progress = Math.min(
            100,
            store.claimProgress + Math.random() * 10,
          );
          store.updateClaimProgress(progress);
        }
      }, 30000);

      return () => {
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
        }
      };
    }

    // Оригинальная логика WebSocket для Telegram...
    // (оставьте существующий код здесь)
  }, []);

  return null;
});

export default WebSocketComponent;
