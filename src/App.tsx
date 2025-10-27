import { TONConnectPage } from "./pages/TONConnectPage/TONConnectPage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  retrieveLaunchParams,
  initDataRaw as _initDataRaw,
  miniApp,
  useSignal,
} from "@telegram-apps/sdk-react";
import { observer } from "mobx-react-lite";

import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Bank from "./pages/Bank";
import Friends from "./pages/Friends";
import Preloader from "./components/Preloader";
import store from "./store/store";
import WebSocketComponent from "./components/websocket";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

function getStartParamFromUrlLike(): string | null {
  try {
    const url = new URL(window.location.href);
    const s1 =
      url.searchParams.get("tgWebAppStartParam") ||
      url.searchParams.get("startapp") ||
      url.searchParams.get("start");
    if (s1) return s1;

    if (url.hash?.includes("?")) {
      const hashQuery = url.hash.substring(url.hash.indexOf("?") + 1);
      const hsp = new URLSearchParams(hashQuery);
      const s2 =
        hsp.get("tgWebAppStartParam") ||
        hsp.get("startapp") ||
        hsp.get("start");
      if (s2) return s2;
    }
  } catch {}
  return null;
}

function extractStartParam(
  rawInitData?: string,
  lpStartParam?: unknown
): string | null {
  const raw = typeof rawInitData === "string" ? rawInitData : null;
  const lp = typeof lpStartParam === "string" ? lpStartParam : null;

  if (raw) {
    try {
      const sp = new URLSearchParams(raw);
      const p = sp.get("start_param");
      if (p) return p;
    } catch {}
  }

  const tg = (window as any)?.Telegram?.WebApp;
  const p2 = tg?.initDataUnsafe?.start_param;
  if (typeof p2 === "string") return p2;

  const p3 = getStartParamFromUrlLike();
  if (p3) return p3;

  return lp ?? null;
}

const App: React.FC = observer(() => {
  const [booting, setBooting] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const startedRef = useRef(false);

  const manifestUrl = `${store.imgUrl}tonconnect-manifest.json`;

  // Безопасно читаем launch params
  const lp: any = useMemo(() => {
    try {
      return retrieveLaunchParams();
    } catch {
      return {};
    }
  }, []);

  const rawInitData = useSignal(_initDataRaw) as unknown as string | undefined;

  const startParam = useMemo(
    () => extractStartParam(rawInitData, lp?.startParam),
    [rawInitData, lp?.startParam]
  );

  useEffect(() => {
    try {
      miniApp?.ready?.();
    } catch {}
  }, []);

  // Короткий "boot" оверлей
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Авторизация / контекст
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const referrerId =
      typeof startParam === "string" && startParam.startsWith("ref_")
        ? startParam.slice(4)
        : null;

    store.setReferralContext(startParam ?? null, referrerId);

    store
      .authenticateUser(
        typeof rawInitData === "string" ? rawInitData : "",
        referrerId
      )
      .catch((e: any) => console.error("Auth error:", e));

    // Если долго нет sessionId — показать "loading"
    const loadingTimer = setTimeout(() => setShowLoading(true), 3000);
    return () => clearTimeout(loadingTimer);
  }, [rawInitData, startParam]);

  const showOverlay = booting || (showLoading && !store.sessionId);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Router>
        {showOverlay && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <Preloader />
          </div>
        )}

        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/bank" element={<Bank />} />
            <Route path="/ton-connect" element={<TONConnectPage />} />
          </Routes>

          <Footer />
          <WebSocketComponent />
        </div>
      </Router>
    </TonConnectUIProvider>
  );
});

export default App;
