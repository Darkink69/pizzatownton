// import { TonConnectUIProvider } from "@tonconnect/ui-react"; // можно оставить если нужен TON
import { BrowserRouter } from "react-router-dom";
import { App } from "../components/App.tsx";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";
// import { publicUrl } from "../helpers/publicUrl.ts"; // если не нужен TON

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      {/* Убрать TonConnectUIProvider или оставить с мок-конфигом */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
