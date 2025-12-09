// import { DOMAttributes } from "react";
//
// type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }> &
//   LibraryManagedAttributes;
//
// declare module "react/jsx-runtime" {
//   namespace JSX {
//     interface IntrinsicElements extends JSXInternal {
//       "adsgram-task": CustomElement<HTMLDivElement>;
//     }
//   }
// }
//
// export interface ShowPromiseResult {
//   done: boolean; // true, если досмотрено до конца (rewarded) или закрыто (interstitial)
//   description: string;
//   state: "load" | "render" | "playing" | "destroy";
//   error: boolean; // true при событии ошибки
// }
//
// interface AdsgramInitParams {
//   blockId: string; // уникальный идентификатор рекламного блока
//   debug?: boolean; // debug режим (опционально)
//   debugBannerType?: BannerType; // тип тестового баннера (опционально)
// }
//
// type EventType =
//   | "onReward" // пользователь получил награду за просмотр рекламы
//   | "onComplete" // пользователь досмотрел Interstitial баннер или закрыл его
//   | "onStart" // первый кадр баннера отображён
//   | "onSkip" // пользователь пропустил рекламу
//   | "onBannerNotFound" // баннер для показа отсутствует
//   | "onNonStopShow" // пользователь пытается посмотреть несколько реклам подряд
//   | "onTooLongSession" // слишком долгая сессия, необходимо перезапустить приложение чтобы получать рекламу
//   | "onError"; // ошибка при рендере или воспроизведении рекламы
// type HandlerType = () => void; // функция обратного вызова для событий
//
// export interface AdController {
//   show(): Promise<ShowPromiseResult>;
//   addEventListener(event: EventType, handler: HandlerType): void; // подписывает на событие
//   removeEventListener(event: EventType, handler: HandlerType): void; // отписывает от события
//   destroy(): void; // прекращает показ рекламы и очищает ресурсы
// }
//
// declare global {
//   interface Window {
//     Adsgram?: {
//       init(params: { blockId: string }): AdController;
//     };
//     Telegram?: {
//       WebApp?: {
//         initData?: string;
//         platform?: string;
//       };
//     };
//   }
// }
//
// export {};
