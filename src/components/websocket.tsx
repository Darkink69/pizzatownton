// src/components/websocket.tsx
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import store from "../store/store";
import type {
  AuthData,
  FloorsGet,
  FloorsBuy,
  ClaimData,
  WsRequest,
  WsResponse,
  BankCreateOrderData,
  BankOrderViewData,
} from "../types/ws";
import { bankStore } from "../store/BankStore.ts";

function generateRequestId() {
  return Math.random().toString(36).substring(2, 10);
}

const WebSocketComponent = observer(() => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "error" | "connecting"
  >("disconnected");

  const WS_URL = useMemo(
    () =>
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.VITE_API_URL || "").replace(/^http/, "ws") + "/ws",
    []
  );

  const sendFloorsGetRequest = () => {
    if (!store.sessionId || !store.user?.id) {
      console.warn("Cannot send FLOORS_GET: missing sessionId or user id");
      return;
    }

    const rq: WsRequest = {
      type: "FLOORS_GET",
      requestId: generateRequestId(),
      session: store.sessionId,
      getFloorRq: {
        telegramId: store.user.telegramId,
      },
    };

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(rq));
      console.log("FLOORS_GET request sent:", rq);
    } else {
      console.warn("WS not open, cannot send FLOORS_GET");
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      if (store.sessionId) {
        // Если уже есть сессия, отправляем запрос на получение этажей
        sendFloorsGetRequest();
        return;
      }

      if (store.sessionId) return;
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
              store.setUser?.(user);
              store.setSessionId?.(sessionId);
            } else {
              store.setAuthError?.(parsed.message || "AUTH_INIT failed");
            }
            break;
          }

          case "FLOORS_GET": {
            if (parsed.success) {
              const d = (parsed.data || {}) as FloorsGet;
              store.setFloorsData?.(d);
              console.log("FLOORS_GET success:", d);
            } else {
              console.error("FLOORS_GET failed:", parsed.message);
            }
            break;
          }

          case "FLOORS_BUY": {
            if (parsed.success) {
              const d = (parsed.data || {}) as FloorsBuy;
              // store.setFloorsData?.(d);
              console.log("FLOORS_BUY success:", d);
            } else {
              console.error("FLOORS_BUY failed:", parsed.message);
            }
            break;
          }

          case "CLAIM_DO": {
            if (parsed.success) {
              const d = (parsed.data || {}) as ClaimData;
              if (d.userState) store.setUserState?.(d.userState);
              else if (d.userResponse) store.setUserState?.(d.userResponse);
            }
            break;
          }

          // Создание ордера на покупку PCoin
          case "BANK_BUY_PCOIN": {
            if (parsed.success && parsed.data) {
              const d = parsed.data as BankCreateOrderData;
              (store as any).setBankCreateOrder?.(d);
              bankStore.order = {
                orderId: d.orderId,
                amountTon: d.amountTon,
                rate: d.rate,
                expiresAt: d.expiresAt,
                merchantAddr: d.merchantAddr,
                tonComment: d.comment,
                status: "WAITING_PAYMENT",
              };
            } else {
              (store as any).bank.error =
                parsed.message || "BANK_BUY_PCOIN failed";
            }
            break;
          }

          // Получение/обновление статуса ордера (pull или push)
          case "BANK_CONFIRM":
          case "BANK_ORDER_GET":
          case "BANK_ORDER_VIEW":
          case "BANK_ORDER_STATUS_CHANGED": {
            if (parsed.success && parsed.data) {
              const orderViewData = parsed.data as BankOrderViewData;
              (store as any).setBankOrderView?.(orderViewData);
              (store as any).setConfirmedOrder?.(orderViewData);
              (store as any).bankOrderView = orderViewData;
              (store as any).confirmedOrder = orderViewData;
            } else {
              (store as any).setBankError?.(
                parsed.message || "BANK_ORDER_VIEW failed"
              );
            }
            break;
          }

          default:
            // прочие типы обработаем позже
            break;
        }
      } catch {
        // ignore parse errors (например, "ping")
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

  // Пробрасываем sender в store при наличии соответствующего метода
  useEffect(() => {
    const send = (rq: WsRequest) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(rq));
        return true;
      }
      console.warn("WS not open, cannot send:", rq?.type);
      return false;
    };
    (store as any).setWsSend?.(send);
    return () => {
      (store as any).setWsSend?.(undefined);
    };
  }, []);

  // return null;

  // DEBUG UI (оставляем как было, закомментировано)
  const getReadyStateText = () => {
    switch (status) {
      case "connecting":
        return "⏳ Connecting";
      case "connected":
        return "🟢 Open";
      case "error":
        return "🔴 Error";
      case "disconnected":
        return "🔴 Closed";
      default:
        return "-";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Debug</h1>

      <div className="mb-4">
        <p>
          Status:{" "}
          <span
            className={
              status === "connected"
                ? "text-green-600 font-semibold"
                : status === "error"
                ? "text-red-600 font-semibold"
                : "text-gray-600"
            }
          >
            {status}
          </span>
        </p>
        <p>
          ReadyState:{" "}
          <span className="text-gray-800">{getReadyStateText()}</span>
        </p>
        {/* <p className="text-gray-500 text-xs">
          Session: {store.sessionId || "-"}
        </p> */}
      </div>

      <div className="mb-4">
        <p className="font-semibold">Last Message:</p>
        <div className="mt-2 p-3 bg-gray-100 rounded border max-h-[200px] overflow-auto">
          {lastMessage ? (
            <code className="text-sm break-all">{lastMessage}</code>
          ) : (
            <span className="text-gray-500">No messages received yet</span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Auto reconnect after 10 sec</p>
        <p>
          WS URL: <code className="break-all">{WS_URL}</code>
        </p>
      </div>
    </div>
  );
});

export default WebSocketComponent;
