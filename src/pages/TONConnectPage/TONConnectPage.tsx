import { useEffect, type FC } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import {
  TonConnectButton,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";
import {
  // Avatar,
  // Cell,
  // List,
  Placeholder,
  // Section,
  Text,
  // Title,
} from "@telegram-apps/telegram-ui";
import { observer } from "mobx-react-lite";

import "./TONConnectPage.css";
import store from "../../store/store";
import { Page } from "../../components/Page";
import { bem } from "../../css/bem";
// import { DisplayData } from "../../components/DisplayData/DisplayData";
import Footer from "../../components/Footer";
import WebSocketComponent from "../../components/websocket";

const [, e] = bem("ton-connect-page");

function nanosToTonStr(nano: string | number, fractionDigits = 2): string {
  const n = typeof nano === "number" ? nano : Number(nano);
  if (!isFinite(n)) return "0.00";
  return (n / 1e9).toFixed(fractionDigits);
}

export const TONConnectPage: FC = observer(() => {
  const wallet = useTonWallet();
  const adrss = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

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

    const ac = new AbortController();
    void getTonBalance(adrss, ac.signal);

    return () => ac.abort();
  }, [adrss]);

  // ---------------- UI ----------------
  if (!wallet) {
    return (
      <Page>
        <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B] overflow-hidden text-amber-800">
          <Placeholder
            className={e("placeholder")}
            header="TON Connect"
            description={
              <Text>
                <div className="text-amber-800 mb-2 ">
                  Подключите ваш TON-кошелёк, чтобы увидеть баланс.
                </div>
                <div className="flex justify-center text-center">
                  <TonConnectButton className={e("button")} />
                </div>
              </Text>
            }
          />
        </div>

        <Footer />
        <WebSocketComponent />
      </Page>
    );
  }

  return (
    <Page>
      <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B] overflow-hidden">
        <div className="mt-10 mb-10 flex justify-center items-center text-3xl text-amber-800 shantell">
          <img
            src={`${store.imgUrl}icon_ton.png`}
            alt="Pizza Logo"
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
                src="https://wallet.ton.org/assets/ui/tonconnect-logo.png"
                alt="Wallet logo"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="text-lg font-bold text-amber-800 shantell">
                  {wallet.device?.appName ?? "Подключенный кошелёк"}
                </div>
                <div className="text-sm text-amber-600 shantell">
                  {wallet.device?.platform ?? "TON Wallet"}
                </div>
              </div>
            </div>

            {/* Адрес кошелька */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-xs text-amber-600 shantell mb-1">
                Адрес кошелька:
              </div>
              <div className="text-sm text-amber-800 shantell font-mono break-all">
                {adrss
                  ? `${adrss.slice(0, 8)}...${adrss.slice(-8)}`
                  : "Не подключен"}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col gap-2">
              {/* Кнопка "Скопировать адрес" */}
              <button
                onClick={() => {
                  if (adrss) {
                    navigator.clipboard.writeText(adrss);
                    // Можно добавить уведомление о успешном копировании
                    // alert("Адрес скопирован в буфер обмена!");
                  }
                }}
                className="w-full relative py-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <img
                  src={`${store.imgUrl}b_blue_small.png`}
                  alt="Button background"
                  className="absolute inset-0 w-full h-full"
                />
                <span className="text-blue-900 font-bold shantell text-lg relative z-10">
                  Скопировать адрес
                </span>
              </button>

              {/* Кнопка "Выйти" */}
              <button
                onClick={() => tonConnectUI.disconnect()}
                className="w-full relative py-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <img
                  src={`${store.imgUrl}b_red_round.png`}
                  alt="Button background"
                  className="absolute inset-0 w-full h-full"
                />
                <span className="text-white font-bold shantell text-lg relative z-10">
                  Выйти
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}img_blue_pizza.png`}
            alt="Pizza Logo"
            className="w-max max-w-md"
          />
        </div>
      </div>
      <Footer />
      <WebSocketComponent />
    </Page>
  );
});
