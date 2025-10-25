// src/mockEnv.ts
// Фоллбек-мок без зависимостей от @telegram-apps/bridge.
// Заполняем query-параметры и window.Telegram.WebApp, если запущены вне Telegram.

function ensureQueryParams() {
  const isOutsideTelegram =
      typeof window !== "undefined" && !(window as any)?.Telegram?.WebApp;

  if (!isOutsideTelegram) return;

  const url = new URL(window.location.href);
  const sp = url.searchParams;

  const userObj = {
    id: 5766504683,
    first_name: "Dev",
    username: "devuser",
    language_code: "ru",
    is_premium: true,
  };

  const defaults: Record<string, string> = {
    tgWebAppPlatform: "web",
    tgWebAppStartParam: "ref_debug",
    chat_type: "sender",
    user: JSON.stringify(userObj),
    auth_date: String(Math.floor(Date.now() / 1000)),
  };

  let changed = false;
  for (const [k, v] of Object.entries(defaults)) {
    if (!sp.get(k)) {
      sp.set(k, v);
      changed = true;
    }
  }
  if (changed) {
    const newUrl = `${url.pathname}?${sp.toString()}${url.hash}`;
    window.history.replaceState({}, "", newUrl);
  }
}

function ensureTelegramObject() {
  const isOutsideTelegram =
      typeof window !== "undefined" && !(window as any)?.Telegram?.WebApp;

  if (!isOutsideTelegram) return;

  const url = new URL(window.location.href);
  const sp = url.searchParams;

  const userStr = sp.get("user") || "{}";
  let user: any = {};
  try {
    user = JSON.parse(userStr);
  } catch {}

  const initDataUnsafe = {
    user,
    start_param: sp.get("tgWebAppStartParam") || "ref_debug",
    chat_type: sp.get("chat_type") || "sender",
    auth_date: Number(sp.get("auth_date")) || Math.floor(Date.now() / 1000),
  };

  const initDataRaw =
      `user=${encodeURIComponent(JSON.stringify(user))}` +
      `&chat_type=${initDataUnsafe.chat_type}` +
      `&auth_date=${initDataUnsafe.auth_date}` +
      `&hash=dev`;

  (window as any).Telegram = (window as any).Telegram || {};
  (window as any).Telegram.WebApp = {
    initData: initDataRaw,
    initDataUnsafe,
    platform: sp.get("tgWebAppPlatform") || "web",
    ready: () => {},
  };
  console.log("🧪 Telegram mock enabled (URL + window.Telegram.WebApp)");
}

ensureQueryParams();
ensureTelegramObject();