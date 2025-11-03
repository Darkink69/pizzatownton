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
              // Сервер подтвердил покупку, можно обновить локальные данные
              console.log("FLOORS_BUY success:", d);
              // Если нужно, можно запросить обновленные данные этажей
              sendFloorsGetRequest();
            } else {
              console.error("FLOORS_BUY failed:", parsed.message);
              // TODO: Откатить локальные изменения при ошибке
            }
            break;
          }

          case "CLAIM_DO": {
            if (parsed.success) {
              const d = (parsed.data || {}) as ClaimData;
              if (d.userState) {
                store.setUserState?.(d.userState);
              } else if (d.userResponse) {
                // Обновляем данные пользователя из userResponse
                store.updateUserData?.(d.userResponse);
              }
              console.log("CLAIM_DO success:", d);
            } else {
              console.error("CLAIM_DO failed:", parsed.message);
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

  return null;
});

export default WebSocketComponent;