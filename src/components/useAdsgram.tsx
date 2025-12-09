// import { useCallback, useEffect, useRef } from "react";
// import type { AdController, ShowPromiseResult } from "../adsgram";
//
// type Options = {
//   blockId?: string; //
//   onReward?: () => void; // для rewarded формата
//   onComplete?: () => void; // для interstitial формата (когда баннер закрыли)
//   onError?: (err: unknown) => void;
// };
//
// const DEFAULT_BLOCK_ID = "task-18813";
//
// function loadScriptOnce(src: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (document.querySelector(`script[src="${src}"]`)) return resolve();
//     const s = document.createElement("script");
//     s.src = src;
//     s.async = true;
//     s.onload = () => resolve();
//     s.onerror = () => reject(new Error(`Failed to load ${src}`));
//     document.head.appendChild(s);
//   });
// }
//
// export function useAdsgram({
//   blockId = DEFAULT_BLOCK_ID,
//   onReward,
//   onComplete,
//   onError,
// }: Options) {
//   const controllerRef = useRef<AdController | null>(null);
//   const loadingRef = useRef(false);
//
//   // cleanup на размонтировании
//   useEffect(() => {
//     return () => {
//       controllerRef.current = null;
//       loadingRef.current = false;
//     };
//   }, []);
//
//   return useCallback(async () => {
//     try {
//       if (loadingRef.current) return; // защита от двойного клика
//       loadingRef.current = true;
//
//       const tg = window.Telegram?.WebApp;
//       if (!tg?.initData) {
//         console.warn(
//           "[Adsgram] WebApp.initData пуст — запуск, возможно, не в мобильном Telegram. Возможен тестовый креатив."
//         );
//       }
//
//       await loadScriptOnce("https://sad.adsgram.ai/js/sad.min.js");
//
//       const Adsgram = window.Adsgram;
//       if (!Adsgram?.init)
//         throw new Error("Adsgram SDK not found / init missing");
//
//       if (!controllerRef.current) {
//         controllerRef.current = Adsgram.init({ blockId });
//       }
//
//       const controller = controllerRef.current!;
//       const res: ShowPromiseResult = await controller.show();
//
//       // Для rewarded: then означает досмотр до конца => можно награждать
//       // Для interstitial: then означает закрытие => награды нет, но можно дернуть onComplete
//       if (res.error) {
//         onError?.(res);
//       } else {
//         onReward?.(); // используйте для rewarded-блока
//         onComplete?.(); // если используете interstitial-блок — можно повесить свою логику
//       }
//     } catch (e) {
//       onError?.(e);
//     } finally {
//       loadingRef.current = false;
//     }
//   }, [blockId, onReward, onComplete, onError]);
// }
