import { StrictMode } from "react";
import "./index.css";
import App from "./App.tsx";

import ReactDOM from "react-dom/client";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

// Mock the environment in case, we are outside Telegram.
import "./mockEnv.ts";
import { init } from "./init.ts";

const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug =
    (launchParams.tgWebAppStartParam || "").includes("platformer_debug") ||
    import.meta.env.DEV;

  // Configure all application dependencies.
  await init({
    debug,
    eruda: debug && ["ios", "android"].includes(platform),
    mockForMacOS: platform === "macos",
  }).then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
} catch (e) {}
