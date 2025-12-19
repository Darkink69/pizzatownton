import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Friends = observer(() => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // Получаем текущие переводы
  const t = store.currentTranslations;

  // -------------------- запросим статистику при загрузке --------------------
  useEffect(() => {
    if (store.sessionId && store.user?.telegramId) {
      console.log("📨 Requesting staff info...");
      store.requestReferralInfo();
    }
  }, [store.sessionId, store.user?.telegramId]);

  // -------------------- копирование ссылки --------------------
  function tryExecCommandCopy(text: string): boolean {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.readOnly = true;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function tryClipboardCopy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  const handleCopy = async () => {
    const link = store.referral.link;
    if (!link) return;

    let ok = tryExecCommandCopy(link);
    if (!ok) ok = await tryClipboardCopy(link);

    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 600);
    }
  };

  const { link, earnedPcoin, earnedPdollar, totalReferrals } = store.referral;

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Переключатель языков */}
        <LanguageSwitcher />

        {/* фон */}
        <div className="absolute inset-0 bg-[#FFBC6B]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${store.imgUrl}bg_pizza.png')` }}
          />
        </div>

        {/* «тесто» шапка */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full h-auto"
          />
        </div>

        {/* картинка друзей */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_friends.png`} alt="friends" />
        </div>

        {/* окно */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
          <div className="relative">
            <img
              src={`${store.imgUrl}img_window2.png`}
              alt="Modal background"
              className="w-full h-auto scale-y-110 object-contain"
            />

            <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
              {/* заголовок */}
              <div className="text-center text-lg sm:text-2xl mb-2 text-amber-800 shantell font-bold">
                {t.title}
              </div>

              {/* ссылка */}
              <input
                ref={inputRef}
                type="text"
                value={link || t.loading}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className="bg-white rounded-xl px-4 py-3 mb-4 border-2 border-amber-800 shadow-inner text-center font-bold text-base sm:text-lg text-amber-800 shantell truncate"
                placeholder={t.referralLink}
              />

              {/* кнопка копировать */}
              <button
                className={`relative w-full flex justify-center mb-4 transition-all duration-200 ${
                  copied ? "brightness-125" : "brightness-100"
                }`}
                onClick={handleCopy}
                disabled={!link}
              >
                <img
                  src={`${store.imgUrl}b_yellow.png`}
                  alt="copy"
                  className="w-1/2 h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-800 text-lg sm:text-xl shantell">
                    {t.copyButton}
                  </span>
                </div>
              </button>

              {/* описание */}
              <div className="text-center mb-5 text-amber-800 font-bold text-base sm:text-lg shantell leading-tight">
                {t.description}
                <img
                  src={`${store.imgUrl}icon_dollar_coin.png`}
                  alt="coin"
                  className="w-6 sm:w-8 inline-block mx-1"
                />
                <img
                  src={`${store.imgUrl}icon_dollar.png`}
                  alt="dollar"
                  className="w-8 sm:w-10 inline-block mx-1"
                />
              </div>

              {/* заголовок статистики */}
              <div className="text-center font-bold text-lg sm:text-2xl mb-5 text-amber-800 shantell">
                {t.subtitle}
              </div>

              {/* три блока статистики */}
              <div className="flex justify-between gap-3">
                <StatBlock
                  icon={`${store.imgUrl}icon_dollar.png`}
                  value={`+${(earnedPdollar ?? 0).toLocaleString()}`}
                  label={t.statistics.pdollar}
                />
                <StatBlock
                  icon={`${store.imgUrl}icon_dollar_coin.png`}
                  value={`+${(earnedPcoin ?? 0).toLocaleString()}`}
                  label={t.statistics.pcoin}
                />
                <StatBlock
                  icon={`${store.imgUrl}icon_friends.png`}
                  value={`+${totalReferrals ?? 0}`}
                  label={t.statistics.friends}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WebSocketComponent />
    </>
  );
});

function StatBlock({
  icon,
  value,
}: // label,
{
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="relative flex-1">
      <img
        src={`${store.imgUrl}b_white.png`}
        alt="bg"
        className="w-full h-auto"
      />
      <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-3 px-2 py-1">
        <img src={icon} alt="icon" className="w-8 sm:w-10 inline-block" />
        <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
          {value}
        </span>
      </div>
    </div>
  );
}

export default Friends;
// import { useEffect, useRef, useState } from "react";
// import { observer } from "mobx-react-lite";
// import store from "../store/store";
// import Footer from "../components/Footer";
// import WebSocketComponent from "../components/websocket";

// const Friends = observer(() => {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [copied, setCopied] = useState(false);
//   const [_copyError, setCopyError] = useState<string | null>(null);
//   // -------------------- запросим статистику при загрузке --------------------
//   useEffect(() => {
//     if (store.sessionId && store.user?.telegramId) {
//       console.log("📨 Requesting staff info...");
//       store.requestReferralInfo();
//     }
//   }, [store.sessionId, store.user?.telegramId]);

//   // -------------------- копирование ссылки --------------------
//   function tryExecCommandCopy(text: string): boolean {
//     try {
//       // Используем input element для копирования
//       const input = document.createElement("input");
//       input.value = text;
//       input.style.position = "fixed";
//       input.style.top = "-100px";
//       input.style.left = "-100px";
//       document.body.appendChild(input);
//       input.select();
//       input.setSelectionRange(0, 99999); // Для мобильных устройств

//       let success = false;
//       try {
//         success = document.execCommand("copy");
//       } catch (err) {
//         console.error("execCommand error:", err);
//       }

//       document.body.removeChild(input);
//       return success;
//     } catch (err) {
//       console.error("execCommand fallback error:", err);
//       return false;
//     }
//   }

//   async function tryClipboardCopy(text: string): Promise<boolean> {
//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(text);
//         return true;
//       }
//     } catch {
//       /* ignore */
//     }
//     return false;
//   }

//   function tryTextAreaCopy(text: string): boolean {
//     try {
//       const textArea = document.createElement("textarea");
//       textArea.value = text;
//       textArea.style.position = "fixed";
//       textArea.style.top = "0";
//       textArea.style.left = "0";
//       textArea.style.width = "2em";
//       textArea.style.height = "2em";
//       textArea.style.padding = "0";
//       textArea.style.border = "none";
//       textArea.style.outline = "none";
//       textArea.style.boxShadow = "none";
//       textArea.style.background = "transparent";
//       document.body.appendChild(textArea);
//       textArea.focus();
//       textArea.select();

//       let success = false;
//       try {
//         success = document.execCommand("copy");
//       } catch (err) {
//         console.error("TextArea copy error:", err);
//       }

//       document.body.removeChild(textArea);
//       return success;
//     } catch (err) {
//       console.error("TextArea creation error:", err);
//       return false;
//     }
//   }

//   function trySelectAndCopy(_text: string): boolean {
//     try {
//       // Пробуем выделить и скопировать через существующий input
//       if (inputRef.current) {
//         inputRef.current.focus();
//         inputRef.current.select();
//         inputRef.current.setSelectionRange(0, 99999);
//         return document.execCommand("copy");
//       }
//       return false;
//     } catch (err) {
//       console.error("Select and copy error:", err);
//       return false;
//     }
//   }

//   const handleCopy = async () => {
//     const link = store.referral.link;
//     if (!link) {
//       setCopyError("Ссылка не загружена");
//       setTimeout(() => setCopyError(null), 3000);
//       return;
//     }

//     setCopyError(null);

//     // Пробуем несколько методов копирования по порядку
//     let success = false;

//     // 1. Современный Clipboard API
//     success = await tryClipboardCopy(link);

//     // 2. Через выделение существующего input
//     if (!success) {
//       success = trySelectAndCopy(link);
//     }

//     // 3. Через execCommand с созданием input
//     if (!success) {
//       success = tryExecCommandCopy(link);
//     }

//     // 4. Через textarea (лучше работает на некоторых устройствах)
//     if (!success) {
//       success = tryTextAreaCopy(link);
//     }

//     if (success) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } else {
//       // Если не удалось скопировать, предлагаем пользователю скопировать вручную
//       setCopyError(
//         "Не удалось скопировать. Выделите текст и скопируйте вручную"
//       );
//       setTimeout(() => setCopyError(null), 4000);

//       // Фокусируем и выделяем текст для ручного копирования
//       if (inputRef.current) {
//         inputRef.current.focus();
//         inputRef.current.select();
//       }
//     }
//   };

//   const { link, earnedPcoin, earnedPdollar, totalReferrals } = store.referral;

//   return (
//     <>
//       <div className="relative min-h-screen w-full overflow-hidden">
//         {/* фон */}
//         <div className="absolute inset-0 bg-[#FFBC6B]">
//           <div
//             className="w-full h-full bg-cover bg-center bg-no-repeat"
//             style={{ backgroundImage: `url('${store.imgUrl}bg_pizza.png')` }}
//           />
//         </div>

//         {/* «тесто» шапка */}
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1550px]">
//           <img
//             src={`${store.imgUrl}testo.png`}
//             alt="Testo"
//             className="w-full h-auto"
//           />
//         </div>

//         {/* картинка друзей */}
//         <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
//           <img src={`${store.imgUrl}img_friends.png`} alt="friends" />
//         </div>

//         {/* окно */}
//         <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
//           <div className="relative">
//             <img
//               src={`${store.imgUrl}img_window2.png`}
//               alt="Modal background"
//               className="w-full h-auto scale-y-110 object-contain"
//             />

//             <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
//               {/* заголовок */}
//               <div className="text-center text-lg sm:text-2xl mb-2 text-amber-800 shantell font-bold">
//                 ВАША ССЫЛКА
//               </div>

//               {/* ссылка */}
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={link || "Загрузка..."}
//                 readOnly
//                 onFocus={(e) => e.currentTarget.select()}
//                 className="bg-white rounded-xl px-4 py-3 mb-4 border-2 border-amber-800 shadow-inner text-center font-bold text-base sm:text-lg text-amber-800 shantell truncate"
//               />

//               {/* кнопка копировать */}
//               <button
//                 className={`relative w-full flex justify-center mb-4 transition-all duration-200 ${
//                   copied ? "brightness-125" : "brightness-100"
//                 }`}
//                 onClick={handleCopy}
//                 disabled={!link}
//               >
//                 <img
//                   src={`${store.imgUrl}b_yellow.png`}
//                   alt="copy"
//                   className="w-1/2 h-auto"
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-amber-800 text-lg sm:text-xl shantell">
//                     Копировать
//                   </span>
//                 </div>
//               </button>

//               {/* описание */}
//               <div className="text-center mb-5 text-amber-800 font-bold text-base sm:text-lg shantell leading-tight">
//                 Получайте 7% от покупок PCoin
//                 <img
//                   src={`${store.imgUrl}icon_dollar_coin.png`}
//                   alt="coin"
//                   className="w-6 sm:w-8 inline-block mx-1"
//                 />
//                 ваших друзей и 3% от прибыли PDollar
//                 <img
//                   src={`${store.imgUrl}icon_dollar.png`}
//                   alt="dollar"
//                   className="w-8 sm:w-10 inline-block mx-1"
//                 />
//                 ваших друзей
//               </div>

//               {/* заголовок статистики */}
//               <div className="text-center font-bold text-lg sm:text-2xl mb-5 text-amber-800 shantell">
//                 ПАРТНЕРСКАЯ СТАТИСТИКА
//               </div>

//               {/* три блока статистики */}
//               <div className="flex justify-between gap-3">
//                 <StatBlock
//                   icon={`${store.imgUrl}icon_dollar.png`}
//                   value={`+${(earnedPdollar ?? 0).toLocaleString()}`}
//                 />
//                 <StatBlock
//                   icon={`${store.imgUrl}icon_dollar_coin.png`}
//                   value={`+${(earnedPcoin ?? 0).toLocaleString()}`}
//                 />
//                 <StatBlock
//                   icon={`${store.imgUrl}icon_friends.png`}
//                   value={`+${totalReferrals ?? 0}`}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//       <WebSocketComponent />
//     </>
//   );
// });

// function StatBlock({ icon, value }: { icon: string; value: string }) {
//   return (
// <div className="relative flex-1">
//   <img
//     src={`${store.imgUrl}b_white.png`}
//     alt="bg"
//     className="w-full h-auto"
//   />
//   <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-3 px-2 py-1">
//     <img src={icon} alt="icon" className="w-8 sm:w-10 inline-block" />
//     <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
//       {value}
//     </span>
//   </div>
// </div>
//   );
// }

// export default Friends;
