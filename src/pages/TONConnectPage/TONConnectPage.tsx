import { useEffect, useState, useRef, type FC } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTranslation } from "react-i18next";
import {
  TonConnectButton,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";
import { Placeholder, Text } from "@telegram-apps/telegram-ui";
import { observer } from "mobx-react-lite";

import "./TONConnectPage.css";
import store from "../../store/store";
import { Page } from "../../components/Page";
import { bem } from "../../css/bem";
import Footer from "../../components/Footer";


const [, e] = bem("ton-connect-page");

function nanosToTonStr(nano: string | number, fractionDigits = 2): string {
  const n = typeof nano === "number" ? nano : Number(nano);
  if (!isFinite(n)) return "0.00";
  return (n / 1e9).toFixed(fractionDigits);
}

export const TONConnectPage: FC = observer(() => {
  const { t } = useTranslation();
  const wallet = useTonWallet();
  const adrss = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  // -------------------- улучшенное копирование адреса --------------------
  async function tryClipboardCopy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error("Clipboard API error:", err);
      return false;
    }
    return false;
  }

  function tryExecCommandCopy(text: string): boolean {
    try {
      const input = document.createElement("input");
      input.value = text;
      input.style.position = "fixed";
      input.style.top = "-100px";
      input.style.left = "-100px";
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999);

      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("execCommand error:", err);
      }

      document.body.removeChild(input);
      return success;
    } catch (err) {
      console.error("execCommand fallback error:", err);
      return false;
    }
  }

  function tryTextAreaCopy(text: string): boolean {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("TextArea copy error:", err);
      }

      document.body.removeChild(textArea);
      return success;
    } catch (err) {
      console.error("TextArea creation error:", err);
      return false;
    }
  }

  function trySelectAndCopy(text: string): boolean {
    try {
      // Создаем временный div для выделения текста
      const tempDiv = document.createElement("div");
      tempDiv.textContent = text;
      tempDiv.style.position = "fixed";
      tempDiv.style.top = "-100px";
      tempDiv.style.left = "-100px";
      document.body.appendChild(tempDiv);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      selection?.removeAllRanges();
      selection?.addRange(range);

      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("Select and copy error:", err);
      }

      selection?.removeAllRanges();
      document.body.removeChild(tempDiv);
      return success;
    } catch (err) {
      console.error("Select and copy error:", err);
      return false;
    }
  }

  const handleCopyAddress = async () => {
    if (!adrss) {
      setCopyError(t("ton_connect.address_not_available"));
      setTimeout(() => setCopyError(null), 3000);
      return;
    }

    setCopyError(null);

    // Пробуем несколько методов копирования по порядку
    let success = false;

    // 1. Современный Clipboard API
    success = await tryClipboardCopy(adrss);

    // 2. Через execCommand с созданием input
    if (!success) {
      success = tryExecCommandCopy(adrss);
    }

    // 3. Через textarea
    if (!success) {
      success = tryTextAreaCopy(adrss);
    }

    // 4. Через выделение и копирование
    if (!success) {
      success = trySelectAndCopy(adrss);
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(t("ton_connect.copy_failed"));
      setTimeout(() => setCopyError(null), 4000);

      // Предлагаем ручное копирование
      if (addressRef.current) {
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  // Обработчик клика по адресу для легкого копирования
  const handleAddressClick = () => {
    if (!adrss) return;

    // Предлагаем скопировать при клике на адрес
    handleCopyAddress();
  };

  // ---------------- Логика получения баланса ----------------
  const getTonBalance = async (address: string, signal?: AbortSignal) => {
    try {
      const base =
        (
          import.meta.env.VITE_TONCENTER_API_URL as string | undefined
        )?.trim() || "https://toncenter.com/api/v2";

      const url = new URL(`${base.replace(/\/+$/, "")}/getAddressBalance`);
      url.searchParams.set("address", address);

      const apiKey = (
        import.meta.env.VITE_TONCENTER_API_KEY as string | undefined
      )?.trim();
      if (apiKey) url.searchParams.set("api_key", apiKey);

      console.log("🔍 Запрашиваем баланс TON:", url.toString());

      const res = await fetch(url.toString(), { signal });
      const data = await res.json();

      console.log("📦 Ответ toncenter:", data);

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const nanos = data?.result;
      if (!nanos) throw new Error("No balance in response");

      const ton = nanosToTonStr(nanos, 2);
      console.log(`💰 Баланс получен: ${nanos} нанотон = ${ton} TON`);
      store.setTonBalance(parseFloat(ton).toFixed(2));
    } catch (error) {
      console.error("❌ Ошибка получения TON баланса", error);
    }
  };

  // ---------------- useEffect при подключении кошелька ----------------
  useEffect(() => {
    if (!adrss) return;
    store.setAdrss(adrss);

    console.log("✅ Кошелёк подключен:", {
      address: adrss,
      app: wallet?.device?.appName,
      platform: wallet?.device?.platform,
      chain: wallet?.account?.chain,
    });

    // Отправляем запрос на привязку кошелька на сервер
    store.linkWallet(adrss);

    const ac = new AbortController();
    void getTonBalance(adrss, ac.signal);

    return () => ac.abort();
  }, [adrss, wallet]);

  // ---------------- UI ----------------
  if (!wallet) {
    return (
      <Page>
        <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B] overflow-hidden text-amber-800 z-45">
          <Placeholder
            className={e("placeholder")}
            header={t("ton_connect.title")}
            description={
              <Text>
                <div className="text-amber-800 mb-2 ">
                  {t("ton_connect.connect_wallet_to_see_balance")}
                </div>
                <div className="flex justify-center text-center">
                  <TonConnectButton className={e("button")} />
                </div>
              </Text>
            }
          />
        </div>

        <Footer />

      </Page>
    );
  }

  return (
    <Page>
      <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B] overflow-hidden">
        <div className="mt-10 mb-10 flex justify-center items-center text-3xl text-amber-800 shantell">
          <img
            src={`${store.imgUrl}icon_ton.png`}
            alt={t("ton_connect.alt.pizza_logo")}
            className="w-10 mr-4"
          />
          {store.tonBalance} TON
        </div>

        {/* Кастомизированный блок подключенного кошелька */}
        <div className="px-4">
          <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-amber-800 shadow-lg">
            {/* Информация о кошельке */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/pizza_logo.png"
                alt={t("ton_connect.alt.wallet_logo")}
                className="w-40"
              />
              <div className="flex-1"></div>
            </div>

            {/* Уведомления о копировании */}
            {copyError && (
              <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                {copyError}
              </div>
            )}

            {copied && (
              <div className="mb-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">
                {t("ton_connect.copied_to_clipboard")}
              </div>
            )}

            {/* Адрес кошелька */}
            <div
              className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={handleAddressClick}
              title={t("ton_connect.click_to_copy")}
            >
              <div className="text-xs text-amber-600 shantell mb-1">
                {t("ton_connect.wallet_address")}
              </div>
              <div
                ref={addressRef}
                className="text-sm text-amber-800 shantell font-mono break-all select-all"
                style={{
                  userSelect: "all",
                  WebkitUserSelect: "all",
                  MozUserSelect: "all",
                  // msUserSelect: 'all'
                }}
              >
                {adrss
                  ? `${adrss.slice(0, 8)}...${adrss.slice(-8)}`
                  : t("ton_connect.not_connected")}
              </div>
              <div className="text-xs text-amber-500 mt-1 text-center">
                {t("ton_connect.click_to_copy_short")}
              </div>
              <div className="text-xs text-amber-500 mt-1 text-center">
                Нажмите для копирования
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col gap-2">
              {/* Кнопка "Скопировать адрес" */}
              <button
                onClick={handleCopyAddress}
                className={`w-full relative py-3 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  copied ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!adrss}
              >
                <span
                  className={`text-white font-bold shantell text-lg relative z-10 ${
                    copied ? "animate-pulse" : ""
                  }`}
                >
                  {copied
                    ? t("ton_connect.copied")
                    : t("ton_connect.copy_address")}
                </span>
              </button>

              {/* Кнопка "Выйти" */}
              <button
                onClick={() => tonConnectUI.disconnect()}
                className="w-full relative py-3 rounded-lg flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold shantell text-lg transition-all duration-200 active:scale-95"
              >
                {t("ton_connect.disconnect")}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}img_blue_pizza.png`}
            alt={t("ton_connect.alt.pizza_logo")}
            className="w-max max-w-md"
          />
        </div>
      </div>
      <Footer />

    </Page>
  );
});
