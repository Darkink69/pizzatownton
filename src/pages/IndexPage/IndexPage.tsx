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
  // console.log(initDataRaw);
  // console.log(initDataState);

  // const initData = window.Telegram.WebApp.initData;
  // const initData = (window as any).Telegram?.WebApp?.initData;

  // Проверка окружения запуска
  useEffect(() => {
    if (!window.Telegram?.WebApp) {
      setError("Приложение должно быть запущено через Telegram бота");
      return;
    }

    // Инициализация Mini App
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();

    const webApp = window.Telegram.WebApp;
    console.log(webApp);
  }, []);

  // Обработка данных пользователя
  useEffect(() => {
    if (!initDataRaw) {
      console.warn("initDataRaw отсутствует");
      setError("Не удалось получить данные инициализации Telegram");
      console.log(error);
      return;
    }

    if (initDataState?.user) {
      store.setUser(initDataState.user);
      console.log("Пользователь установлен:", initDataState.user);
      // console.log("Весь state:", initDataState);
    }

    // Регистрация пользователя с отправкой ПОЛНОЙ строки initDataRaw
    registerUser(initDataRaw);
  }, [initDataRaw, initDataState]);

  // Функция регистрации с отправкой ПОЛНОЙ строки initData
  const registerUser = async (rawInitData: string) => {
    try {
      const domain = import.meta.env.VITE_API_URL;
      console.log("Отправка полной initData на бэкенд для верификации...");

      const response = await fetch(`${domain}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initDataRaw: rawInitData, // Отправляем ПОЛНУЮ строку
          // referrerId: referrerId // <-- ПЕРЕДАЕМ ID РЕФЕРЕРА
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Пользователь успешно зарегистрирован:", data);
      store.setUserState(data);
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      setError(
        `Ошибка регистрации: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  // useEffect(() => {
  //   fetch(
  //     `https://toncenter.com/api/v2/getAddressBalance?address=UQDncYGSo8oA2jQVZwolIiTdylIE4QAeNtrpkmwW9sYjX0bB`
  //     `https://toncenter.com/api/v2/getAddressBalance?address=UQDoj1UzJasYurg5oLsfA69pmVG7ATWTxyxawgfGFvLffbX8`
  //   )
  //     .then((response) => response.json())
  //     .then((data) => store.setTons(data.result))
  //     .catch((error) => console.error(error));
  // }, []);

  return (
    <Page back={false}>
      <div className="bg-gray-800 min-h-screen flex items-center justify-center">
        <Home />
      </div>
    </Page>
  );
});
