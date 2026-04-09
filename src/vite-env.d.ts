// Файл: src/vite-env.d.ts

/// <reference types="vite/client" />

// Этот интерфейс "расширяет" стандартное определение объекта window,
// добавляя в него информацию о Telegram Web App.
interface Window {
  Telegram: {
    WebApp: {
      // initDataUnsafe: any;
      // Здесь мы описываем только те поля и методы, которые реально используем в коде
      initData?: string;
      ready: () => void;
      expand: () => void;
    };
  };
  Adsgram: {
    init(params: AdsgramInitParams): AdController; // инициализация AdsGram
  };
}
