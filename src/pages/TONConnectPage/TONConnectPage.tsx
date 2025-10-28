import { useEffect, type FC } from "react";
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
import { bem } from "../../css/bem";
// import { DisplayData } from "../../components/DisplayData/DisplayData";
// import store from "../../store/store";
import { Page } from "../../components/Page";
const [, e] = bem("ton-connect-page");

function nanosToTonStr(nano: string | number, fractionDigits = 2): string {
  const n = typeof nano === "number" ? nano : Number(nano);
  if (!isFinite(n)) return "0.00";
  return (n / 1e9).toFixed(fractionDigits);
}

export const TONConnectPage: FC = observer(() => {
  const wallet = useTonWallet();
  const adrss = useTonAddress();
  console.log(adrss, "adrss!!!");
  console.log(wallet, "wallet!!!");

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
      // store.setTonBalance(parseFloat(ton).toFixed(2));
    } catch (error) {
      console.error("❌ Ошибка получения TON баланса", error);
    }
  };

  // ---------------- useEffect при подключении кошелька ----------------
  useEffect(() => {
    console.log("Пробуем подключить кошелек...");
    if (!adrss) return;
    // store.setAdrss(adrss);

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
        <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B]  overflow-hidden">
          <Placeholder
            className={e("placeholder")}
            header="TON Connect"
            description={
              <Text>
                <div className="text-white mb-2">
                  Подключите ваш TON-кошелёк, чтобы увидеть баланс.
                </div>
                <TonConnectButton className={e("button")} />
              </Text>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="relative h-screen w-full flex flex-col bg-[#FFBC6B] overflow-hidden">
        <div className="text-black text-3xl">КОШЕЛЕК!</div>
        {/* Обновление баланса вручную */}
      </div>
    </Page>
  );
});
