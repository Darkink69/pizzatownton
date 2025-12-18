import { useEffect, useState } from "react";
import store from "../store/store";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import styles from "../css/task.module.css";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "adsgram-task": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "data-block-id": string;
        ref?: React.RefObject<HTMLElement>;
      };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

function Tasks() {
  const [showDailyCombo, setShowDailyCombo] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribedToTeamLove, setIsSubscribedToTeamLove] = useState(false);
  const [isInviteTaskDone, setIsInviteTaskDone] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [isAdsgramLoaded, setIsAdsgramLoaded] = useState(false);
  const [showAdsgramBlock, setShowAdsgramBlock] = useState(true);
  const [adsTaskEl, setAdsTaskEl] = useState<HTMLElement | null>(null);
  // Состояние для уведомления о начислении денег
  const [taskRewardNotification, setTaskRewardNotification] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  // Состояния для игры Daily Combo
  const [dailyComboRound, setDailyComboRound] = useState<{
    isActive: boolean;
    isLoading: boolean;
    selectedPizzas: string[];
    guessedPizzas: { pizza: string; index: number; visible: boolean }[];
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
    guessedPizzas: Array.from({ length: 4 }, (_, i) => ({
      pizza: "",
      index: i,
      visible: false,
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

  const pizzaList = [
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
  ];

  // Инициализация выполненных заданий из localStorage
  useEffect(() => {
    const subscribedDone =
      localStorage.getItem("subscribedTaskDone") === "true";
    const subscribedTeamLoveDone =
      localStorage.getItem("subscribedTeamLoveTaskDone") === "true";
    const inviteDone = localStorage.getItem("invite3TaskDone") === "true";

    if (subscribedDone) {
      setIsSubscribed(true);
      setCompletedTaskIds((prev) => [...prev, 1]);
    }

    if (subscribedTeamLoveDone) {
      setIsSubscribedToTeamLove(true);
      setCompletedTaskIds((prev) => [...prev, 3]);
    }

    if (inviteDone) {
      setIsInviteTaskDone(true);
      setCompletedTaskIds((prev) => [...prev, 2]);
    }
  }, []);

  // Функция для показа уведомления о награде
  const showRewardNotification = (rewardMessage: string) => {
    setTaskRewardNotification({
      show: true,
      message: rewardMessage,
    });

    // Автоматически скрываем через 8 секунд
    setTimeout(() => {
      setTaskRewardNotification({ show: false, message: "" });
    }, 8000);
  };

  // Обработчик закрытия уведомления
  const closeRewardNotification = () => {
    setTaskRewardNotification({ show: false, message: "" });
  };

  // Эффект для adsgram-task
  useEffect(() => {
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
  useEffect(() => {
    const checkAdsgram = () => {
      if (customElements.get("adsgram-task")) {
        console.log("✅ Adsgram-task custom element loaded");
        setIsAdsgramLoaded(true);
      } else {
        setIsAdsgramLoaded(false);
        console.log("❌ Adsgram-task custom element not found");
      }
    };

    checkAdsgram();

    // Проверяем периодически
    const checkInterval = setInterval(checkAdsgram, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  // следим за статусом INVITE_3_FRIENDS из стора:
  useEffect(() => {
    if (store.taskInvite3Status === "rewarded") {
      setIsInviteTaskDone(true);
      localStorage.setItem("invite3TaskDone", "true");
      setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 2), 2]);

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
        setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 1), 1]);

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
        setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 3), 3]);

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

    if (isInviteTaskDone) return;

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
      buttonText: isSubscribed ? "ВЫПОЛНЕНО" : "ПЕРЕЙТИ",
      buttonBg: isSubscribed ? "b_blue_small.png" : "b_red_small.png",
      onClick: !isSubscribed ? handleSubscribe : undefined,
      disabled: isSubscribed,
      isCompleted: isSubscribed,
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

  // Фильтруем задания, чтобы показывать только невыполненные
  const visibleTaskBlocks = taskBlocks.filter(
    (block) => !completedTaskIds.includes(block.id)
  );

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

  const handlePizzaClick = async (pizzaName: string, _pizzaIndex: number) => {
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
    const indexInList = pizzaList.indexOf(pizzaName);
    const serverIndex = indexInList + 1; // Сервер ожидает индексы с 1

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
      const customEvent = event as CustomEvent;
      const comboData = customEvent.detail;
      console.log("🎯 Combo game data loaded from WebSocket:", comboData);

      // Обновляем состояние игры на основе данных сервера
      const updatedGuessedPizzas = Array.from({ length: 4 }, (_, slotIndex) => {
        // Берем индекс пиццы из comboData.selected для этого слота
        const pizzaIndex = comboData.selected?.[slotIndex] || 0;
        const pizzaName = pizzaIndex > 0 ? pizzaList[pizzaIndex - 1] : "";

        return {
          pizza: pizzaName,
          index: slotIndex,
          visible: !!pizzaName, // Видимо, если есть название
        };
      });

      // Определяем угаданные пиццы на основе hits и selectedIndices
      // Note: Мы не знаем конкретные пиццы, только количество угаданных
      const hits = comboData.hits || 0;
      const visibleCount = Math.min(hits, 4);

      for (let i = 0; i < visibleCount; i++) {
        updatedGuessedPizzas[i].visible = true;
        // Мы не знаем название пиццы, оставляем пустым
      }

      setDailyComboRound((prev) => ({
        ...prev,
        isActive: true,
        isLoading: false,
        guessedPizzas: updatedGuessedPizzas,
        attempts: comboData.picksUsed || 0,
        picksUsed: comboData.picksUsed || 0,
        hits: comboData.hits || 0,
        selectedIndices: comboData.selected || [],
        isAvailable: comboData.isAvailable !== false,
        isWin: comboData.isWin || false,
        winAmount: comboData.winAmount || 0,
      }));

      // Если уже есть выигрыш, показываем уведомление
      if (comboData.isWin && comboData.winAmount) {
        setTimeout(() => {
          showRewardNotification(`${comboData.winAmount} pizza`);
        }, 500);
      }
    };

    const handleComboPickResult = (event: Event) => {
      const customEvent = event as CustomEvent;
      const pickData = customEvent.detail;
      console.log("🎯 Combo pick result from WebSocket:", pickData);

      // Обновляем состояние на основе результата выбора
      const newAttempts = pickData.picksUsed || dailyComboRound.attempts + 1;
      const newHits = pickData.hits || dailyComboRound.hits;
      const newSelectedIndices = pickData.selected || [
        ...dailyComboRound.selectedIndices,
      ];

      // Проверяем, было ли это успешное угадывание
      const wasHit = newHits > dailyComboRound.hits;

      if (wasHit) {
        // Находим первую пустую позицию для отображения угаданной пиццы
        const emptySlotIndex = dailyComboRound.guessedPizzas.findIndex(
          (p) => !p.visible
        );
        if (emptySlotIndex !== -1) {
          const updatedGuessedPizzas = [...dailyComboRound.guessedPizzas];
          // Мы не знаем название угаданной пиццы, оставляем как есть
          updatedGuessedPizzas[emptySlotIndex] = {
            ...updatedGuessedPizzas[emptySlotIndex],
            visible: true,
          };

          const newWonPositions = [
            ...dailyComboRound.wonPositions,
            emptySlotIndex,
          ];
          const newShowWinLabels = [...dailyComboRound.showWinLabels];
          newShowWinLabels[emptySlotIndex] = true;

          playSound("win.mp3");

          // Рассчитываем выигрыш (250 за каждую угаданную пиццу)
          const newGameWon = newHits * 250;

          setDailyComboRound((prev) => ({
            ...prev,
            guessedPizzas: updatedGuessedPizzas,
            attempts: newAttempts,
            gameWon: newGameWon,
            wrongAttemptAnimation: false,
            wonPositions: newWonPositions,
            showWinLabels: newShowWinLabels,
            picksUsed: pickData.picksUsed || prev.picksUsed + 1,
            hits: newHits,
            selectedIndices: newSelectedIndices,
            isLoading: false,
            isAvailable: pickData.isAvailable !== false,
            isWin: pickData.isWin || false,
            winAmount: pickData.winAmount || prev.winAmount,
          }));

          toast.success(`✅ Угадана пицца! +250 pizza`);
        }
      } else {
        // Неправильная попытка
        setDailyComboRound((prev) => ({
          ...prev,
          attempts: newAttempts,
          wrongAttemptAnimation: true,
          picksUsed: pickData.picksUsed || prev.picksUsed + 1,
          selectedIndices: newSelectedIndices,
          isLoading: false,
          isAvailable: pickData.isAvailable !== false,
          isWin: pickData.isWin || false,
          winAmount: pickData.winAmount || prev.winAmount,
        }));

        playSound("lost.mp3");

        // Скрываем анимацию через секунду
        setTimeout(() => {
          setDailyComboRound((prev) => ({
            ...prev,
            wrongAttemptAnimation: false,
          }));
        }, 1000);

        toast.error(`❌ Пицца не входит в сегодняшний список`);
      }

      // Если попытки закончились и есть выигрыш
      if (
        newAttempts >= 4 &&
        pickData.isWin &&
        pickData.winAmount &&
        !dailyComboRound.isWin
      ) {
        setTimeout(() => {
          showRewardNotification(`${pickData.winAmount} pizza`);
        }, 1000);
      }

      // Если попытки закончились
      if (newAttempts >= 4) {
        setDailyComboRound((prev) => ({
          ...prev,
          isAvailable: false,
        }));
      }
    };

    const handleComboWinNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const winData = customEvent.detail;
      console.log("💰 Combo win notification:", winData);

      // Показываем уведомление о выигрыше
      if (winData.amount) {
        showRewardNotification(`${winData.amount} pizza`);
      }
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
  }, [dailyComboRound]);

  // Рендерим adsgram-task только если он загружен и не скрыт
  const shouldRenderAdsgram = isAdsgramLoaded && showAdsgramBlock;

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

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_task_list.png`} alt="tasks" />
        </div>

        {/* Уведомление о награде */}
        {taskRewardNotification.show && (
          <div className="fixed inset-0 z-[99] bg-black/50 flex items-end justify-center transition-opacity duration-300">
            <div className="relative mb-4 sm:mb-16 flex items-end gap-2 sm:gap-4 max-w-5xl mx-auto px-4 w-full">
              <div className="flex-shrink-0">
                <img
                  src={`${store.imgUrl}img_chif_talk.png`}
                  alt="Повар"
                  className="w-36 sm:w-48 object-contain"
                />
              </div>

              {/* Окно сообщения */}
              <div className="relative bg-[#FFF3E0] border-4 border-amber-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex-1 max-w-2xl">
                <p className="text-green-600 shantell font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  Ваш выигрыш {taskRewardNotification.message}
                  {taskRewardNotification.message.includes("") && (
                    <img
                      src={`${store.imgUrl}icon_pizza.png`}
                      alt="pizza"
                      className="w-6 h-6 ml-2 inline-block"
                    />
                  )}
                </p>

                <button
                  onClick={closeRewardNotification}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-8 py-2 rounded-full font-bold shantell text-base tracking-wide transition transform hover:scale-105"
                >
                  Понятно
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
                      alt="All tasks completed"
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      <div className="text-xl font-bold text-amber-800 shantell mb-2">
                        Все задания выполнены!
                      </div>
                      <div className="text-md text-amber-700 shantell">
                        Возвращайтесь позже за новыми заданиями
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
                        alt="Task block"
                        className={`w-full h-auto object-contain ${
                          block.id === 1 ? "scale-y-110" : ""
                        }`}
                      />
                      <div className="absolute inset-0 flex flex-col p-2 sm:p-6 md:p-8">
                        <div className="space-y-0 sm:space-y-1 px-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                              {block.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                                  {block.rewardPizza}
                                </span>
                                <img
                                  src={`${store.imgUrl}icon_pizza.png`}
                                  alt="Pizza"
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
                                    alt="Coin"
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
                                    alt="Выполнить задачу"
                                    className="w-full h-auto"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-sm sm:text-base shantell font-bold">
                                      {block.buttonText}
                                    </div>
                                  </div>
                                </button>
                              </a>
                            ) : null
                          ) : (
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
                                alt="Выполнить задачу"
                                className="w-full h-auto"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-sm sm:text-base shantell font-bold">
                                  {block.buttonText}
                                </div>
                              </div>
                            </button>
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
                  data-block-id="task-19032"
                  ref={setAdsTaskEl}
                >
                  <span
                    slot="reward"
                    className="text-amber-800 text-md shantell"
                  >
                    300 pizza
                  </span>
                  <div
                    slot="button"
                    className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-800 rounded-lg"
                  >
                    Вперед
                  </div>
                  <div
                    slot="claim"
                    className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-800 rounded-lg"
                  >
                    Получить
                  </div>
                  <div
                    slot="done"
                    className="text-amber-800 text-sm shantell flex justify-center items-center w-15 h-14 bg-amber-100 border-2 border-amber-700 rounded-lg"
                  >
                    Готово
                  </div>
                </adsgram-task>
              ) : showAdsgramBlock ? (
                // Заглушка, если adsgram-task не загружен
                <div className="w-11/12 max-w-md text-center p-4 bg-amber-100 rounded-lg border-2 border-amber-800">
                  <div className="text-lg font-bold text-amber-800 shantell mb-2">
                    ⏳ Рекламное задание
                  </div>
                  <div className="text-amber-700 shantell">
                    Сейчас нет заданий от наших партнеров, зайдите позже
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
                  alt="combo"
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
                          Угадай 4 сегодняшние пиццы!
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-amber-200 shantell mb-2">
                          Угадай 4 сегодняшние пиццы!
                        </div>
                      )}
                    </div>

                    {/* Индикатор загрузки */}
                    {dailyComboRound.isLoading && (
                      <div className="text-center mb-4">
                        <div className="text-amber-300 shantell">
                          Загрузка игры...
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
                            !slot.visible && (
                              <div className="absolute -inset-1 border-3 border-red-500 rounded-lg animate-pulse" />
                            )}

                          {/* Зеленый квадрат при угадывании */}
                          {dailyComboRound.wonPositions.includes(index) && (
                            <div className="absolute -inset-1 border-3 border-green-500 rounded-lg" />
                          )}

                          <div className="relative w-full h-full">
                            <img
                              src={`${store.imgUrl}img_block_pizza.png`}
                              alt="Pizza slot"
                              className="w-full h-full object-contain"
                            />

                            {/* Показываем пиццу если угадана */}
                            {slot.visible && (
                              <>
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                  <img
                                    src={`${store.imgUrl}pizza_${slot.pizza}.png`}
                                    alt={slot.pizza}
                                    className="w-full h-full object-contain"
                                  />
                                </div>

                                {/* Надпись "+250" */}
                                {dailyComboRound.showWinLabels[index] && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-amber-300 text-amber-800 font-bold text-lg shantell px-2 py-1 rounded-md animate-bounce">
                                      +250
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
                      {pizzaList.map((pizzaName, index) => {
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
                              !isDisabled &&
                              handlePizzaClick(pizzaName, serverIndex)
                            }
                          >
                            <div className="relative aspect-square w-full">
                              <img
                                src={`${store.imgUrl}img_block_pizza.png`}
                                alt="Pizza background"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-center p-2">
                                <img
                                  src={`${store.imgUrl}pizza_${pizzaName}.png`}
                                  alt={pizzaName}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              {isSelected && (
                                <div className="absolute inset-0 bg-black/30 rounded"></div>
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
                      Попыток: {dailyComboRound.attempts}/4
                      {dailyComboRound.attempts >= 4 && (
                        <div className="text-green-600 font-bold mt-2">
                          Раунд завершен! Следующая попытка завтра.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative mt-auto">
                    <img
                      src={`${store.imgUrl}img_block.png`}
                      alt="Additional block"
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                      <div className="space-y-0 sm:space-y-1 px-2">
                        <div className="flex items-center justify-between">
                          <img
                            src={`${store.imgUrl}img_daily_combo.png`}
                            alt="combo"
                            className="w-1/3 h-auto"
                          />
                          <div className="flex flex-col gap-1 sm:gap-2 mx-2 sm:mx-4">
                            <div className="text-right leading-4 text-md sm:text-lg text-amber-800 shantell">
                              MAX награда
                            </div>
                            <span className="font-bold text-2xl sm:text-3xl text-amber-800 shantell">
                              1000
                              <img
                                src={`${store.imgUrl}icon_pizza.png`}
                                alt="dollar"
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
      <Footer />
      <WebSocketComponent />
    </>
  );
}

export default Tasks;
