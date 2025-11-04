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

function generateRequestId(): string {
  return "auth_" + Math.random().toString(36).slice(2, 8);
}

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

    // debug info
    console.log("Telegram WebApp detected:", window.Telegram.WebApp);
  }, []);

  // Основной хук: инициализация и авторизация по WS
  useEffect(() => {
    if (!initDataRaw) {
      console.warn("initDataRaw отсутствует");
      setError("Не удалось получить initData от Telegram");
      return;
    }

    // Telegram user (вырезан из сигнатуры initDataState)
    if (initDataState?.user) {
      store.setUser(initDataState.user);
      console.log("Пользователь установлен:", initDataState.user);
    }

    // Сохраняем raw initData в стор (может пригодиться потом)
    store.setInitDataRaw(initDataRaw);

    // Отправляем AUTH_INIT через WebSocket
    store.send({
      type: "AUTH_INIT",
      requestId: generateRequestId(),
      session: "",
      authReq: {
        initData: initDataRaw,
        referralCode: store.referrerId ?? null,
      },
    });
  }, [initDataRaw, initDataState]);

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