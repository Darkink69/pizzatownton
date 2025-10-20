import { useRef } from "react";
import store from "../store/store";

function Friends() {
  const inputRef = useRef<HTMLInputElement>(null);

  const reffLink = "Https://Pizza_towerton/?";

  function tryExecCommandCopy(text: string): boolean {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
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
    } catch {}
    return false;
  }

  const handleCopy = async () => {
    if (!reffLink) return;

    // 1) Синхронный фолбэк (лучше для Telegram WebView)
    let ok = tryExecCommandCopy(reffLink);

    // 2) Если не сработало — пробуем Clipboard API
    if (!ok) {
      ok = await tryClipboardCopy(reffLink);
    }
  };
  
  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFBC6B]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat sm:bg-auto sm:bg-center md:bg-auto md:bg-center lg:bg-contain lg:bg-center"
            style={{
              backgroundImage: `url('${store.imgUrl}bg_pizza.png')`,
            }}
          />
        </div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}img_friends.png`}
            alt="friends"
          />
        </div>


        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
          <div className="relative">
            {/* Фон модального окна */}
            <img 
              src={`${store.imgUrl}img_window2.png`} 
              alt="Modal background" 
              className="w-full h-auto object-contain"
            />
            
            <div className="absolute inset-0 flex flex-col p-6 sm:p-8 md:p-10">
              <div className="text-center text-lg sm:text-2xl mb-1 sm:mb-2 text-amber-800 shantell leading-tight tracking-wide">
                ВАША ССЫЛКА
              </div>

              <input
                ref={inputRef}
                type="text"
                value={reffLink}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className="bg-white rounded-xl px-4 py-1 mb-4 sm:mb-6 border-2 border-amber-800 shadow-inner text-center font-bold text-base sm:text-lg text-amber-800 shantell"
              />

              {/* Кнопка Копировать */}
              <button className="relative w-full flex justify-center mb-1 sm:mb-2 hover:opacity-90 transition-opacity"
                onClick={handleCopy}
                disabled={!reffLink}
              >
                <img 
                  src={`${store.imgUrl}b_yellow.png`} 
                  alt="Копировать" 
                  className="w-1/2 h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-800 text-lg sm:text-xl shantell">
                    Копировать
                  </span>
                </div>
              </button>

              {/* Текст с иконками */}
              <div className="text-center mb-4 sm:mb-5 text-amber-800 font-bold text-base sm:text-lg shantell leading-tight">
                Получайте 7% 
                <img 
                  src={`${store.imgUrl}icon_dollar_coin.png`} 
                  alt="dollar" 
                  className="w-6 h-auto sm:w-8 inline-block mr-1 ml-1"
                  
                />
                и 3% 
                <img 
                  src={`${store.imgUrl}icon_dollar.png`} 
                  alt="dollar" 
                  className="w-8 h-auto sm:w-10 inline-block mr-1 ml-1"
                />
                с каждого депозита вашего партнера
              </div>

              {/* Заголовок ПАРТНЕРСКАЯ СТАТИСТИКА */}
              <div className="text-center font-bold text-lg sm:text-2xl mb-4 sm:mb-6 text-amber-800 shantell leading-tight tracking-wide">
                ПАРТНЕРСКАЯ СТАТИСТИКА
              </div>

              {/* Статистика */}
      {/* Статистика */}
      <div className="flex justify-between gap-2 sm:gap-3">
        {/* Первый блок статистики */}
        <div className="relative flex-1">
          <img 
            src={`${store.imgUrl}b_white.png`} 
            alt="Background" 
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2">
            <img 
                  src={`${store.imgUrl}icon_dollar.png`} 
                  alt="dollar" 
                  className="w-8 h-auto sm:w-10 inline-block mr-1 ml-1"
              />
            <span className="font-bold text-base sm:text-lg text-amber-800 shantell">+0</span>
          </div>
        </div>

        {/* Второй блок статистики */}
        <div className="relative flex-1">
          <img 
            src={`${store.imgUrl}b_white.png`} 
            alt="Background" 
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2">
            <img 
              src={`${store.imgUrl}icon_dollar_coin.png`} 
              alt="dollar" 
              className="w-6 h-auto sm:w-8 inline-block mr-1 ml-1"
              
            />
            <span className="font-bold text-base sm:text-lg text-amber-800 shantell">+0</span>
          </div>
        </div>

        {/* Третий блок статистики */}
        <div className="relative flex-1">
          <img 
            src={`${store.imgUrl}b_white.png`} 
            alt="Background" 
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2">
            <img 
                  src={`${store.imgUrl}icon_friends.png`} 
                  alt="dollar" 
                  className="w-6 h-auto sm:w-8 inline-block"
              />
            <span className="font-bold text-base sm:text-lg text-amber-800 shantell">+0</span>
          </div>
        </div>
            </div>
            </div>
          </div>
        </div>

       
      </div>
    </>
  );
}

export default Friends;
