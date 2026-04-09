import { observer } from "mobx-react-lite";
import store from "../../store/store";
import { useEffect, useState, type FC } from "react";
import { Page } from "../../components/Page";
import Home from "../Home";

export const IndexPage: FC = observer(() => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Убрать проверку window.Telegram?.WebApp

    // Создаем моковые данные для демо
    const mockUser = {
      id: Date.now(), // уникальный ID для демо
      first_name: "Demo",
      last_name: "User",
      username: "demouser",
      language_code: "en",
      is_premium: true,
    };

    const mockInitDataRaw = `query_id=demo_${Date.now()}&user=${JSON.stringify(mockUser)}&auth_date=${Math.floor(Date.now() / 1000)}&hash=demo_hash`;

    // Сохраняем в store
    store.setInitDataRaw(mockInitDataRaw);
    store.setUser(mockUser);

    // Симуляция загрузки
    setTimeout(() => {
      setLoading(false);
    }, 500);

    console.log("Демо-режим: приложение запущено без Telegram");
  }, []);

  if (loading) {
    return (
      <Page back={false}>
        <div className="bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white">Загрузка демо-приложения...</div>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <div className="bg-gray-800 min-h-screen">
        <Home />
      </div>
    </Page>
  );
});
