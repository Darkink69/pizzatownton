import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  retrieveLaunchParams,
  initDataRaw as _initDataRaw,
  isMiniAppDark,
  miniApp,
  useSignal,
} from "@telegram-apps/sdk-react";
import { AppRoot, Placeholder } from "@telegram-apps/telegram-ui";
import { observer } from "mobx-react-lite";

import { routes } from "../navigation/routes";
import store from "../store/store";
import Preloader from "./Preloader";

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
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const rawInitData = useSignal(_initDataRaw);
  const isDark = !!useSignal(isMiniAppDark);
  const startedRef = useRef(false);
  const startParam = useMemo(
    () => extractStartParam(rawInitData, lp.startParam),
    [rawInitData, lp.startParam]
  );
  const [debugInfo] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);

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

    store.authenticateUser(rawInitData, referrerId).catch((e: unknown) => {
      console.error("Auth error:", e);
      clearTimeout(loadingTimer);
    });

    return () => clearTimeout(loadingTimer);
  }, [rawInitData, lp.startParam, startParam]);

  if (showLoading) {
    // Можно убрать ! чтобы запускалось локально
    return <Preloader />;
  }

  if (store.authError) {
    return (
      <AppRoot>
        <Placeholder header="Ошибка" description={store.authError}>
          Пожалуйста, попробуйте перезапустить приложение.
        </Placeholder>
      </AppRoot>
    );
  }

  return (
    <AppRoot
      appearance={isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.tgWebAppPlatform) ? "ios" : "base"}
    >
      {debugInfo && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "lime",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 9999,
            fontSize: "12px",
            border: "1px solid lime",
          }}
        >
          <strong>DEBUG:</strong> {debugInfo}
        </div>
      )}

      {/* Маршруты. BrowserRouter оборачивает App в Root.tsx */}
      <Routes>
        {routes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppRoot>
  );
});
