import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import store from "../store/store";
import { toast } from "react-toastify";
import type {
  AuthData,
  WsRequest,
  WsResponse,
  BankCreateOrderData,
  BankOrderViewData,
} from "../types/ws";
import { bankStore } from "../store/BankStore.ts";
import {runInAction} from "mobx";

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

  /** Отправка запроса FLOORS_GET после подключения */
  const sendFloorsGetRequest = () => {
    if (!store.sessionId || !store.user?.telegramId) {
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

  /** Основной коннектор WebSocket */
  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();
    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const rq: WsRequest = {
        type: "AUTH_INIT",
        requestId: generateRequestId(),
        session: store.sessionId ?? "",
        authReq: {
          referralCode: store.referrerId,
          initData: store.initDataRaw,
        },
      };
      ws.send(JSON.stringify(rq));
      console.log("AUTH_INIT request sent");
    };

    ws.onmessage = (event) => {
      const raw = event.data;
      setLastMessage(raw);

      if (raw === "ping") {
        ws.send("pong");
        return;
      }

      try {
        const parsed: WsResponse<any> = JSON.parse(raw);
        console.debug("📩 WS response:", parsed);

        switch (parsed.type) {
            /** ------------------ AUTH_INIT ------------------ */
          case "AUTH_INIT": {
            if (parsed.success) {
              const { user, sessionId } = (parsed.data || {}) as AuthData;
              store.setUser?.(user);
              store.setSessionId?.(sessionId);
              sendFloorsGetRequest();

              // 👉 ДОБАВЬ ЭТО
              console.log("✅ Авторизация успешна, запускаем авто‑обновление клеймов");

              // чтобы сразу увидеть цифры, первый вызов без ожидания
              ws.send(JSON.stringify({
                type: "CLAIM_REFRESH",
                requestId: generateRequestId(),
                claimRefreshRq: { telegramId: store.user.telegramId },
                session: store.sessionId,
              }));

              // затем периодически обновляем каждые 30 сек
              setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: "CLAIM_REFRESH",
                    requestId: generateRequestId(),
                    claimRefreshRq: { telegramId: store.user.telegramId },
                    session: store.sessionId,
                  }));
                }
              }, 30000); // 30 секунд, можно 15000 для более частого обновления
            } else {
              store.setAuthError?.(parsed.message || "AUTH_INIT failed");
              toast.error(parsed.message || "Ошибка авторизации");
            }
            break;
          }

            /** ------------------ FLOORS_GET ------------------ */
          case "FLOORS_GET": {
            if (parsed.success) {
              store.setFloorsData(parsed);
              console.log("✅ Floors data loaded from backend");
            } else {
              console.error("❌ FLOORS_GET failed:", parsed.message);
            }
            break;
          }

            /** ------------------ FLOORS_BUY ------------------ */
          case "FLOORS_BUY": {
            if (parsed.success) {
              store.setFloorsData(parsed);
              toast.success("🏗 Этаж куплен!");
            } else {
              toast.error(parsed.message || "Ошибка покупки этажа");
            }
            break;
          }

            /** ------------------ FLOORS_UPGRADE ------------------ */
          case "FLOORS_UPGRADE": {
            if (parsed.success) {
              store.setFloorsData(parsed);
              toast.success("🔼 Этаж успешно улучшен!");
            } else {
              toast.error(parsed.message || "Ошибка апгрейда");
            }
            break;
          }



            /** ------------------ CLAIM_DO ------------------ */
          case "CLAIM_DO": {
            const user = parsed.data?.user || parsed.data?.userResponse;
            const earned = parsed.data?.earnedPDollar ?? parsed.data?.earned ?? 0;
            const floorId = parsed.data?.floorId ?? null;
            const currency = parsed.data?.currency ?? "pdollar";

            // 🔹 сохраняем последнее начисление в store, чтобы Home мог его отобразить
            if (floorId && earned >= 0) {
              runInAction(() => {
                (store as any).lastClaimRewards = { floorId, amount: earned, currency };
              });
            }

            if (parsed.success && user) {
              store.updateUserData?.(user);
              toast.success("💰 Доход успешно собран!");

              if (floorId && earned > 0) {
                store.addClaimAnimation(floorId, earned, currency);
              }
              if (parsed.data.userFloorList) {
                store.setFloorsData(parsed);
              }
            } else {
              toast.error(parsed.message || "Ошибка при сборе дохода");
            }
            break;
          }

            /** ------------------ CLAIM_REFRESH ------------------ */
          case "CLAIM_REFRESH": {
            if (parsed.success && parsed.data) {
              const total = Number(parsed.data.totalEarned ?? 0);

              // если есть список этажей — обновим store.userFloors.data.userFloorList
              if (Array.isArray(parsed.data.floors)) {
                const earnedMap = new Map<number, number>();
                parsed.data.floors.forEach((f: any) => {
                  earnedMap.set(f.floorId, Number(f.earnedPDollar ?? 0));
                });

                runInAction(() => {
                  store.userFloors.data.userFloorList =
                      store.safeUserFloorList.map(f => ({
                        ...f,
                        earned: earnedMap.get(f.floorId) ?? f.earned ?? 0
                      }));
                  store.userFloors.data.pdollarAmount = total;
                });
              }

              toast.info(`🔄 Накоплено: ${total.toFixed(2)} P$`);
            }
            break;
          }


            /** ---------------- BANK_BUY_PCOIN ---------------- */
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
              toast.success("💸 Ордер на покупку PCoin создан");
            } else {
              toast.error(parsed.message || "Ошибка при создании ордера");
            }
            break;
          }

            /** ---------------- BANK_CONFIRM / VIEW ---------------- */
          case "BANK_CONFIRM":
          case "BANK_ORDER_VIEW":
          case "BANK_ORDER_STATUS_CHANGED": {
            if (parsed.success && parsed.data) {
              const orderViewData = parsed.data as BankOrderViewData;
              (store as any).setBankOrderView?.(orderViewData);
              (store as any).setConfirmedOrder?.(orderViewData);
              toast.info(`💳 Статус ордера: ${orderViewData.status}`);
            } else {
              (store as any).setBankError?.(
                  parsed.message || "BANK_ORDER_VIEW failed"
              );
            }
            break;
          }

            /** ---------------- DEFAULT ---------------- */
          default:
            // другие типы можно обрабатывать позже
            break;
        }
      } catch (err) {
        // текстовые "ping/pong" и т.п. сюда не попадают
        console.warn("WS message parse skipped:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ WS error:", e);
     //store.resetSession();
      setStatus("error");
    };

    ws.onclose = () => {
      console.warn("⚠️ WS closed, reconnecting...");
      store.resetSession();
      setStatus("disconnected");
      reconnectTimeout.current = setTimeout(connectWebSocket, 10000);
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

  /** Пробрасываем sender в store */
  useEffect(() => {
    const send = (rq: WsRequest) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(rq));
        return true;
      }
      toast.error("❌ WebSocket не подключён, запрос не отправлен");
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