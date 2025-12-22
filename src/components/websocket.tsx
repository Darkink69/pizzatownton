import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";

import store from "../store/store";
import { toast } from "react-toastify";
import type {
  AuthData,
  BankCreateOrderData,
  BankOrderViewData,
  PizzaBoxOpenResp,
  ReferralInfoData,
  TaskCompleteResponse,
  TaskVerifyResponse,
  ManualWithdrawHistoryData,
  WsRequest,
  WsResponse,
} from "../types/ws";
import { bankStore } from "../store/BankStore.ts";
import { runInAction } from "mobx";

function generateRequestId() {
  return Math.random().toString(36).substring(2, 10);
}

const WebSocketComponent = observer(() => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claimRefreshIntervalRef = useRef<number | null>(null);

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
    const cur = wsRef.current;
    if (
      cur &&
      (cur.readyState === WebSocket.OPEN ||
        cur.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // на всякий случай сносим отложенный реконнект
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // закрываем прежний сокет (если был)
    if (wsRef.current) wsRef.current.close();
    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");

      // чистим отложенный реконнект (если вдруг был)
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      if (!store.initDataRaw) {
        console.warn("AUTH_INIT skipped: initDataRaw is empty");
        // можно попробовать переподключиться чуть позже
        ws.close();
        return;
      }

      const rq: WsRequest = {
        type: "AUTH_INIT",
        requestId: generateRequestId(),
        session: store.sessionId ?? "",
        authReq: {
          referralCode: store.referrerId,
          initData: store.initDataRaw,
          walletAddress: store.adrss,
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
              store.isAuthed = true;

              // загружаем этажи
              sendFloorsGetRequest();

              // мгновенный refresh
              ws.send(
                JSON.stringify({
                  type: "CLAIM_REFRESH",
                  requestId: generateRequestId(),
                  claimRefreshRq: { telegramId: store.user.telegramId },
                  session: store.sessionId,
                })
              );

              // предотвращаем мульти-интервалы
              if (claimRefreshIntervalRef.current) {
                clearInterval(claimRefreshIntervalRef.current);
                claimRefreshIntervalRef.current = null;
              }

              // периодический refresh
              claimRefreshIntervalRef.current = window.setInterval(() => {
                const w = wsRef.current;
                if (!w || w.readyState !== WebSocket.OPEN) return;
                if (!store.sessionId || !store.user?.telegramId) return;

                w.send(
                  JSON.stringify({
                    type: "CLAIM_REFRESH",
                    requestId: generateRequestId(),
                    claimRefreshRq: { telegramId: store.user.telegramId },
                    session: store.sessionId,
                  })
                );
              }, 300000);
            } else {
              store.setAuthError?.(parsed.message || "AUTH_INIT failed");
              toast.error(parsed.message || "Ошибка авторизации");
            }
            break;
          }

          case "ADMIN_ALL": {
            if (parsed.success && Array.isArray(parsed.data)) {
              store.setAdminData(parsed.data);
              console.log("✅ Админ данные загружены:", parsed.data);
            } else {
              console.error("❌ Ошибка загрузки админ данных:", parsed.message);
              toast.error(parsed.message || "Ошибка загрузки админ данных");
            }
            break;
          }

          case "BANK_LINK_WALLET": {
            if (parsed.success) {
              console.log("✅ Кошелёк успешно привязан к аккаунту");
              toast.success("Кошелёк успешно привязан");
            } else {
              console.error("❌ Ошибка привязки кошелька:", parsed.message);
              toast.error(parsed.message || "Ошибка привязки кошелька");
            }
            break;
          }

          /** ------------------ FLOORS_GET ------------------ */
          case "FLOORS_GET": {
            if (parsed.success) {
              store.setFloorsData(parsed);
              console.log("✅ Floors data loaded");
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
              store.updateClaimProgress(0);
              toast.info("⏱ Новый цикл фарма запущен после улучшения этажа!");
            } else {
              toast.error(parsed.message || "Ошибка покупки этажа");
            }
            break;
          }

          /** ------------------ FLOORS_UPGRADE ------------------ */
          case "FLOORS_UPGRADE": {
            if (parsed.success) {
              store.setFloorsData(parsed);
              toast.success(
                parsed.type === "FLOORS_BUY"
                  ? "🏗 Этаж куплен!"
                  : "🔼 Этаж улучшен!"
              );
              store.updateClaimProgress(0);
            } else {
              toast.error(parsed.message);
            }
            break;
          }

          /** ------------------ REFERRAL_GET ------------------ */
          case "REFERRAL_GET": {
            if (parsed.success && parsed.data) {
              const referralInfoData = parsed.data as ReferralInfoData;

              runInAction(() => {
                store.referral = {
                  totalReferrals: referralInfoData.totalReferrals ?? 0,
                  earnedPcoin: referralInfoData.earnedPcoin ?? 0,
                  earnedPdollar: referralInfoData.earnedPdollar ?? 0,
                  link:
                    referralInfoData.link ??
                    referralInfoData.referralLink ??
                    "",
                };
              });

              console.log("👥 Referral info loaded:", referralInfoData);
            } else {
              toast.error(
                parsed.message || "Ошибка загрузки реферальных данных"
              );
            }
            break;
          }

          /** ------------------ PIZZA_BOX_OPEN ------------------ */
          case "PIZZA_BOX_OPEN": {
            if (parsed.success && parsed.data) {
              const d = parsed.data as PizzaBoxOpenResp;

              if (d.user) {
                store.updateUserData({
                  pizza: d.user.pizza,
                  pcoin: d.user.pcoin,
                  pdollar: d.user.pdollar,
                });
              }

              store.setLastPizzaBoxResult({
                pizzaSpent: d.pizzaSpent,
                pcoinReward: d.pcoinReward,
              });
            } else {
              store.setLastPizzaBoxResult(null);
              if (parsed.message === "NOT_ENOUGH_PIZZA") {
                toast.error("Недостаточно Pizza (нужно 2000)");
              } else {
                toast.error(parsed.message || "Ошибка при открытии коробки");
              }
            }
            break;
          }

          case "PERSON_BUY": {
            if (parsed.success && parsed.data) {
              runInAction(() => {
                store.updateAfterStaffBuy(parsed.data);
                store.userStaff = parsed.data.userStaff;
              });
              toast.success("✅ Персонал нанят / обновлён!");
            } else {
              toast.error(parsed.message || "Ошибка найма персонала");
            }
            break;
          }

          /** ------------------ CLAIM_DO ------------------ */
          case "CLAIM_DO": {
            const userResponse = parsed.data?.userResponse;
            if (parsed.success && userResponse) {
              store.updateUserData({
                pcoin: userResponse.pcoin,
                pdollar: userResponse.pdollar,
                pizza: userResponse.pizza,
              });
              store.updateClaimProgress(0);
              toast.success("💰 Доход успешно собран!");

              const lostChance = Math.random();
              if (lostChance < 0.3) {
                toast.warning(
                  "Некоторые посетители не заплатили за счёт 😕\n" +
                    "Вы потеряли от 5% общего дохода.\n\n" +
                    "Чтобы избежать потерь, наймите Охранника 👮🏼‍♂️",
                  { autoClose: 7000 }
                );
              }
            } else {
              toast.error(parsed.message || "Ошибка при сборе дохода");
            }
            break;
          }

          case "BANK_MANUAL_WITHDRAW": {
            if (parsed.success) {
              toast.success("✅ Заявка на вывод PDollar сохранена");
              console.log("ManualWithdrawResponse:", parsed.data);
            } else {
              toast.error(
                parsed.message || "Ошибка при создании заявки на вывод"
              );
            }
            break;
          }

          /** ------------------ CLAIM_REFRESH ------------------ */
          case "CLAIM_REFRESH": {
            if (parsed.success && parsed.data) {
              const percent = parsed.data.percent ?? "0";
              const userResponse = parsed.data.userResponse;

              store.updateClaimProgress(percent);

              if (userResponse) {
                store.updateUserData({
                  pcoin: userResponse.pcoin,
                  pdollar: userResponse.pdollar,
                  pizza: userResponse.pizza,
                });
              }

              console.log(`🔥 Claim progress: ${percent}%`);
            } else {
              console.warn("CLAIM_REFRESH failed:", parsed.message);
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

          /** ---------------- BANK / HISTORY ---------------- */
          case "BANK_MANUAL_WITHDRAW_HISTORY": {
            console.log("📨 BANK_MANUAL_WITHDRAW_HISTORY response:", parsed);

            if (parsed.success && parsed.data) {
              // Проверяем структуру ответа
              const historyData = parsed.data as ManualWithdrawHistoryData;

              if (historyData && Array.isArray(historyData.items)) {
                // Устанавливаем историю выводов в store
                store.setManualWithdrawHistory(historyData.items);

                console.log("✅ История выводов загружена:", {
                  telegramId: historyData.telegramId,
                  itemsCount: historyData.items.length,
                  firstItem: historyData.items[0],
                });
              } else {
                console.error(
                  "❌ Неверная структура данных истории выводов:",
                  historyData
                );
                store.setManualWithdrawHistory([]);
              }
            } else {
              console.error(
                "❌ Ошибка загрузки истории выводов:",
                parsed.message
              );
              // Устанавливаем пустой массив при ошибке
              store.setManualWithdrawHistory([]);
              store.setManualWithdrawHistoryError();
            }
            break;
          }

          /** ---------------- TASKS_VERIFY ---------------- */
          case "TASKS_VERIFY": {
            const data = parsed.data as TaskVerifyResponse | undefined;

            if (!data?.code) {
              console.warn("TASKS_VERIFY без code", parsed);
              break;
            }

            if (data.code === "INVITE_3_FRIENDS") {
              if (parsed.success && data.status === "verified") {
                runInAction(() => {
                  store.taskInvite3Status = "verified";
                  store.taskInvite3Error = null;
                });
                toast.success(
                  "✅ Условие задания выполнено! Заберите награду."
                );

                if (store.sessionId && store.user?.telegramId) {
                  const rq: WsRequest = {
                    type: "TASKS_COMPLETE",
                    requestId: generateRequestId(),
                    session: store.sessionId,
                    taskRq: {
                      telegramId: store.user.telegramId,
                      code: "INVITE_3_FRIENDS",
                    },
                  };
                  ws.send(JSON.stringify(rq));
                } else {
                  toast.error(
                    "Не удалось завершить задачу: нет сессии или пользователя"
                  );
                }
              } else {
                runInAction(() => {
                  store.taskInvite3Status = "error";
                  store.taskInvite3Error =
                    data.message || parsed.message || null;
                });

                if (data.message === "NOT_ENOUGH_REFERRALS_WITH_FLOOR") {
                  toast.error(
                    "У вас ещё меньше 3 друзей, которые купили хотя бы 1 этаж."
                  );
                } else {
                  toast.error(
                    data.message || parsed.message || "Ошибка проверки задания"
                  );
                }
              }
            }

            break;
          }

          case "TASKS_GET": {
            if (parsed.success && Array.isArray(parsed.data)) {
              window.dispatchEvent(
                new CustomEvent("tasksLoaded", { detail: parsed.data })
              );
            }
            break;
          }

          /** ---------------- TASKS_COMPLETE ---------------- */
          case "TASKS_COMPLETE": {
            const data = parsed.data as TaskCompleteResponse | undefined;
            console.log("TASKS_COMPLETE raw:", parsed);

            if (!data) {
              toast.error(parsed.message || "Ошибка при получении награды");
              break;
            }

            const { code, rewardPcoin, rewardPizza, rewardPdollar, message } =
              data;

            // ---------------- INVITE_3_FRIENDS ----------------
            if (code === "INVITE_3_FRIENDS") {
              if (parsed.success) {
                runInAction(() => {
                  store.taskInvite3Status = "rewarded";
                  store.taskInvite3Error = null;

                  if (rewardPcoin != null) {
                    store.pcoin = (store.pcoin ?? 0) + Number(rewardPcoin);
                  }
                  if (rewardPizza != null) {
                    store.pizza = (store.pizza ?? 0) + Number(rewardPizza);
                  }
                  if (rewardPdollar != null) {
                    store.pdollar =
                      (store.pdollar ?? 0) + Number(rewardPdollar);
                  }
                });

                // Отправить событие для обновления UI
                const event = new CustomEvent("inviteTaskRewarded", {
                  detail: { code },
                });
                window.dispatchEvent(event);

                toast.success(
                  message || parsed.message || "🎉 Награда за друзей получена!"
                );
              } else {
                if (
                  parsed.message === "TASK_ALREADY_COMPLETED" ||
                  message === "ALREADY_COMPLETED"
                ) {
                  runInAction(() => {
                    store.taskInvite3Status = "rewarded";
                    store.taskInvite3Error = null;
                  });
                  toast.info(
                    "Награда за приглашение друзей уже была получена ранее."
                  );
                } else {
                  toast.error(
                    message || parsed.message || "Ошибка при получении награды"
                  );
                }
              }
              break;
            }

            // ---------------- ADS_TASK_1 (реклама) ----------------
            if (code === "ADS_TASK_1") {
              if (parsed.success) {
                runInAction(() => {
                  if (rewardPcoin != null) {
                    store.pcoin = (store.pcoin ?? 0) + Number(rewardPcoin);
                  }
                  if (rewardPizza != null) {
                    store.pizza = (store.pizza ?? 0) + Number(rewardPizza);
                  }
                  if (rewardPdollar != null) {
                    store.pdollar =
                      (store.pdollar ?? 0) + Number(rewardPdollar);
                  }
                });

                toast.success(
                  message || parsed.message || "🎉 Награда за рекламу получена!"
                );

                const now = Date.now();
                localStorage.setItem("adsTaskLastDoneAt", String(now));
              } else {
                if (
                  parsed.message === "COOLDOWN_NOT_PASSED" ||
                  message === "COOLDOWN_NOT_PASSED"
                ) {
                  toast.info(
                    "Рекламное задание уже было выполнено недавно. Попробуйте позже."
                  );
                } else {
                  toast.error(
                    message ||
                      parsed.message ||
                      "Ошибка при выполнении рекламного задания"
                  );
                }
              }
              break;
            }

            // ---------------- Остальные таски ----------------
            if (!parsed.success) {
              toast.error(
                message || parsed.message || "Ошибка при получении награды"
              );
              break;
            }

            // Успешный общий случай
            toast.success(message || parsed.message || "🎉 Награда получена!");

            // SUBSCRIBE_MAIN_CHANNEL
            if (code === "SUBSCRIBE_MAIN_CHANNEL") {
              runInAction(() => {
                if (rewardPcoin != null) {
                  store.pcoin = (store.pcoin ?? 0) + Number(rewardPcoin);
                } else {
                  store.pcoin = (store.pcoin ?? 0) + 40;
                }

                if (rewardPizza != null) {
                  store.pizza = (store.pizza ?? 0) + Number(rewardPizza);
                } else {
                  store.pizza = (store.pizza ?? 0) + 200;
                }
              });
              break;
            }

            // SUBSCRIBE_TEAM_LOVE_CHANNEL (MELEGATEAM) — 1000 pizza + 30 pcoin
            if (code === "SUBSCRIBE_TEAM_LOVE_CHANNEL") {
              runInAction(() => {
                if (rewardPcoin != null) {
                  store.pcoin = (store.pcoin ?? 0) + Number(rewardPcoin);
                } else {
                  store.pcoin = (store.pcoin ?? 0) + 30; // fallback
                }

                if (rewardPizza != null) {
                  store.pizza = (store.pizza ?? 0) + Number(rewardPizza);
                } else {
                  store.pizza = (store.pizza ?? 0) + 1000; // fallback
                }
              });
              // дубль тоста убрали — общий уже показан выше
              break;
            }

            // прочие успешные таски без спец‑логики
            break;
          }

          // ---------------- DAILY COMBO ----------------
          case "COMBO_TODAY": {
            console.log("📨 COMBO_TODAY response received:", parsed);
            if (parsed.success) {
              const comboData = parsed.data;
              console.log("🎯 Combo game data loaded:", comboData);

              // Отправляем событие для обновления UI в Tasks.tsx
              const event = new CustomEvent("comboTodayLoaded", {
                detail: comboData,
              });
              window.dispatchEvent(event);
            } else {
              toast.error(parsed.message || "Ошибка загрузки данных игры");
            }
            break;
          }

          case "COMBO_PICK": {
            console.log("📨 COMBO_PICK response received:", parsed);
            if (parsed.success) {
              const pickData = parsed.data;
              console.log("🎯 Combo pick result:", pickData);

              // Обновляем балансы если есть выигрыш
              if (pickData.isWin && pickData.winAmount) {
                runInAction(() => {
                  store.pizza = (store.pizza ?? 0) + Number(pickData.winAmount);
                });

                // Отправляем уведомление о выигрыше
                const winEvent = new CustomEvent("comboWinNotification", {
                  detail: { amount: pickData.winAmount },
                });
                window.dispatchEvent(winEvent);
              }

              // Отправляем событие для обновления UI
              const event = new CustomEvent("comboPickResult", {
                detail: pickData,
              });
              window.dispatchEvent(event);
            } else {
              toast.error(parsed.message || "Ошибка при выборе пиццы");
            }
            break;
          }
          /** ---------------- DEFAULT ---------------- */
          default:
            // другие типы можно обрабатывать позже
            break;
        }
      } catch (err) {
        console.warn("WS message parse skipped:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ WS error:", e);
      setStatus("error");
    };

    ws.onclose = (ev) => {
      console.warn("⚠️ WS closed", {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean,
      });
      setStatus("disconnected");

      // чистим refresh‑интервал
      if (claimRefreshIntervalRef.current) {
        clearInterval(claimRefreshIntervalRef.current);
        claimRefreshIntervalRef.current = null;
      }

      // запускаем реконнект
      reconnectTimeout.current = setTimeout(connectWebSocket, 10000);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (claimRefreshIntervalRef.current) {
        clearInterval(claimRefreshIntervalRef.current);
        claimRefreshIntervalRef.current = null;
      }
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
      return false;
    };

    store.setWsSend(send);
    return () => store.setWsSend(undefined);
  }, []);

  return null;
});

export default WebSocketComponent;
