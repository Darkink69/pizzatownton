// src/components/websocket.tsx
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import store from "../store/store";
import type { AuthData, ClaimData, WsRequest, WsResponse } from "../types/ws";

function generateRequestId() {
  return Math.random().toString(36).substring(2, 10);
}

const WebSocketComponent = observer(() => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [_lastMessage, setLastMessage] = useState<string>("");
  const [_status, setStatus] = useState<
    "connected" | "disconnected" | "error" | "connecting"
  >("disconnected");

  const WS_URL = useMemo(
    () =>
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.VITE_API_URL || "").replace(/^http/, "ws") + "/ws",
    []
  );

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");

      const rq: WsRequest = {
        type: "AUTH_INIT",
        requestId: generateRequestId(),
        session: "",
        authReq: {
          referralCode: store.referrerId,
          initData: store.initDataRaw,
        },
      };

      ws.send(JSON.stringify(rq));
    };

    ws.onmessage = (event) => {
      setLastMessage(event.data);
      try {
        const parsed: WsResponse<any> = JSON.parse(event.data);

        switch (parsed.type) {
          case "AUTH_INIT": {
            if (parsed.success) {
              const { user, sessionId } = (parsed.data || {}) as AuthData;
              store.setUser(user); // теперь принимает undefined
              store.setSessionId(sessionId); // безопасно
            } else {
              store.setAuthError(parsed.message || "AUTH_INIT failed");
            }
            break;
          }

          case "CLAIM_DO": {
            if (parsed.success) {
              const d = (parsed.data || {}) as ClaimData;
              if (d.userState) store.setUserState(d.userState);
              else if (d.userResponse) store.setUserState(d.userResponse);
            }
            break;
          }

          default:
            // прочие типы обработаем позже
            break;
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    ws.onerror = () => setStatus("error");

    ws.onclose = () => {
      setStatus("disconnected");
      reconnectTimeout.current = setTimeout(() => {
        connectWebSocket();
      }, 10000);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const getReadyStateText = () => {
  //   switch (status) {
  //     case "connecting":
  //       return "⏳ Connecting";
  //     case "connected":
  //       return "🟢 Open";
  //     case "error":
  //       return "🔴 Error";
  //     case "disconnected":
  //       return "🔴 Closed";
  //     default:
  //       return "-";
  //   }
  // };

  return null;

  // return (
  //     <div className="p-4">
  //       <h1 className="text-xl font-bold mb-4">WebSocket Debug</h1>

  //       <div className="mb-4">
  //         <p>
  //           Status:{" "}
  //           <span
  //               className={
  //                 status === "connected"
  //                     ? "text-green-600 font-semibold"
  //                     : status === "error"
  //                         ? "text-red-600 font-semibold"
  //                         : "text-gray-600"
  //               }
  //           >
  //           {status}
  //         </span>
  //         </p>
  //         <p>
  //           ReadyState: <span className="text-gray-800">{getReadyStateText()}</span>
  //         </p>
  //         <p className="text-gray-500 text-xs">Session: {store.sessionId || "-"}</p>
  //       </div>

  //       <div className="mb-4">
  //         <p className="font-semibold">Last Message:</p>
  //         <div className="mt-2 p-3 bg-gray-100 rounded border max-h-[200px] overflow-auto">
  //           {lastMessage ? (
  //               <code className="text-sm break-all">{lastMessage}</code>
  //           ) : (
  //               <span className="text-gray-500">No messages received yet</span>
  //           )}
  //         </div>
  //       </div>

  //       <div className="text-sm text-gray-500">
  //         <p>Auto reconnect after 10 sec</p>
  //         <p>
  //           WS URL: <code className="break-all">{WS_URL}</code>
  //         </p>
  //       </div>
  //     </div>
  // );
});

export default WebSocketComponent;
