import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
  rawInitData: unknown,
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

export const App = observer(() => {
  const [loading, setLoading] = useState(true);
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const rawInitData = useSignal(_initDataRaw);

  const startedRef = useRef(false);
  const startParam = useMemo(
    () => extractStartParam(rawInitData, lp.startParam),
    [rawInitData, lp.startParam]
  );
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    miniApp.ready();

    if (startedRef.current || typeof rawInitData !== "string") return;
    startedRef.current = true;

    const referrerId =
      typeof startParam === "string" && startParam.startsWith("ref_")
        ? startParam.slice(4)
        : null;

    store.setReferralContext(startParam, referrerId);

    if (referrerId) {
      console.log(`РЕФЕРАЛ ОБНАРУЖЕН! ID родителя: ${referrerId}`);
    } else {
      console.log("Пользователь зашел без реферальной ссылки.", {
        startParam,
        lpStartParam: lp.startParam,
        rawInitData,
        initDataUnsafe: (window as any)?.Telegram?.WebApp?.initDataUnsafe,
      });
    }

    const loadingTimer = setTimeout(() => setShowLoading(true), 3000);

    store.authenticateUser(rawInitData, referrerId).catch((e: any) => {
      console.error("Auth error:", e);
      clearTimeout(loadingTimer);
    });

    return () => clearTimeout(loadingTimer);
  }, [rawInitData, lp.startParam, startParam]);

  if (loading) {
    return <Preloader />;
  }

  if (!showLoading) {
    return (
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/bank" element={<Bank />} />
          </Routes>
          <Footer />
          <WebSocketComponent />;
        </div>
      </Router>
    );
  }
});

export default App;
