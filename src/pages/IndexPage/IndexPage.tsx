import { observer } from "mobx-react-lite";
import store from "../../store/store";
import { useEffect, useState, type FC } from "react";
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from "@telegram-apps/sdk-react";
import { Page } from "../../components/Page";
import Home from "../Home";

export const IndexPage: FC = observer(() => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, что запущено в Telegram WebApp
  useEffect(() => {
    if (!window.Telegram?.WebApp) {
      setError("Приложение должно быть запущено через Telegram бота");
      return;
    }
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }, []);

  // Сохраняем initData/user в store (WS авторизация делается в WebSocketComponent)
  useEffect(() => {
    if (!initDataRaw) {
      console.warn("initDataRaw отсутствует");
      setError("Не удалось получить initData от Telegram");
      return;
    }

    // сохраняем raw initData
    store.setInitDataRaw(initDataRaw);

    // сохраняем user (если есть)
    if (initDataState?.user) {
      store.setUser(initDataState.user);
    }
  }, [initDataRaw, initDataState?.user]);

  return (
      <Page back={false}>
        <div className="bg-gray-800 min-h-screen flex items-center justify-center">
          {error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
              <Home />
          )}
        </div>
      </Page>
  );
});