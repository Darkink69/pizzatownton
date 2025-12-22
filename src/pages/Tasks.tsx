import {useEffect, useState} from "react";
import store from "../store/store";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import Footer from "../components/Footer";

import styles from "../css/task.module.css";
import {useTranslation} from "react-i18next";
import type {ComboGameData, TaskWithProgress} from "../types/ws";

/* eslint-disable @typescript-eslint/no-namespace */
// declare global {
//     namespace JSX {
//         interface IntrinsicElements {
//             "adsgram-task": React.DetailedHTMLProps<
//                 React.HTMLAttributes<HTMLElement>,
//                 HTMLElement
//             > & {
//                 "data-block-id": string;
//                 ref?: React.RefObject<HTMLElement>;
//             };
//         }
//     }
// }
/* eslint-enable @typescript-eslint/no-namespace */
const ADSGRAM_ENABLED = false;

const TASK_CODE_BY_ID: Record<number, string> = {
    1: "SUBSCRIBE_MAIN_CHANNEL",
    2: "INVITE_3_FRIENDS",
    3: "SUBSCRIBE_TEAM_LOVE_CHANNEL",
};

const PIZZA_LIST = [
    "NewYork",
    "California",
    "Neapolitan",
    "Sicilian",
    "Margarita",
    "4 cheeses",
    "Mozzarella",
    "Bacon",
    "Vegetarian",
    "Shrimp",
    "Pepperoni",
    "Chili",
    "Hawaii",
    "Mushroom",
    "BBQ",
    "Chiken",
] as const;

type PizzaName = (typeof PIZZA_LIST)[number];

function Tasks() {
    const {t} = useTranslation();
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [showDailyCombo, setShowDailyCombo] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribedToTeamLove, setIsSubscribedToTeamLove] = useState(false);
    const [serverTaskCodes, setServerTaskCodes] = useState<Set<string>>(
        new Set()
    );
    // const [isInviteTaskDone, setIsInviteTaskDone] = useState(false);
    // const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
    const [isAdsgramLoaded, setIsAdsgramLoaded] = useState(false);
    const [showAdsgramBlock, setShowAdsgramBlock] = useState(true);
    const [adsTaskEl, setAdsTaskEl] = useState<HTMLElement | null>(null);
    const [taskRewardNotification, setTaskRewardNotification] = useState<{
        show: boolean;
        message: string;
    }>({show: false, message: ""});

    // Состояния для игры Daily Combo
    const [dailyComboRound, setDailyComboRound] = useState<{
        isActive: boolean;
        isLoading: boolean;
        selectedPizzas: string[];
        guessedPizzas: {
            pizza: string;
            index: number;
            visible: boolean;
            isHit?: boolean;
        }[];
        attempts: number;
        gameWon: number;
        wrongAttemptAnimation: boolean;
        wonPositions: number[];
        showWinLabels: boolean[];
        picksUsed: number;
        hits: number;
        selectedIndices: number[];
        isAvailable: boolean;
        isWin: boolean;
        winAmount: number | null;
    }>({
        isActive: false,
        isLoading: false,
        selectedPizzas: [],
        guessedPizzas: Array.from({length: 4}, (_, i) => ({
            pizza: "",
            index: i,
            visible: false,
            isHit: false,
        })),
        attempts: 0,
        gameWon: 0,
        wrongAttemptAnimation: false,
        wonPositions: [],
        showWinLabels: Array(4).fill(false),
        picksUsed: 0,
        hits: 0,
        selectedIndices: [],
        isAvailable: true,
        isWin: false,
        winAmount: null,
    });

    useEffect(() => {
        if (!store.sessionId || !store.user?.telegramId) return;

        store.send({
            type: "TASKS_GET",
            requestId: Math.random().toString(36).substring(2, 10),
            session: store.sessionId,
            taskRq: { telegramId: store.user.telegramId, code: "" },
        });
    }, [store.sessionId, store.user?.telegramId]);

    useEffect(() => {
        if (!ADSGRAM_ENABLED) return;

        const checkAdsgram = () => {
            if (customElements.get("adsgram-task")) setIsAdsgramLoaded(true);
            else setIsAdsgramLoaded(false);
        };

        checkAdsgram();
        const checkInterval = setInterval(checkAdsgram, 5000);
        return () => clearInterval(checkInterval);
    }, []);

    // Функция для показа уведомления о награде
    const showRewardNotification = (rewardMessage: string) => {
        setTaskRewardNotification({
            show: true,
            message: rewardMessage,
        });

        // Автоматически скрываем через 8 секунд
        setTimeout(() => {
            setTaskRewardNotification({show: false, message: ""});
        }, 8000);
    };

    const getTaskCode = (id: number) => TASK_CODE_BY_ID[id] ?? "";

    // // Функция для показа уведомления о награде
    // const showRewardNotification = (rewardMessage: string) => {
    //   setTaskRewardNotification({
    //     show: true,
    //     message: rewardMessage,
    //   });

    //   // Автоматически скрываем через 8 секунд
    //   setTimeout(() => {
    //     setTaskRewardNotification({ show: false, message: "" });
    //   }, 8000);
    // };

    // // Обработчик закрытия уведомления
    // const closeRewardNotification = () => {
    //   setTaskRewardNotification({ show: false, message: "" });
    // };

    const isHiddenByLocalRules = (code: string) => {
        switch (code) {
            case "SUBSCRIBE_MAIN_CHANNEL":
                return isSubscribed;
            case "SUBSCRIBE_TEAM_LOVE_CHANNEL":
                return isSubscribedToTeamLove;
            case "INVITE_3_FRIENDS":
                return store.taskInvite3Status === "rewarded";
            default:
                return false;
        }
    };

    // Обработчик закрытия уведомления
    const closeRewardNotification = () => {
        setTaskRewardNotification({show: false, message: ""});
    };

    useEffect(() => {
        const onTasksLoaded = (e: Event) => {
            const ce = e as CustomEvent<TaskWithProgress[]>;
            const codes = new Set(
                (ce.detail ?? [])
                    .map((t) => t?.code)
                    .filter((c): c is string => typeof c === "string" && c.length > 0)
            );

            setServerTaskCodes(codes);
            setTasksLoaded(true);
        };

        window.addEventListener("tasksLoaded", onTasksLoaded);
        return () => window.removeEventListener("tasksLoaded", onTasksLoaded);
    }, []);

    useEffect(() => {
        setIsSubscribed(localStorage.getItem("subscribedTaskDone") === "true");
        setIsSubscribedToTeamLove(
            localStorage.getItem("subscribedTeamLoveTaskDone") === "true"
        );
    }, []);

    // Эффект для adsgram-task
    useEffect(() => {
        if (!ADSGRAM_ENABLED) return;

        if (!adsTaskEl) {
            console.log("🔧 adsgram-task element is not ready yet");
            return;
        }

        console.log("🔧 Setting up adsgram-task listener, element:", adsTaskEl);

        const rewardHandler = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log("📢 Adsgram-task reward event received!", customEvent);
            console.log("Event detail:", customEvent.detail);

            if (!store.sessionId || !store.user?.telegramId) {
                toast.error("Авторизуйтесь, чтобы получить награду за рекламу");
                return;
            }

            const rq = {
                type: "TASKS_COMPLETE" as const,
                requestId: Math.random().toString(36).substring(2, 10),
                session: store.sessionId,
                taskRq: {
                    telegramId: store.user.telegramId,
                    code: "ADS_TASK_1",
                },
            };

            console.log("🚀 Sending ADS_TASK_1 request:", rq);

            const ok = store.send(rq);
            if (!ok) {
                toast.error("WebSocket не подключён");
                return;
            }

            // Для adsgram не показываем уведомление с поваром
            toast.success("🎉 Рекламное задание выполнено! Начисляем награду...");
        };

        const stateHandler = (e: Event) => {
            console.log("Adsgram-task statechange:", e);
            const el = e.target as HTMLElement;
            console.log("Current state:", el.getAttribute("state"));
        };

        const bannerNotFoundHandler = (e: Event) => {
            console.log("❌ Adsgram-task banner not found event:", e);
            // Полностью скрываем блок с рекламным заданием
            setShowAdsgramBlock(false);
            toast.info("Рекламное задание временно недоступно");
        };

        adsTaskEl.addEventListener("reward", rewardHandler);
        adsTaskEl.addEventListener("statechange", stateHandler);
        adsTaskEl.addEventListener("onBannerNotFound", bannerNotFoundHandler);

        // Проверяем состояние
        setTimeout(() => {
            console.log(
                "Adsgram-task initial state:",
                adsTaskEl.getAttribute?.("state")
            );
            console.log("Adsgram-task attributes:", adsTaskEl.attributes);
        }, 1000);

        return () => {
            adsTaskEl.removeEventListener("reward", rewardHandler);
            adsTaskEl.removeEventListener("statechange", stateHandler);
            adsTaskEl.removeEventListener("onBannerNotFound", bannerNotFoundHandler);
        };
    }, [adsTaskEl, store.sessionId, store.user?.telegramId]);

    // Проверяем загрузку adsgram-task
    // useEffect(() => {
    //   const checkAdsgram = () => {
    //     if (customElements.get("adsgram-task")) {
    //       console.log("✅ Adsgram-task custom element loaded");
    //       setIsAdsgramLoaded(true);
    //     } else {
    //       setIsAdsgramLoaded(false);
    //       console.log("❌ Adsgram-task custom element not found");
    //     }
    //   };

    //   checkAdsgram();

    //   // Проверяем периодически
    //   const checkInterval = setInterval(checkAdsgram, 5000);

    //   return () => clearInterval(checkInterval);
    // }, []);

    // следим за статусом INVITE_3_FRIENDS из стора:
    useEffect(() => {
        if (store.taskInvite3Status === "rewarded") {
            localStorage.setItem("invite3TaskDone", "true");

            // Показываем уведомление о награде
            showRewardNotification("2000 pizza");
        }
    }, [store.taskInvite3Status]);

    useEffect(() => {
        if (
            store.referral.totalReferrals >= 3 &&
            store.taskInvite3Status === "idle"
        ) {
            toast.info(
                "У вас уже 3+ приглашённых. Если они открыли этаж, вы сможете забрать награду."
            );
        }
    }, [store.referral.totalReferrals, store.taskInvite3Status]);

    // выполнение таски подписки на канал Pizza TowerTON
    const handleSubscribe = () => {
        if (isSubscribed) return;

        const tgId = store.user?.telegramId ?? 0;
        toast.info("🔔 Проверяем подписку...");

        const timer = setTimeout(() => {
            const rq = {
                type: "TASKS_COMPLETE" as const,
                requestId: Math.random().toString(36).substring(2, 10),
                session: store.sessionId ?? "",
                taskRq: {
                    telegramId: tgId,
                    code: "SUBSCRIBE_MAIN_CHANNEL",
                },
            };

            if (store.send(rq)) {
                toast.dismiss();
                toast.success("✅ Подписка подтверждена! Получаем награду...");
                setIsSubscribed(true);
                localStorage.setItem("subscribedTaskDone", "true");

                // Показываем уведомление о награде
                showRewardNotification("1000 pizza");
            } else {
                toast.error("WebSocket не подключён");
            }
        }, 8000);
        return () => clearTimeout(timer);
    };

    const handleSubscribeToTeamLove = () => {
        if (isSubscribedToTeamLove) return;

        const tgId = store.user?.telegramId ?? 0;
        toast.info("🔔 Проверяем подписку на TEAM LOVE...");

        const timer = setTimeout(() => {
            const rq = {
                type: "TASKS_COMPLETE" as const,
                requestId: Math.random().toString(36).substring(2, 10),
                session: store.sessionId ?? "",
                taskRq: {
                    telegramId: tgId,
                    code: "SUBSCRIBE_TEAM_LOVE_CHANNEL",
                },
            };

            if (store.send(rq)) {
                toast.dismiss();
                toast.success("✅ Подписка на TEAM LOVE подтверждена!");
                setIsSubscribedToTeamLove(true);
                localStorage.setItem("subscribedTeamLoveTaskDone", "true");

                // Показываем уведомление о награде
                showRewardNotification("1000 pizza + 30 pcoin");
            } else {
                toast.error("WebSocket не подключён");
            }
        }, 8000);
        return () => clearTimeout(timer);
    };

    // выполнение таски INVITE_3_FRIENDS (инициируем проверку)
    const handleInvite3Task = () => {
        if (store.taskInvite3Status === "rewarded") {
            toast.info("✅ Награда уже получена!");
            return;
        }

        if (!store.sessionId || !store.user?.telegramId) {
            toast.error("Авторизуйтесь, чтобы выполнить задание");
            return;
        }

        const totalReferrals = Number(store.referral?.totalReferrals ?? 0);

        if (totalReferrals === 0) {
            toast.info("Сначала пригласите друзей, чтобы выполнить задание.");
            return;
        }

        // есть хотя бы один друг — сервер сам проверит, есть ли 3 с этажами
        toast.info("🔍 Проверяем, есть ли 3 друга, которые купили этаж...");
        store.verifyInvite3Task();
    };

    const taskBlocks = [
        {
            id: 1,
            title: "Подписаться на официальный канал",
            rewardPizza: "1000",
            link: "https://t.me/pizzatowerton",
            buttonText: "ПЕРЕЙТИ",
            buttonBg: "b_red_small.png",
            onClick: handleSubscribe,
            disabled: false,
        },
        {
            id: 2,
            title: "Пригласи 3 друзей, которые купят 1 этаж",
            rewardPizza: "2000",
            buttonText:
                store.taskInvite3Status === "rewarded"
                    ? "ВЫПОЛНЕНО"
                    : store.referral.totalReferrals >= 3
                        ? "ПРОВЕРИТЬ УСЛОВИЕ"
                        : "ПРИГЛАСИТЬ ДРУЗЕЙ",
            buttonBg:
                store.taskInvite3Status === "rewarded"
                    ? "b_blue_small.png"
                    : "b_red_small.png",
            onClick:
                store.taskInvite3Status === "rewarded" ? undefined : handleInvite3Task,
            disabled: store.taskInvite3Status === "rewarded",
            isCompleted: store.taskInvite3Status === "rewarded",
        },
        {
            id: 3,
            title: "Подписаться на канал MELEGATEAM",
            rewardPizza: "1000",
            rewardPcoin: "30",
            link: "https://t.me/+GlIl1TY4Lsg4MzMx",
            buttonText: isSubscribedToTeamLove ? "ВЫПОЛНЕНО" : "ПЕРЕЙТИ",
            buttonBg: isSubscribedToTeamLove ? "b_blue_small.png" : "b_red_small.png",
            onClick: !isSubscribedToTeamLove ? handleSubscribeToTeamLove : undefined,
            disabled: isSubscribedToTeamLove,
            isCompleted: isSubscribedToTeamLove,
        },
    ];

    const visibleTaskBlocks = taskBlocks.filter((block) => {
        if (!tasksLoaded) return false;

        const code = getTaskCode(block.id);
        if (!code) {
            console.warn("No task code for block id:", block.id);
            return false;
        }
        return (
            code !== "" && serverTaskCodes.has(code) && !isHiddenByLocalRules(code)
        );
    });

    // Если все задания выполнены, показываем сообщение
    const allTasksCompleted = visibleTaskBlocks.length === 0;

    // Функции для игры Daily Combo
    const startDailyComboGame = async () => {
        if (!store.sessionId || !store.user?.telegramId) {
            toast.error("Авторизуйтесь, чтобы играть в Daily Combo");
            return;
        }

        // Если игра уже активна и попытки закончились, просто скрываем
        if (dailyComboRound.isActive && dailyComboRound.attempts >= 4) {
            setShowDailyCombo(false);
            setDailyComboRound((prev) => ({
                ...prev,
                isActive: false,
            }));
            return;
        }

        // Если игра скрыта - показываем и загружаем данные
        if (!showDailyCombo) {
            setShowDailyCombo(true);
            await loadDailyComboData();
        } else {
            // Если игра показана - скрываем
            setShowDailyCombo(false);
        }
    };

    const loadDailyComboData = async () => {
        if (!store.sessionId || !store.user?.telegramId) {
            return;
        }

        setDailyComboRound((prev) => ({
            ...prev,
            isLoading: true,
        }));

        const rq = {
            type: "COMBO_TODAY" as const,
            requestId: Math.random().toString(36).substring(2, 10),
            session: store.sessionId,
            comboRq: {
                telegramId: store.user.telegramId,
            },
        };

        console.log("🚀 Sending COMBO_TODAY request:", rq);

        const ok = store.send(rq);
        if (!ok) {
            toast.error("WebSocket не подключён");
            setDailyComboRound((prev) => ({
                ...prev,
                isLoading: false,
            }));
        }
    };

    const handlePizzaClick = async (pizzaName: PizzaName) => {
        const indexInList = PIZZA_LIST.indexOf(pizzaName);
        const serverIndex = indexInList + 1; // Сервер ожидает индексы с 1

        if (
            !dailyComboRound.isActive ||
            dailyComboRound.attempts >= 4 ||
            !dailyComboRound.isAvailable ||
            !store.sessionId ||
            !store.user?.telegramId
        ) {
            return;
        }

        // Проверяем, не нажимали ли уже на эту пиццу

        if (dailyComboRound.selectedIndices.includes(serverIndex)) {
            toast.info("Вы уже выбирали эту пиццу");
            return;
        }

        // Показываем загрузку
        setDailyComboRound((prev) => ({
            ...prev,
            isLoading: true,
        }));

        const rq = {
            type: "COMBO_PICK" as const,
            requestId: Math.random().toString(36).substring(2, 10),
            session: store.sessionId,
            pickComboRq: {
                telegramId: store.user.telegramId,
                index: serverIndex, // Индекс с 1
            },
        };

        console.log("🚀 Sending COMBO_PICK request:", rq);

        const ok = store.send(rq);
        if (!ok) {
            toast.error("WebSocket не подключён");
            setDailyComboRound((prev) => ({
                ...prev,
                isLoading: false,
            }));
        }
    };

    const playSound = (soundName: string) => {
        try {
            const audio = new Audio(`${store.imgUrl}${soundName}`);
            audio.volume = 0.3;
            audio.play().catch((e) => console.log("Sound play prevented:", e));
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    // Добавить useEffect для обработки событий WebSocket
    useEffect(() => {
        const handleComboTodayLoaded = (event: Event) => {
            const customEvent = event as CustomEvent<ComboGameData>;
            const comboData = customEvent.detail;

            const selectedFromServer = (comboData.selected ?? []).filter(
                (x): x is number => typeof x === "number"
            );

            setDailyComboRound((prev) => ({
                ...prev,
                isActive: true,
                isLoading: false,
                attempts: comboData.picksUsed ?? 0,
                picksUsed: comboData.picksUsed ?? 0,
                hits: comboData.hits ?? 0,
                selectedIndices: selectedFromServer,
                isAvailable: comboData.isAvailable !== false,
                guessedPizzas: Array.from({length: 4}, (_, i) => ({
                    pizza: "",
                    index: i,
                    visible: false,
                    isHit: false,
                })),
                showWinLabels: Array(4).fill(false),
                wrongAttemptAnimation: false,
                isWin: false,
                winAmount: null,
            }));
        };

        const handleComboPickResult = (event: Event) => {
            const customEvent = event as CustomEvent<ComboGameData>;
            const pickData = customEvent.detail;

            const newSelectedIndices = (pickData.selected ?? []).filter(
                (x: unknown): x is number => typeof x === "number"
            );

            const wasHit = !!pickData.isWin;

            setDailyComboRound((prev) => {
                const prevSelected = prev.selectedIndices ?? [];
                const newIndex = newSelectedIndices.find(
                    (idx) => !prevSelected.includes(idx)
                );

                const newAttempts = pickData.picksUsed ?? prev.attempts + 1;
                const newHits = pickData.hits ?? prev.hits;

                // если сервер не добавил новый индекс (дубликат) — просто обновим блокировки/состояние
                if (typeof newIndex !== "number") {
                    return {
                        ...prev,
                        attempts: newAttempts,
                        picksUsed: pickData.picksUsed ?? prev.picksUsed,
                        hits: newHits,
                        selectedIndices: newSelectedIndices,
                        isLoading: false,
                        isAvailable: pickData.isAvailable !== false,
                        wrongAttemptAnimation: false,
                        isWin: false,
                    };
                }

                const emptySlotIndex = prev.guessedPizzas.findIndex((p) => !p.visible);
                if (emptySlotIndex === -1) {
                    return {
                        ...prev,
                        attempts: newAttempts,
                        picksUsed: pickData.picksUsed ?? prev.picksUsed,
                        hits: newHits,
                        selectedIndices: newSelectedIndices,
                        isLoading: false,
                        isAvailable: pickData.isAvailable !== false,
                        wrongAttemptAnimation: false,
                        isWin: wasHit,
                    };
                }

                const pizzaName = PIZZA_LIST[newIndex - 1];
                if (!pizzaName) return prev;
                const updatedGuessedPizzas = [...prev.guessedPizzas];
                updatedGuessedPizzas[emptySlotIndex] = {
                    ...updatedGuessedPizzas[emptySlotIndex],
                    pizza: pizzaName,
                    visible: true,
                    isHit: wasHit,
                };

                const updatedShowWinLabels = [...prev.showWinLabels];
                updatedShowWinLabels[emptySlotIndex] = true;

                // звук/тосты вне setState (чтобы не дёргать лишний раз)
                setTimeout(() => {
                    playSound(wasHit ? "win.mp3" : "lost.mp3");
                    if (wasHit)
                        toast.success(`✅ Угадана пицца: ${pizzaName}! +250 pizza`);
                    else
                        toast.error(
                            `❌ Пицца "${pizzaName}" не входит в сегодняшний список`
                        );
                }, 0);

                return {
                    ...prev,
                    guessedPizzas: updatedGuessedPizzas,
                    showWinLabels: updatedShowWinLabels,
                    attempts: newAttempts,
                    picksUsed: pickData.picksUsed ?? prev.picksUsed + 1,
                    hits: newHits,
                    selectedIndices: newSelectedIndices,
                    wrongAttemptAnimation: !wasHit,
                    isLoading: false,
                    isAvailable: pickData.isAvailable !== false,
                    isWin: wasHit,
                    winAmount: pickData.winAmount ?? prev.winAmount,
                };
            });
        };

        const handleComboWinNotification = (event: Event) => {
            const customEvent = event as CustomEvent;
            const winData = customEvent.detail;
            if (winData.amount) showRewardNotification(`${winData.amount} pizza`);
        };

        window.addEventListener("comboTodayLoaded", handleComboTodayLoaded);
        window.addEventListener("comboPickResult", handleComboPickResult);
        window.addEventListener("comboWinNotification", handleComboWinNotification);

        return () => {
            window.removeEventListener("comboTodayLoaded", handleComboTodayLoaded);
            window.removeEventListener("comboPickResult", handleComboPickResult);
            window.removeEventListener(
                "comboWinNotification",
                handleComboWinNotification
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Проверяем статус из store при монтировании
        if (store.taskInvite3Status === "rewarded") {
            localStorage.setItem("invite3TaskDone", "true");
        }
    }, []);

    useEffect(() => {
        const handleInviteRewarded = () => {
            localStorage.setItem("invite3TaskDone", "true");

            showRewardNotification("2000 pizza");
        };

        window.addEventListener("inviteTaskRewarded", handleInviteRewarded);
        return () =>
            window.removeEventListener("inviteTaskRewarded", handleInviteRewarded);
    }, []);

    // Рендерим adsgram-task только если он загружен и не скрыт
    const shouldRenderAdsgram =
        ADSGRAM_ENABLED && isAdsgramLoaded && showAdsgramBlock;

    return (
        <>
            <div className="relative min-h-screen w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#FFBC6B]">
                    <div
                        className="w-full h-full bg-cover bg-center bg-no-repeat sm:bg-auto sm:bg-center md:bg-auto md:bg-center lg:bg-contain lg:bg-center"
                        style={{
                            backgroundImage: `url('${store.imgUrl}bg_pizza.png')`,
                        }}
                    />
                </div>

                <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
                    <img
                        src={`${store.imgUrl}testo.png`}
                        alt={t("tasks.alts.testo")}
                        className="w-full max-w-full h-auto object-cover"
                    />
                </div>

                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <img
                        src={`${store.imgUrl}img_task_list.png`}
                        alt={t("tasks.alts.tasks")}
                    />
                </div>

                {/* Уведомление о награде */}
                {taskRewardNotification.show && (
                    <div
                        className="fixed inset-0 z-[99] bg-black/50 flex items-end justify-center transition-opacity duration-300">
                        <div
                            className="relative mb-4 sm:mb-16 flex items-end gap-2 sm:gap-4 max-w-5xl mx-auto px-4 w-full">
                            <div className="flex-shrink-0">
                                <img
                                    src={`${store.imgUrl}img_chif_talk.png`}
                                    alt={t("tasks.alts.chef")}
                                    className="w-36 sm:w-48 object-contain"
                                />
                            </div>

                            {/* Окно сообщения */}
                            <div
                                className="relative bg-[#FFF3E0] border-4 border-amber-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex-1 max-w-2xl">
                                <p className="text-green-600 shantell font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                                    {t("tasks.reward_notification.message", {
                                        message: taskRewardNotification.message,
                                    })}
                                    {taskRewardNotification.message.includes("") && (
                                        <img
                                            src={`${store.imgUrl}icon_pizza.png`}
                                            alt={t("common.labels.pizza")}
                                            className="w-6 h-6 ml-2 inline-block"
                                        />
                                    )}
                                </p>

                                <button
                                    onClick={closeRewardNotification}
                                    className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-8 py-2 rounded-full font-bold shantell text-base tracking-wide transition transform hover:scale-105"
                                >
                                    {t("common.buttons.ok")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Контейнер для скролла */}
                <div className="relative z-30 h-screen flex flex-col">
                    <div className="flex-shrink-0 pt-25"></div>

                    {/* Прокручиваемая область с блоками заданий */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 py-4">
                            {/* Сообщение, если все задания выполнены */}
                            {allTasksCompleted ? (
                                <div className="w-11/12 max-w-md mt-10 text-center">
                                    <div className="relative">
                                        <img
                                            src={`${store.imgUrl}img_block.png`}
                                            alt={t("tasks.all_completed.title")}
                                            className="w-full h-auto object-contain"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                            <div className="text-xl font-bold text-amber-800 shantell mb-2">
                                                {t("tasks.all_completed.title")}
                                            </div>
                                            <div className="text-md text-amber-700 shantell">
                                                {t("tasks.all_completed.subtitle")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Показываем только незавершенные задания
                                visibleTaskBlocks.map((block) => (
                                    <div key={block.id} className="w-11/12 max-w-md">
                                        <div className="relative">
                                            <img
                                                src={`${store.imgUrl}img_block.png`}
                                                alt={t("tasks.alts.task_block")}
                                                className={`w-full h-auto object-contain ${
                                                    block.id === 1 ? "scale-y-110" : ""
                                                }`}
                                            />
                                            <div className="absolute inset-0 flex flex-col p-2 sm:p-6 md:p-8">
                                                <div className="space-y-0 sm:space-y-1 px-2">
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                                                            {block.title}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1">
                                <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                                  {block.rewardPizza}
                                </span>
                                                                <img
                                                                    src={`${store.imgUrl}icon_pizza.png`}
                                                                    alt={t("common.labels.pizza")}
                                                                    className="w-5 sm:w-6"
                                                                />
                                                            </div>
                                                            {block.rewardPcoin && (
                                                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                                    + {block.rewardPcoin}
                                  </span>
                                                                    <img
                                                                        src={`${store.imgUrl}icon_dollar_coin.png`}
                                                                        alt={t("tasks.alts.coin")}
                                                                        className="w-5 sm:w-6"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Кнопки действий */}
                                                <div className="mt-auto px-2">
                                                    {block.id === 1 || block.id === 3 ? (
                                                        block.link ? (
                                                            <a
                                                                href={block.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => {
                                                                    if (block.onClick) block.onClick();
                                                                }}
                                                                className="block"
                                                            >
                                                                <button
                                                                    disabled={block.disabled}
                                                                    className={`relative w-full transition-opacity ${
                                                                        block.disabled
                                                                            ? "opacity-70 cursor-not-allowed"
                                                                            : "hover:opacity-90 cursor-pointer"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={`${store.imgUrl}${block.buttonBg}`}
                                                                        alt={t("tasks.alts.execute_task")}
                                                                        className="w-full h-auto"
                                                                    />
                                                                    <div
                                                                        className="absolute inset-0 flex items-center justify-center">
                                                                        <div
                                                                            className="text-white text-sm sm:text-base shantell font-bold">
                                                                            {block.buttonText}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            </a>
                                                        ) : null
                                                    ) : (
                                                        <Link to="/friends" className="block">
                                                            <button
                                                                disabled={block.disabled}
                                                                onClick={block.onClick}
                                                                className={`relative w-full transition-opacity ${
                                                                    block.disabled
                                                                        ? "opacity-70 cursor-not-allowed"
                                                                        : "hover:opacity-90 cursor-pointer"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={`${store.imgUrl}${block.buttonBg}`}
                                                                    alt={t("tasks.alts.execute_task")}
                                                                    className="w-full h-auto"
                                                                />
                                                                <div
                                                                    className="absolute inset-0 flex items-center justify-center">
                                                                    <div
                                                                        className="text-white text-sm sm:text-base shantell font-bold">
                                                                        {block.buttonText}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Рекламный таск -----------------------------------------------*/}
                            {shouldRenderAdsgram ? (
                                <adsgram-task
                                    className={styles.task}
                                    data-block-id="task-18892"
                                    ref={setAdsTaskEl}
                                >
                  <span
                      slot="reward"
                      className="text-amber-800 text-md shantell"
                  >
                    300{" "}
                      <span>
                      {" "}
                          <img
                              src={`${store.imgUrl}icon_pizza.png`}
                              alt={t("tasks.alts.dollar")}
                              className="inline-block w-6 h-auto sm:w-9"
                          />
                    </span>{" "}
                  </span>
                                    <div
                                        slot="button"
                                        className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-800 rounded-lg"
                                    >
                                        {t("tasks.adsgram.button_forward")}
                                    </div>
                                    <div
                                        slot="claim"
                                        className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-800 rounded-lg"
                                    >
                                        {t("tasks.adsgram.button_claim")}
                                    </div>
                                    <div
                                        slot="done"
                                        className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-700 rounded-lg"
                                    >
                                        {t("tasks.adsgram.button_done")}
                                    </div>
                                </adsgram-task>
                            ) : showAdsgramBlock ? (
                                // Заглушка, если adsgram-task не загружен
                                <div
                                    className="w-11/12 max-w-md text-center p-4 bg-amber-100 rounded-lg border-2 border-amber-800">
                                    <div className="text-lg font-bold text-amber-800 shantell mb-2">
                                        {t("tasks.adsgram.loading")}
                                    </div>
                                    <div className="text-amber-700 shantell">
                                        {t("tasks.adsgram.no_tasks")}
                                    </div>
                                </div>
                            ) : null}

                            {/* Кнопка и блок Daily Combo */}
                            <button
                                onClick={startDailyComboGame}
                                className="flex justify-center w-11/12 max-w-md hover:opacity-90 transition-opacity"
                            >
                                <img
                                    src={`${store.imgUrl}b_daily_combo.png`}
                                    alt={t("tasks.alts.combo")}
                                    className="w-1/2 h-auto"
                                />
                            </button>

                            {/* Игра Daily Combo */}
                            {showDailyCombo && (
                                <div className="w-11/12 max-w-md">
                                    <div className="relative p-4">
                                        {/* Заголовок */}
                                        <div className="text-center mb-4">
                                            {dailyComboRound.attempts >= 4 ? (
                                                <div className="text-xl font-bold text-amber-300 shantell mb-2">
                                                    {t("tasks.daily_combo.title")}
                                                </div>
                                            ) : (
                                                <div className="text-xl font-bold text-amber-200 shantell mb-2">
                                                    {t("tasks.daily_combo.title")}
                                                </div>
                                            )}
                                        </div>

                                        {/* Индикатор загрузки */}
                                        {dailyComboRound.isLoading && (
                                            <div className="text-center mb-4">
                                                <div className="text-amber-300 shantell">
                                                    {t("tasks.daily_combo.loading")}
                                                </div>
                                            </div>
                                        )}

                                        {/* 4 верхних квадрата с загаданными пиццами */}
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {dailyComboRound.guessedPizzas.map((slot, index) => (
                                                <div
                                                    key={`slot-${index}`}
                                                    className="relative aspect-square"
                                                >
                                                    {/* Красная анимация при неправильном выборе */}
                                                    {dailyComboRound.wrongAttemptAnimation &&
                                                        slot.visible &&
                                                        !slot.isHit && (
                                                            <div
                                                                className="absolute -inset-1 border-3 border-red-500 rounded-lg animate-pulse"/>
                                                        )}

                                                    {/* Зеленый квадрат при угадывании */}
                                                    {slot.visible && slot.isHit && (
                                                        <div
                                                            className="absolute -inset-1 border-3 border-green-500 rounded-lg"/>
                                                    )}

                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={`${store.imgUrl}img_block_pizza.png`}
                                                            alt="Pizza slot"
                                                            className="w-full h-full object-contain"
                                                        />

                                                        {/* Показываем пиццу если выбрана */}
                                                        {slot.visible && (
                                                            <>
                                                                <div
                                                                    className="absolute inset-0 flex items-center justify-center p-2">
                                                                    <img
                                                                        src={`${store.imgUrl}pizza_${slot.pizza}.png`}
                                                                        alt={slot.pizza}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>

                                                                {/* Надпись "+250" или "+0" */}
                                                                {dailyComboRound.showWinLabels[index] && (
                                                                    <div
                                                                        className="absolute inset-0 flex items-center justify-center">
                                                                        <div
                                                                            className={`font-bold text-lg shantell px-2 py-1 rounded-md animate-bounce ${
                                                                                slot.isHit
                                                                                    ? "bg-amber-300 text-amber-800" // Зеленый для угаданных
                                                                                    : "bg-red-500 text-white" // Красный для неудачных
                                                                            }`}
                                                                        >
                                                                            {slot.isHit ? "+250" : "+0"}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Название пиццы под квадратом */}
                                                    {slot.visible && (
                                                        <div className="text-center mt-1">
                              <span className="text-white text-xs font-bold shantell leading-tight">
                                {slot.pizza}
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Все пиццы 4x4 */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {PIZZA_LIST.map((pizzaName, index) => {
                                                const serverIndex = index + 1;
                                                const isSelected =
                                                    dailyComboRound.selectedIndices.includes(serverIndex);
                                                const isDisabled =
                                                    dailyComboRound.attempts >= 4 ||
                                                    !dailyComboRound.isAvailable ||
                                                    isSelected;

                                                return (
                                                    <div
                                                        key={`pizza-${index}`}
                                                        className={`flex flex-col items-center ${
                                                            isDisabled
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : "cursor-pointer hover:scale-105 transition-transform"
                                                        }`}
                                                        onClick={() =>
                                                            !isDisabled && handlePizzaClick(pizzaName)
                                                        }
                                                    >
                                                        <div className="relative aspect-square w-full">
                                                            <img
                                                                src={`${store.imgUrl}img_block_pizza.png`}
                                                                alt={t("tasks.alts.pizza_bg")}
                                                                className="w-full h-full object-contain"
                                                            />
                                                            <div
                                                                className="absolute inset-0 flex items-center justify-center p-2">
                                                                <img
                                                                    src={`${store.imgUrl}pizza_${pizzaName}.png`}
                                                                    alt={pizzaName}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            {isSelected && (
                                                                <div
                                                                    className="absolute inset-0 bg-black/30 rounded"></div>
                                                            )}
                                                        </div>
                                                        <div className="text-center mt-1">
                              <span className="text-white text-xs font-bold shantell leading-tight">
                                {pizzaName}
                              </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Счетчик попыток */}
                                        <div className="text-center mt-4 text-amber-300 shantell">
                                            {t("tasks.daily_combo.attempts", {
                                                attempts: dailyComboRound.attempts,
                                            })}
                                            {dailyComboRound.attempts >= 4 && (
                                                <div className="text-green-600 font-bold mt-2">
                                                    {t("tasks.daily_combo.round_over")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative mt-auto">
                                        <img
                                            src={`${store.imgUrl}img_block.png`}
                                            alt={t("tasks.alts.additional_block")}
                                            className="w-full h-auto object-contain"
                                        />
                                        <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                                            <div className="space-y-0 sm:space-y-1 px-2">
                                                <div className="flex items-center justify-between">
                                                    <img
                                                        src={`${store.imgUrl}img_daily_combo.png`}
                                                        alt={t("tasks.alts.combo")}
                                                        className="w-1/3 h-auto"
                                                    />
                                                    <div className="flex flex-col gap-1 sm:gap-2 mx-2 sm:mx-4">
                                                        <div
                                                            className="text-right leading-4 text-md sm:text-lg text-amber-800 shantell">
                                                            {t("tasks.daily_combo.max_reward")}
                                                        </div>
                                                        <span
                                                            className="font-bold text-2xl sm:text-3xl text-amber-800 shantell">
                              1000
                              <img
                                  src={`${store.imgUrl}icon_pizza.png`}
                                  alt={t("tasks.alts.dollar")}
                                  className="ml-2 inline-block w-12 h-auto sm:w-18"
                              />
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto px-2"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 pb-20"></div>
                </div>
            </div>
            <Footer/>

        </>
    );
}

export default Tasks;
