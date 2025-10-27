import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import "@telegram-apps/telegram-ui/dist/styles.css";
import "./mockEnv.ts";

const root = ReactDOM.createRoot(document.getElementById("root")!);

(async function bootstrap() {
  let platform = "web";
  let debug = import.meta.env.DEV;

  try {
    const lp = retrieveLaunchParams();
    platform = lp.tgWebAppPlatform || platform;
    debug = debug || (lp.tgWebAppStartParam || "").includes("platformer_debug");
  } catch (e) {
    console.warn("⚠️ retrieveLaunchParams failed (outside Telegram?)", e);
  }

  try {
    const { init } = await import("./init.ts");
    await init({
      debug,
      eruda: debug && ["ios", "android"].includes(platform),
      mockForMacOS: true,
    });
    console.log("✅ bridge init ok");
  } catch (e) {
    console.error("⚠️ init() failed, continue without Telegram:", e);
  } finally {
    // Всегда монтируем UI, чтобы не было черного экрана
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
})();
