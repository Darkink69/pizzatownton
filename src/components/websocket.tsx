import {observer} from "mobx-react-lite";
import {useEffect, useMemo, useRef, useState} from "react";
import store from "../store/store";
import {toast} from "react-toastify";
import type {
    AuthData,
    BankCreateOrderData,
    BankOrderViewData,
    ReferralInfoData,
    WsRequest,
    WsResponse,
} from "../types/ws";
import {bankStore} from "../store/BankStore.ts";
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

                            // сначала только этажи
                            sendFloorsGetRequest();

                            ws.send(JSON.stringify({
                                type: "CLAIM_REFRESH",
                                requestId: generateRequestId(),
                                claimRefreshRq: { telegramId: store.user.telegramId },
                                session: store.sessionId,
                            }));


                            setInterval(() => {
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(JSON.stringify({
                                        type: "CLAIM_REFRESH",
                                        requestId: generateRequestId(),
                                        claimRefreshRq: { telegramId: store.user.telegramId },
                                        session: store.sessionId,
                                    }));
                                }
                            }, 30000);
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
                                parsed.type === "FLOORS_BUY" ? "🏗 Этаж куплен!" : "🔼 Этаж улучшен!"
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

                            // сохраняем реферальные данные в store
                            runInAction(() => {
                                store.referral = {
                                    totalReferrals: referralInfoData.totalReferrals ?? 0,
                                    earnedPcoin: referralInfoData.earnedPcoin ?? 0,
                                    earnedPdollar: referralInfoData.earnedPdollar ?? 0,
                                    link: referralInfoData.link ?? referralInfoData.referralLink ?? "",
                                };
                            });

                            console.log("👥 Referral info loaded:", referralInfoData);
                        } else {
                            toast.error(parsed.message || "Ошибка загрузки реферальных данных");
                        }
                        break;
                    }

                    // /** ------------------ STAFF ------------------ */
                    // case "STAFF_GET": {
                    //     console.log("📦 STAFF_GET payload:", parsed.data);
                    //     if (parsed.success && parsed.data && parsed.data.length) {
                    //         runInAction(() => {
                    //             const staffList = parsed.data as StaffMember[];
                    //             store.staffData = staffList;
                    //             localStorage.setItem("staffData", JSON.stringify(staffList));
                    //             staffList.forEach(staffDto => {
                    //                 const floor = store.safeUserFloorList.find(f => f.floorId === staffDto.floorId);
                    //                 if (!floor) return;
                    //                 if (!Array.isArray(floor.staff)) floor.staff = [];
                    //                 const existing = floor.staff.find(s => s.staffName === staffDto.staffName);
                    //                 if (existing) Object.assign(existing, staffDto);
                    //                 else floor.staff.push(staffDto);
                    //             });
                    //         });
                    //         console.log("🧍 Персонал объединён с этажами:", parsed.data);
                    //     } else {
                    //         console.warn("⚠️ STAFF_GET вернул пустой массив или ошибку");
                    //     }
                    //     break;
                    // }

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
                                    {autoClose: 7000}
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
                            toast.error(parsed.message || "Ошибка при создании заявки на вывод");
                        }
                        break;
                    }

                    /** ------------------ CLAIM_REFRESH ------------------ */
                    case "CLAIM_REFRESH": {
                        if (parsed.success && parsed.data) {
                            const percent = parsed.data.percent ?? "0";
                            const userResponse = parsed.data.userResponse;

                            // обновляем прогресс фарма
                            store.updateClaimProgress(percent);

                            // обновляем балансы пользователя
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
            // ❌  store.resetSession();  <-- убрать это
            setStatus("disconnected");

            // просто попробуем переподключиться без сброса данных
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