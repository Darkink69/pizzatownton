import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { observer } from "mobx-react-lite";
import WebSocketComponent from "../components/websocket";
import { routes } from "../navigation/routes";
import store from "../store/store";
import Preloader from "./Preloader";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const App = observer(() => {
  const [showLoading, setShowLoading] = useState(true);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  useEffect(() => {
    // Проверяем окружение
    const hasTelegram = !!(window as any).Telegram?.WebApp?.initDataUnsafe;
    setIsTelegramEnv(hasTelegram);

    if (hasTelegram) {
      console.log("🎮 Демо-режим");

      // Создаем мокового пользователя
      const mockUser = {
        id: Date.now(),
        telegramId: Date.now(),
        first_name: "Demo",
        last_name: "User",
        username: "demouser",
        language_code: "en",
        is_premium: true,
      };

      store.setUser(mockUser);
      store.setInitDataRaw(`demo_init_data_${Date.now()}`);
      // store.setAuthenticated(true);

      // Завершаем загрузку
      setTimeout(() => {
        setShowLoading(false);
      }, 1500);
    } else {
      // Telegram режим
      const timer = setTimeout(() => setShowLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showLoading) {
    return <Preloader />;
  }

  // Убираем проверку store.authError для демо
  return (
    <div className={!isTelegramEnv ? "light" : undefined}>
      <LanguageSwitcher />

      {/* WebSocketComponent сам определит режим работы */}
      <WebSocketComponent />

      <Routes>
        {routes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
});
