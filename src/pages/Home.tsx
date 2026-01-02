import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
// import FooterHome from "../components/FooterHome";
import GuideOverlay from "../pages/GuideOverlay";
import { getFloorUpgradeData, getCurrentUpgradeCost } from "./floorUpgradeData";
import { useTranslation } from "react-i18next";

const Home = observer(() => {
  const [jettonUiMessage, setJettonUiMessage] = useState<string | null>(null);
  const [jettonUiType, setJettonUiType] = useState<"success" | "error" | null>(
    null
  );
  const JETTON_DEPOSIT_URL =
    "https://t.me/play_wheelclub_bot?start=cgGoyDUwtm9";

  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [liftPosition, setLiftPosition] = useState<number>(0);
  const [liftHasPizza, setLiftHasPizza] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [randomNotification, setRandomNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [staffModal, setStaffModal] = useState<"accountant" | null>(null);
  const [_selectedSubscription, setSelectedSubscription] = useState<
    number | null
  >(null);
  const [_selectedCost, setSelectedCost] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showGuide, setShowGuide] = useState(false);
  const [showPizzaNotification, setShowPizzaNotification] = useState(false);
  const [wonPcoins, setWonPcoins] = useState(0);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeModalStage, setPrizeModalStage] = useState<"intro" | "result">(
    "intro"
  );
  const [showChancesInfo, setShowChancesInfo] = useState(false);
  const audioNotificationRef = useRef<HTMLAudioElement | null>(null);

  const [showNYBoxNotification, setShowNYBoxNotification] = useState(false);
  const [showNYBoxModal, setShowNYBoxModal] = useState(false);
  const [isJettonChecking, setIsJettonChecking] = useState(false);

  useEffect(() => {
    console.log("jettonLastResult changed:", store.jettonLastResult);
    const r = store.jettonLastResult;
    if (!r) return;

    // ответ пришёл -> разблокируем кнопку
    setIsJettonChecking(false);

    if (!r.haveDepo) {
      setJettonUiType("error");
      setJettonUiMessage("Депозит > 10$ не найден. Попробуйте позже.");
      return;
    }

    const currencyParts: string[] = [];
    if (r.pcoin) currencyParts.push(`+${r.pcoin} PCoin`);
    if (r.pizza) currencyParts.push(`+${r.pizza} Pizza`);
    if (r.pdollar) currencyParts.push(`+${r.pdollar} PDollar`);

    const sliceParts: string[] = [];
    if (r.commonSlice) sliceParts.push(`Common +${r.commonSlice}`);
    if (r.unCommonSlice) sliceParts.push(`Uncommon +${r.unCommonSlice}`);
    if (r.rareSlice) sliceParts.push(`Rare +${r.rareSlice}`);
    if (r.mystikalSlice) sliceParts.push(`Mystical +${r.mystikalSlice}`);

    const msg =
      `Депозит подтверждён!\n` +
      (currencyParts.length ? `Награда: ${currencyParts.join(", ")}\n` : "") +
      (sliceParts.length ? `Кусочки: ${sliceParts.join(", ")}` : "");

    setJettonUiType("success");
    setJettonUiMessage(msg);
  }, [store.jettonLastResult]);

  // Запрос данных при монтировании
  useEffect(() => {
    if (!store.areFloorsLoaded) {
      console.log("Requesting floors data on component mount...");
      store.requestFloorsData();
    }
  }, [store.areFloorsLoaded]);

  // Автоскролл при загрузке
  useEffect(() => {
    if (store.areFloorsLoaded) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "auto",
        });
      }, 1000);
    }
  }, [store.areFloorsLoaded]);

  useEffect(() => {
    if (!store.sessionId || (!store.user?.telegramId && !store.user?.id)) {
      console.log("⏳ Ждём AUTH_INIT: sessionId или telegramId ещё нет");
      return;
    }
    if (!localStorage.getItem("main_tutorial_done")) {
      setShowGuide(true);
    }

    const delay = Math.floor(Math.random() * 5000);
    const timer = setTimeout(() => {
      setShowPizzaNotification(true);

      audioNotificationRef.current = new Audio(
        `${store.imgUrl}message-notification.m4a`
      );
      if (audioNotificationRef.current) {
        audioNotificationRef.current.currentTime = 0;
        audioNotificationRef.current.play().catch(console.error);
      }
    }, delay);

    const nyBoxDelay = delay + 3000; // Показываем через 3 секунды после пиццы
    const nyBoxTimer = setTimeout(() => {
      setShowNYBoxNotification(true);
    }, nyBoxDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(nyBoxTimer);
    };
  }, [store.sessionId, store.user?.telegramId, store.user?.id, t]);

  const introGuideSteps = [
    {
      id: "welcome",
      center: true,
      text: "home.guide.welcome",
    },
    {
      id: "floors",
      selector: "#floors-block",
      text: "home.guide.floors",
    },
    {
      id: "balances",
      selector: "#balances-block",
      text: "home.guide.balances",
    },
    {
      id: "claim",
      selector: "#claim-button",
      text: "home.guide.claim",
    },
    {
      id: "accountant",
      selector: "#accountant-block",
      text: "home.guide.accountant",
    },
    {
      id: "bank",
      selector: "#bank-link",
      text: "home.guide.bank",
    },
    {
      id: "finish",
      center: true,
      text: "home.guide.finish",
    },
  ];

  // Эффект для анимации лифта
  useEffect(() => {
    const liftAnimation = () => {
      if (!liftHasPizza) {
        setLiftPosition((prev) => {
          const newPosition = prev + 1;
          if (newPosition >= 85) {
            setTimeout(() => {
              setLiftHasPizza(true);
            }, 500);
            return 85;
          }
          return newPosition;
        });
      } else {
        setLiftPosition((prev) => {
          const newPosition = prev - 1;
          if (newPosition <= -2) {
            setTimeout(() => {
              setLiftHasPizza(false);
            }, 500);
            return -2;
          }
          return newPosition;
        });
      }
    };

    const interval = setInterval(liftAnimation, 50);
    return () => clearInterval(interval);
  }, [liftHasPizza]);

  // Функция для получения позиции лифта
  const getLiftStyle = (): React.CSSProperties => {
    const liftHeight = 10;
    const bottomPosition = ((100 - liftHeight) * liftPosition) / 100;

    return {
      position: "absolute",
      bottom: `${bottomPosition}%`,
      right: "14px",
      zIndex: 20,
      transition: "bottom 0.05s linear",
      width: "60px",
      height: `${liftHeight}%`,
    };
  };

  // Функция для воспроизведения звуков
  const playSound = (soundName: string) => {
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
    }

    soundRef.current = new Audio(`${store.imgUrl}${soundName}`);
    soundRef.current.volume = 0.3;
    soundRef.current.play().catch((e) => {
      console.log("Sound play prevented:", e);
    });
  };

  // Таймер обратного отсчета
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(store.accountantEndTime);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [store.accountantEndTime]);

  // Форматирование времени для отображения
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  // Инициализация аудио
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const floors = 11;

  useEffect(() => {
    audioRef.current = new Audio(`${store.imgUrl}pizza.mp3`);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    if (isMusicPlaying) {
      audioRef.current.play().catch((e) => {
        console.log("Autoplay prevented:", e);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, []);

  // Управление музыкой
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((e) => {
          console.log("Play failed:", e);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Показ уведомления
  const showNotification = (
    message: string,
    type: "error" | "success" = "error"
  ) => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification(null);
    }, 8000);
  };

  // Для окна с пиццей-лутбоксом
  const handlePizzaNotificationClick = () => {
    setShowPrizeModal(true);
    setPrizeModalStage("intro");
  };

  const handleClosePrizeModal = () => {
    setShowPrizeModal(false);
    setPrizeModalStage("intro");
    setWonPcoins(0);
  };

  const handleBuyLootbox = () => {
    if (!store.isAuthed) {
      showNotification(t("common.notifications.auth_pending"), "error");
      return;
    }
    if (!store.sessionId) {
      showNotification(t("common.notifications.session_not_set"), "error");
      return;
    }
    if (!store.user?.telegramId && !store.user?.id) {
      showNotification(t("common.notifications.user_not_authorized"), "error");
      return;
    }

    if (store.pizza < 2000) {
      showNotification(t("home.lootbox_modal.buy_error_pizza"), "error");
      return;
    }
    const ok = store.openPizzaBox();
    if (!ok) {
      showNotification(t("home.lootbox_modal.buy_error_request"), "error");
    }
  };

  // Реакция на результат открытия лутбокса с сервера
  useEffect(() => {
    const res = store.lastPizzaBoxResult;
    if (!res) return;

    setPrizeModalStage("result");
    setWonPcoins(res.pcoinReward);
    playSound("win.mp3");
    showNotification(
      t("home.lootbox_modal.buy_success", { reward: res.pcoinReward }),
      "success"
    );
    store.setLastPizzaBoxResult(null);
  }, [store.lastPizzaBoxResult, t]);

  // Функции для уведомлений (оставим на русском, так как они генерируются системой)
  const getRandomNotification = () => {
    const hasAccountant = isAccountantActive();
    const hasAnyManager =
      store.safeUserFloorList?.some((floor) =>
        floor.staff?.some(
          (staff) =>
            staff.staffName === "Manager" && staff.owned && staff.staffLevel > 0
        )
      ) ?? false;

    const hasAnyGuard =
      store.safeUserFloorList?.some((floor) =>
        floor.staff?.some(
          (staff) =>
            staff.staffName === "Guard" && staff.owned && staff.staffLevel > 0
        )
      ) ?? false;

    const hasManagerNotMaxLevel =
      store.safeUserFloorList?.some((floor) =>
        floor.staff?.some(
          (staff) =>
            staff.staffName === "Manager" &&
            staff.owned &&
            staff.staffLevel > 0 &&
            staff.staffLevel < 5
        )
      ) ?? false;

    const hasGuardNotMaxLevel =
      store.safeUserFloorList?.some((floor) =>
        floor.staff?.some(
          (staff) =>
            staff.staffName === "Guard" &&
            staff.owned &&
            staff.staffLevel > 0 &&
            staff.staffLevel < 5
        )
      ) ?? false;

    const possibleMessages: Array<{
      message: string;
      type: "error" | "success";
      condition: boolean;
    }> = [
      {
        message: "home.random_notifications.forgot_profit",
        type: "error",
        condition: !hasAccountant,
      },
      {
        message: "home.random_notifications.need_manager",
        type: "error",
        condition: !hasAnyManager,
      },
      {
        message: "home.random_notifications.cash_desk_hole",
        type: "error",
        condition: !hasAnyGuard,
      },
      {
        message: "home.random_notifications.manager_needs_upgrade",
        type: "error",
        condition: hasManagerNotMaxLevel,
      },
      {
        message: "home.random_notifications.guard_needs_upgrade",
        type: "error",
        condition: hasGuardNotMaxLevel,
      },
      {
        message: "home.random_notifications.good_reviews",
        type: "success",
        condition: true,
      },
      {
        message: "home.random_notifications.floors_working_hard",
        type: "success",
        condition: true,
      },
      {
        message: "home.random_notifications.need_to_expand",
        type: "success",
        condition: true,
      },
    ];

    const availableMessages = possibleMessages.filter((msg) => msg.condition);

    if (availableMessages.length > 0 && Math.random() > 0.3) {
      const randomIndex = Math.floor(Math.random() * availableMessages.length);
      return availableMessages[randomIndex];
    }

    return null;
  };

  // Эффект для случайных уведомлений
  useEffect(() => {
    if (!store.areFloorsLoaded) return;

    const randomTime = Math.floor(Math.random() * 30000) + 20000;
    const timer = setTimeout(() => {
      const notification = getRandomNotification();
      if (notification) {
        setRandomNotification(notification);
      }
    }, randomTime);

    return () => clearTimeout(timer);
  }, [store.areFloorsLoaded]);

  // Проверка, есть ли нанятый персонал на любом этаже
  const hasAnyStaffHired = (): boolean => {
    if (!store.safeUserFloorList) return false;
    return store.safeUserFloorList.some((floor) =>
      floor.staff?.some((staff) => staff.owned && staff.staffLevel > 0)
    );
  };

  const handleClaimDo = () => {
    playSound("claim.mp3");

    if (!hasAnyStaffHired()) {
      showNotification(t("home.notifications.losing_income_warning"), "error");
    } else {
      showNotification(t("home.notifications.claiming_income"), "success");
    }

    if (store.sendClaimDo(0)) {
      // Уведомление уже показано выше
    } else {
      showNotification(t("home.notifications.claim_error"), "error");
    }
  };

  // Персонал
  const handleOpenAccountantModal = () => setStaffModal("accountant");
  const handleCloseStaffModal = () => {
    setStaffModal(null);
    setSelectedSubscription(null);
    setSelectedCost(0);
  };

  const handleHireAccountant = (option?: number) => {
    if (!staffModal) return;

    const accountantLevels = store.userStaff?.accountantLevel ?? [];
    const selected = accountantLevels.find(
      (lvl: { duration?: number; durationDay?: number }) =>
        (lvl.duration ?? lvl.durationDay) === (option ?? 7)
    );

    const cost = selected?.cost ?? 0;

    if (store.pcoin < cost) {
      showNotification(t("home.accountant_modal.insufficient_funds"), "error");
      return;
    }

    playSound("staff.mp3");
    const ok = store.sendHireStaff(3, undefined, option ?? 7, 0);

    if (ok) {
      // НЕ списываем локально: баланс обновится после ответа с сервера
      showNotification(t("home.accountant_modal.hired_success"), "success");
      handleCloseStaffModal();
    } else {
      showNotification(t("home.accountant_modal.hire_error"), "error");
    }
  };

  // Получение данных этажа
  const getFloorData = (index: number) => {
    if (index === 0 || index === floors - 1) return null;
    const realFloorId = floors - 1 - index;
    return (
      store.safeUserFloorList?.find((f) => f.floorId === realFloorId) || null
    );
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <img
        key={i}
        src={`${store.imgUrl}${
          i < level ? "icon_star.png" : "icon_star_empty.png"
        }`}
        alt={
          i < level ? t("common.labels.star") : t("common.labels.empty_star")
        }
        className="w-4 h-4"
      />
    ));
  };

  // Функция для получения видео в зависимости от персонала на этаже
  const getFloorVideo = (floorData: any): string => {
    if (!floorData || !floorData.staff) return "chif.mp4";

    const hasManager = floorData.staff.some(
      (staff: any) =>
        staff.staffName === "Manager" && staff.owned && staff.staffLevel > 0
    );

    const hasGuard = floorData.staff.some(
      (staff: any) =>
        staff.staffName === "Guard" && staff.owned && staff.staffLevel > 0
    );

    if (hasManager && hasGuard) return "manager_guard.mp4";
    if (hasManager) return "manager.mp4";
    if (hasGuard) return "guard.mp4";

    return "chif.mp4";
  };

  // Модальное окно улучшения этажа
  const handleOpenUpgradeModal = (floorId: number) => {
    setSelectedFloorId(floorId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFloorId(null);
  };

  const selectedFloor = selectedFloorId
    ? store.safeUserFloorList.find((f) => f.floorId === selectedFloorId)
    : null;

  const handleUpgradeFromModal = () => {
    if (!selectedFloor) return;
    playSound("update.mp3");

    const displayFloorNumber = getDisplayFloorNumber(selectedFloor.floorId);
    showNotification(
      t("home.notifications.upgrade_request_sent", { displayFloorNumber }),
      "success"
    );

    const success = store.upgradeFloor(selectedFloor.floorId);
    if (success) {
      setTimeout(() => {
        showNotification(
          t("home.notifications.upgrade_success", {
            displayFloorNumber,
            level: (selectedFloor.level ?? 0) + 1,
          }),
          "success"
        );
      }, 800);
    } else {
      setTimeout(() => {
        showNotification(
          t("home.notifications.upgrade_failed", { displayFloorNumber }),
          "error"
        );
      }, 800);
    }
  };

  const getFloorIdByIndex = (index: number): number => {
    if (index === 0) return -2;
    if (index === floors - 1) return -1;
    return floors - 1 - index;
  };

  const getFloorImage = (index: number) => {
    if (index === floors - 1) return "img_basement_floor.png";
    if (index === 0) return "img_roof.png";

    const floorId = getFloorIdByIndex(index);
    const floor = store.getFloorById(floorId);
    return floor?.owned ? "img_floor_empty.png" : "img_floor_dark.png";
  };

  const isFilledFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    if (floorId === -1 || floorId === -2) return true;
    const floor = store.getFloorById(floorId);
    return floor?.owned;
  };

  const isEmptyFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    if (floorId === -1 || floorId === -2) return false;
    const floor = store.getFloorById(floorId);
    return !floor?.owned;
  };

  // Функция для получения отображаемого номера этажа
  const getDisplayFloorNumber = (floorId: number): string => {
    if (floorId === 1) return t("home.floor.base");
    if (floorId >= 2 && floorId <= 9)
      return t("home.floor.name", { floorId: floorId - 1 });
    return t("home.floor.name", { floorId });
  };

  const getFloorNameByIndex = (index: number): string => {
    const floorId = getFloorIdByIndex(index);
    if (index === 0) return t("home.floor.roof");
    if (floorId === -1) return t("home.floor.base");

    return getDisplayFloorNumber(floorId);
  };

  const handleBuyFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    playSound("buy.mp3");
    const success = store.buyNewFloor(floorId);
    const displayFloorNumber = getDisplayFloorNumber(floorId);

    if (success) {
      showNotification(
        t("home.floor.buy_request_sent", { displayFloorNumber }),
        "success"
      );
    } else {
      showNotification(
        t("home.floor.buy_request_failed", { displayFloorNumber }),
        "error"
      );
    }
  };

  const handleUpgradeFloor = (floorId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (floorId === 1) {
      showNotification(t("home.floor.upgrade_unavailable"), "error");
      return;
    }
    handleOpenUpgradeModal(floorId);
  };

  // Функции для персонала
  const getStaffUpgradeCost = (
    floorId: number,
    staffType: "manager" | "guard"
  ): number => {
    const floor = store.safeUserFloorList.find((f) => f.floorId === floorId);
    if (!floor || !floor.staff) return 0;
    const staff = floor.staff.find(
      (s) => s.staffName.toLowerCase() === staffType
    );
    if (!staff?.upgradeStaff?.length) return 0;
    const next = staff.upgradeStaff.find(
      (u) => u.level === staff.staffLevel + 1
    );
    return next?.cost ?? staff.upgradeStaff[0].cost;
  };

  const getStaffCurrentLevel = (
    floorId: number,
    staffType: "manager" | "guard"
  ): number => {
    const floor = store.safeUserFloorList.find((f) => f.floorId === floorId);
    if (!floor || !floor.staff) return 0;
    const staff = floor.staff.find(
      (s) => s.staffName.toLowerCase() === staffType
    );
    return staff?.staffLevel ?? 0;
  };

  const handleStaffUpgrade = (
    staffType: "manager" | "guard",
    floorId: number
  ) => {
    playSound("staff.mp3");
    const floor = store.safeUserFloorList.find((f) => f.floorId === floorId);
    if (!floor) {
      showNotification(
        t("home.notifications.staff_not_found", { floorId }),
        "error"
      );
      return;
    }

    if (!Array.isArray(floor.staff) || floor.staff.length === 0) {
      showNotification(t("home.notifications.staff_data_not_loaded"), "error");
      console.warn(`Нет данных floor.staff для этажа ${floorId}`);
      return;
    }

    const staff = floor.staff.find(
      (s) => s.staffName.toLowerCase() === staffType
    );

    if (!staff) {
      showNotification(
        t("home.notifications.character_not_found", {
          character:
            staffType === "manager"
              ? t("home.upgrade_modal.manager_title")
              : t("home.upgrade_modal.guard_title"),
        }),
        "error"
      );
      console.warn(`Не найден ${staffType} на этаже ${floorId}`, floor.staff);
      return;
    }

    const staffId = staff.staffId;
    const currentLevel = staff.staffLevel ?? 0;
    const nextLevel = currentLevel + 1;

    console.debug("🟢 sendHireStaff:", {
      staffType,
      staffId,
      currentLevel,
      nextLevel,
      floorId,
    });

    const ok = store.sendHireStaff(
      staffId,
      nextLevel,
      undefined,
      floorId,
      staff.staffName
    );

    if (ok) {
      const displayFloorNumber = getDisplayFloorNumber(floorId);
      showNotification(
        t("home.notifications.staff_hired_or_upgraded", {
          character:
            staffType === "manager"
              ? t("home.upgrade_modal.manager_title")
              : t("home.upgrade_modal.guard_title"),
          status: currentLevel
            ? t("home.notifications.upgraded")
            : t("home.notifications.hired"),
          level: nextLevel,
          displayFloorNumber,
        }),
        "success"
      );
    } else {
      showNotification(t("home.notifications.staff_hire_error"), "error");
    }
  };

  // Функция для отображения уровней персонала с звездочками
  const renderStaffLevelWithStars = (
    currentLevel: number,
    labels: string[]
  ) => {
    return (
      <div className="flex gap-1 mt-2">
        {labels.map((label, index) => {
          const isActive = index < currentLevel;
          return (
            <div
              key={index}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded text-xs shantell font-bold ${
                isActive
                  ? "bg-white text-amber-800 border border-amber-300"
                  : "bg-gray-100 text-amber-800 border border-gray-300"
              }`}
            >
              <img
                src={`${store.imgUrl}${
                  isActive ? "icon_star.png" : "icon_star_empty.png"
                }`}
                alt={t("common.labels.star")}
                className="w-3 h-3 mb-1"
              />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Расчет накопленного дохода для этажа на основе claimProgress
  const calculateFloorBalance = (floor: any): number => {
    if (!floor || !floor.earningsPerHour) return 0;
    const totalSecondsInPeriod = 43200;
    const progressSeconds = (store.claimProgress / 100) * totalSecondsInPeriod;
    const progressHours = progressSeconds / 3600;
    const accumulatedIncome = Math.floor(floor.earningsPerHour * progressHours);
    return accumulatedIncome;
  };

  // Расчет общего дохода со всех этажей
  const calculateTotalIncome = (): number => {
    if (!store.safeUserFloorList) return 0;
    return store.safeUserFloorList.reduce((total, floor) => {
      if (floor.owned && floor.earningsPerHour && floor.floorId !== 1) {
        return total + floor.earningsPerHour;
      }
      return total;
    }, 0);
  };

  const totalIncome = calculateTotalIncome();

  // Проверка, активен ли бухгалтер
  const isAccountantActive = (): boolean => {
    const endDate = new Date(store.accountantEndTime);
    const now = new Date();
    return endDate.getTime() > now.getTime();
  };

  // Функции для получения данных улучшения этажа
  const getCorrectFloorUpgradeData = (floorId: number) => {
    let dataFloorId = floorId;
    if (floorId >= 1 && floorId <= 8) {
      dataFloorId = floorId;
    }
    return getFloorUpgradeData(dataFloorId);
  };

  const getCorrectUpgradeCost = (
    floorId: number,
    currentLevel: number
  ): number => {
    let dataFloorId = floorId;
    if (floorId >= 1 && floorId <= 8) {
      dataFloorId = floorId;
    }
    return getCurrentUpgradeCost(dataFloorId, currentLevel);
  };

  // Показываем загрузку пока данные не получены -----------------------------------------------------------
  // if (!store.areFloorsLoaded) {
  //   return (
  //     <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B] flex items-center justify-center">
  //       <div className="text-white text-xl shantell">Загрузка этажей...</div>
  //       <Footer />
  //       <WebSocketComponent />
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B]">
        {/* Кнопка звука */}
        <button
          onClick={toggleMusic}
          className="fixed scale-30 top-4 left-4 z-50 w-12 h-12 sm:w-14 sm:h-14 hover:scale-50 transition-transform"
          aria-label={isMusicPlaying ? t("home.sound_off") : t("home.sound_on")}
        >
          {isMusicPlaying ? (
            <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
              <circle
                cx="54"
                cy="54"
                r="52"
                fill="#FEDB9F"
                stroke="#0E0E0E"
                strokeWidth="4"
              />
              <path
                d="M32.1461 29.7167C25.0892 37.8855 24.898 51.2557 18.5327 45.7568C12.1673 40.2579 12.7279 29.178 19.7848 21.0092C26.8417 12.8404 37.7226 10.676 44.088 16.1749C50.4533 21.6738 41.0156 23.2123 32.1461 29.7167Z"
                fill="white"
              />
              <path
                d="M47.87 70.6202C46.95 69.8402 45.76 68.3002 44.55 68.0202C41.22 67.7802 30.66 69.9402 29.13 66.2902L29 43.3202C30.21 39.1702 42.24 41.8602 45.64 40.7802C51.41 36.1202 56.8 29.9902 62.6 25.4902C65.08 23.5702 67.27 23.1202 68.53 26.4802L68.33 83.4602C66.51 86.6002 64.62 85.3802 62.39 83.6502C57.5 79.8602 52.69 74.7102 47.87 70.6202Z"
                fill="black"
              />
              <path
                d="M76.57 33.7301C78.68 33.1001 81.65 35.4001 83.22 36.7101C92.29 44.2601 94.29 57.5701 87.8 67.4201C85.94 70.2401 79.02 78.0801 75.65 74.9001C72.47 71.9101 77.8 70.0101 79.56 68.5601C88.43 61.2501 88.12 47.8401 79.33 40.6001C77.71 39.2601 73.8 38.1301 74.95 35.4001C75.17 34.8801 76.02 33.8901 76.57 33.7301Z"
                fill="black"
              />
              <path
                d="M75.8691 64.2599V45.0799C77.1891 44.9299 78.5691 46.5799 79.2991 47.5699C81.9991 51.1899 82.4991 56.0199 80.4291 60.0499C79.6391 61.5899 77.6991 64.2399 75.8691 64.2699V64.2599Z"
                fill="black"
              />
            </svg>
          ) : (
            <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
              <circle
                cx="54"
                cy="54"
                r="52"
                fill="#FEDB9F"
                stroke="#0E0E0E"
                strokeWidth="4"
              />
              <path
                d="M32.1461 29.7167C25.0892 37.8855 24.898 51.2557 18.5327 45.7568C12.1673 40.2579 12.7279 29.178 19.7848 21.0092C26.8417 12.8404 37.7226 10.676 44.088 16.1749C50.4533 21.6738 41.0156 23.2123 32.1461 29.7167Z"
                fill="white"
              />
              <path
                d="M28.13 42.3304C30.42 39.5704 40.84 41.8904 44.32 40.7604L61.92 24.9004C64.54 22.6704 67.76 24.9004 67.62 28.1204C66.4 45.1904 69.19 64.4004 67.62 81.2204C67.29 84.7204 65.09 86.6404 61.92 84.4404L43.54 68.1004C39.98 68.1804 36.29 68.6504 32.72 68.3404C31.18 68.2104 28.8 67.9604 28 66.5304L28.14 42.3404L28.13 42.3304Z"
                fill="black"
              />
              <path
                d="M86.9302 46.8607C88.3902 45.5407 89.7602 44.7807 91.4902 46.3007C94.6702 49.1007 88.7802 52.6407 87.2002 54.6807C88.8402 56.8407 94.2002 59.7807 91.6902 62.8607C88.8502 66.3407 85.4302 60.2007 83.3102 58.9507C80.7202 60.1007 78.4802 65.5207 75.1902 63.4107C71.6402 61.1307 76.9902 56.6307 78.9302 55.2207L79.0402 54.3107C77.1302 52.4107 72.6702 49.5707 74.5802 46.5607C77.2702 42.3207 81.7502 50.4107 83.3102 50.4107C84.9002 49.9507 85.8602 47.8307 86.9302 46.8707V46.8607Z"
                fill="black"
              />
            </svg>
          )}
        </button>

        {/* Уведомление по событию */}
        {notification && (
          <div className="fixed inset-0 z-[99] bg-black/50 flex items-end justify-center transition-opacity duration-300">
            <div className="relative mb-4 sm:mb-16 flex items-end gap-2 sm:gap-4 max-w-5xl mx-auto px-4 w-full">
              <div className="flex-shrink-0">
                <img
                  src={`${store.imgUrl}img_chif_talk.png`}
                  alt={t("home.chef_alt")}
                  className="w-36 sm:w-48 object-contain"
                />
              </div>
              <div className="relative bg-[#FFF3E0] border-4 border-amber-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex-1 max-w-2xl">
                <p
                  className={`text-amber-800 shantell font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${
                    notification.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {notification.message}
                </p>
                <button
                  onClick={() => setNotification(null)}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-8 py-2 rounded-full font-bold shantell text-base tracking-wide transition transform hover:scale-105"
                >
                  {t("common.buttons.ok")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Случайное уведомление по таймеру */}
        {randomNotification && (
          <div className="fixed inset-0 z-[99] bg-black/50 flex items-end justify-center transition-opacity duration-300">
            <div className="relative mb-4 sm:mb-20 flex items-end gap-3 sm:gap-6 max-w-4xl mx-auto px-4 w-full">
              <div className="flex-shrink-0">
                <img
                  src={`${store.imgUrl}img_chif_talk.png`}
                  alt={t("home.chef_alt")}
                  className="w-36 sm:w-48 object-contain"
                />
              </div>
              <div className="relative bg-[#FFF3E0] border-4 border-amber-800 rounded-2xl shadow-2xl p-4 sm:p-5 flex-1 max-w-2xl">
                <p
                  className={`text-amber-800 shantell font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${
                    randomNotification.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {t(randomNotification.message)}
                </p>
                <button
                  onClick={() => setRandomNotification(null)}
                  className="mt-3 bg-amber-500 hover:bg-amber-600 text-white px-6 py-1.5 rounded-full font-bold shantell text-sm tracking-wide transition"
                >
                  {t("common.buttons.ok")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Основной контент */}
        <div className="relative min-h-[200vh]">
          {/* Фон здания */}
          <div className="h-screen">
            <div className="absolute inset-0 bottom-0 bg-[#FFBC6B]">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${store.imgUrl}bg_house_people.jpg')`,
                }}
              />
            </div>
          </div>

          {/* Этажи */}
          <div
            id="floors-block"
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[16%]"
          >
            <div className="flex flex-col items-center relative">
              {Array.from({ length: floors }, (_, index) => {
                const floorData = getFloorData(index);
                const isFilled = isFilledFloor(index);
                const isEmpty = isEmptyFloor(index);
                const floorId = getFloorIdByIndex(index);
                const floorName = getFloorNameByIndex(index);
                const canBuy = store.canBuyFloor(floorId);
                const floorCost = store.getFloorCost(floorId);
                const isBasementImage = floorId === -1;
                const isRoof = floorId === -2;
                const manager = floorData?.staff?.find(
                  (s) => s.staffName === "Manager"
                );
                const guard = floorData?.staff?.find(
                  (s) => s.staffName === "Guard"
                );

                return (
                  <div
                    key={index}
                    className="w-full flex justify-center relative"
                    style={{
                      marginBottom: index === floors - 1 ? "0" : "-2px",
                    }}
                  >
                    <img
                      src={`${store.imgUrl}${getFloorImage(index)}`}
                      alt={floorName}
                      className="w-full max-w-md object-contain"
                    />

                    {/* Кнопка покупки для пустых этажей */}
                    {isEmpty && !isBasementImage && !isRoof && (
                      <button
                        onClick={() => handleBuyFloor(index)}
                        disabled={!canBuy}
                        className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity ${
                          canBuy
                            ? "cursor-pointer hover:opacity-90"
                            : "cursor-not-allowed opacity-70"
                        }`}
                      >
                        <div className="flex items-center relative">
                          <img
                            src={`${store.imgUrl}b_blue_small.png`}
                            alt={t("home.open_new_floor")}
                            className="w-4/5"
                          />
                          <div className="absolute inset-0 flex items-center px-2 sm:px-4">
                            <div className="flex items-center gap-1">
                              <img
                                src={`${store.imgUrl}icon_dollar_coin.png`}
                                alt={t("common.labels.coin_icon")}
                                className="w-8 sm:w-10"
                              />
                              <span className="text-white text-sm sm:text-base shantell pr-4">
                                {floorCost}
                              </span>
                            </div>
                            <div className="text-blue-900 text-sm sm:text-md shantell font-bold whitespace-nowrap">
                              {t("home.buy_floor_button", {
                                floorName: floorName.toUpperCase(),
                              })}
                            </div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Блок с данными для заполненных этажей */}
                    {isFilled && floorData && !isBasementImage && !isRoof && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-3/4 max-w-80 h-[90%] -translate-y-[8px] -translate-x-[10px]"
                          >
                            <source
                              src={`${store.imgUrl}${getFloorVideo(floorData)}`}
                              type="video/mp4"
                            />
                            {t("home.your_browser_no_video")}
                          </video>
                        </div>

                        <div className="absolute -top-10 left-2/5 transform -translate-x-1/2 translate-y-1/2 z-40 w-4/5 max-w-xs">
                          <div className="flex items-center relative">
                            <img
                              src={`${store.imgUrl}img_block_mini.png`}
                              alt={t("common.labels.background")}
                              className="w-full h-auto object-contain"
                            />
                            <div className="absolute inset-0 flex items-center">
                              {/* Кнопка улучшения этажа */}
                              <button
                                onClick={(e) =>
                                  handleUpgradeFloor(floorData.floorId, e)
                                }
                                className="relative -translate-x-[24px] cursor-pointer hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={`${store.imgUrl}b_red_mini.png`}
                                  alt={t("common.labels.upgrade")}
                                  className="h-10 sm:h-12 w-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-0 px-1 sm:px-2">
                                  <img
                                    src={`${store.imgUrl}icon_arrow.png`}
                                    alt={t("common.labels.arrow")}
                                    className="w-4 h-4 mr-1"
                                  />
                                  <span className="text-white text-sm sm:text-md shantell font-bold">
                                    {getFloorNameByIndex(index)}
                                  </span>
                                </div>
                              </button>

                              {/* Звезды уровня этажа */}
                              <div className="flex items-center gap-0.5 -translate-x-[20px]">
                                {renderStars(floorData.level)}
                              </div>

                              {/* Менеджер */}
                              {manager && (
                                <div className="flex items-center gap-1 -translate-x-[6px]">
                                  <img
                                    src={`${store.imgUrl}${
                                      manager.owned
                                        ? "Manager_icon.png"
                                        : "Manager_icon_0.png"
                                    }`}
                                    alt={t("common.labels.manager")}
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                  />
                                  <img
                                    src={`${store.imgUrl}${
                                      manager.owned
                                        ? "icon_star.png"
                                        : "icon_star_empty.png"
                                    }`}
                                    alt={t("common.labels.star")}
                                    className="w-4 h-4 -translate-x-[2px]"
                                  />
                                  <span className="text-amber-800 text-xs sm:text-sm shantell font-bold -translate-x-[3px]">
                                    {manager.owned ? manager.staffLevel : 0}
                                  </span>
                                </div>
                              )}

                              {/* Охранник */}
                              {guard && (
                                <div className="flex items-center gap-1 ml-2 -translate-x-[4px]">
                                  <img
                                    src={`${store.imgUrl}${
                                      guard.owned
                                        ? "Guard_icon.png"
                                        : "Guard_icon_0.png"
                                    }`}
                                    alt={t("common.labels.guard")}
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                  />
                                  <img
                                    src={`${store.imgUrl}${
                                      guard.owned
                                        ? "icon_star.png"
                                        : "icon_star_empty.png"
                                    }`}
                                    alt={t("common.labels.star")}
                                    className="w-4 h-4 -translate-x-[2px]"
                                  />
                                  <span className="text-amber-800 text-xs sm:text-sm shantell -translate-x-[3px]">
                                    {guard.owned ? guard.staffLevel : 0}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Блок с данными для basement */}
                    {isFilled &&
                      floorData &&
                      floorData.floorId === 1 &&
                      !isRoof && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center -z-10">
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-3/4 max-w-80 h-[90%] -translate-y-[8px] -translate-x-[20px]"
                            >
                              <source
                                src={`${store.imgUrl}chif.mp4`}
                                type="video/mp4"
                              />
                              {t("home.your_browser_no_video")}
                            </video>
                          </div>

                          <div className="absolute -top-10 left-2/5 transform -translate-x-1/2 translate-y-1/2 z-40 w-4/5 max-w-xs">
                            <div className="flex items-center relative">
                              <img
                                src={`${store.imgUrl}img_block_mini.png`}
                                alt={t("common.labels.background")}
                                className="w-full h-auto object-contain"
                              />
                              <div className="absolute inset-0 flex items-center">
                                {/* Кнопка улучшения этажа для basement */}
                                <button
                                  onClick={(e) =>
                                    handleUpgradeFloor(floorData.floorId, e)
                                  }
                                  className="relative -translate-x-[24px] cursor-pointer hover:opacity-90 transition-opacity"
                                >
                                  <img
                                    src={`${store.imgUrl}b_red_mini.png`}
                                    alt={t("common.labels.upgrade")}
                                    className="h-10 sm:h-12 w-auto"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center gap-0 px-1 sm:px-2">
                                    <img
                                      src={`${store.imgUrl}icon_arrow.png`}
                                      alt={t("common.labels.arrow")}
                                      className="w-4 h-4 mr-1"
                                    />
                                    <span className="text-white text-sm sm:text-md shantell font-bold">
                                      {getFloorNameByIndex(index)}
                                    </span>
                                  </div>
                                </button>

                                {/* Звезды уровня этажа */}
                                <div className="flex items-center gap-0.5 -translate-x-[20px]">
                                  {renderStars(floorData.level)}
                                </div>

                                {/* Пицца для basement */}
                                <div className="flex items-center gap-1 -translate-x-[6px]">
                                  <img
                                    src={`${store.imgUrl}icon_pizza.png`}
                                    alt={t("common.labels.pizza")}
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                  />
                                  <span className="text-amber-800 text-xs sm:text-sm shantell font-bold -translate-x-[3px]">
                                    {Number(store.pizza ?? 0).toLocaleString()}
                                  </span>
                                </div>

                                {/* Менеджер для basement */}
                                {manager && (
                                  <div className="flex items-center gap-1 ml-2 -translate-x-[4px]">
                                    <img
                                      src={`${store.imgUrl}${
                                        manager.owned
                                          ? "Manager_icon.png"
                                          : "Manager_icon_0.png"
                                      }`}
                                      alt={t("common.labels.manager")}
                                      className="w-6 h-6 sm:w-8 sm:h-8"
                                    />
                                    <img
                                      src={`${store.imgUrl}${
                                        manager.owned
                                          ? "icon_star.png"
                                          : "icon_star_empty.png"
                                      }`}
                                      alt={t("common.labels.star")}
                                      className="w-4 h-4 -translate-x-[2px]"
                                    />
                                    <span className="text-amber-800 text-xs sm:text-sm shantell font-bold -translate-x-[3px]">
                                      {manager.owned ? manager.staffLevel : 0}
                                    </span>
                                  </div>
                                )}

                                {/* Охранник для basement */}
                                {guard && (
                                  <div className="flex items-center gap-1 ml-2 -translate-x-[4px]">
                                    <img
                                      src={`${store.imgUrl}${
                                        guard.owned
                                          ? "Guard_icon.png"
                                          : "Guard_icon_0.png"
                                      }`}
                                      alt={t("common.labels.guard")}
                                      className="w-6 h-6 sm:w-8 sm:h-8"
                                    />
                                    <img
                                      src={`${store.imgUrl}${
                                        guard.owned
                                          ? "icon_star.png"
                                          : "icon_star_empty.png"
                                      }`}
                                      alt={t("common.labels.star")}
                                      className="w-4 h-4 -translate-x-[2px]"
                                    />
                                    <span className="text-amber-800 text-xs sm:text-sm shantell -translate-x-[3px]">
                                      {guard.owned ? guard.staffLevel : 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                );
              })}

              {/* Анимированный лифт */}
              <div
                className="absolute bottom-2 right-[4px] z-20"
                style={{ height: "100%", width: "60px" }}
              >
                <img
                  src={`${store.imgUrl}${
                    liftHasPizza ? "lift_pizza.png" : "lift_empty.png"
                  }`}
                  alt={t("common.labels.lift")}
                  style={getLiftStyle()}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Верхние элементы */}
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt={t("bank.other.testo_alt")}
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}pizza_logo.png`}
            alt={t("ton_connect.alt.pizza_logo")}
            className="w-70 sm:w-100"
          />
        </div>

        {/* Нижний блок */}
        <div
          id="balances-block"
          className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg mx-auto z-30"
        >
          {/* Блок только с бухгалтером */}
          <div
            id="accountant-block"
            className="flex justify-center items-end px-4 mb-2"
          >
            {/* Accountant */}
            <div
              className="flex flex-col items-center relative"
              onClick={handleOpenAccountantModal}
            >
              <img
                src={`${store.imgUrl}Accountant.png`}
                alt={t("home.accountant_modal.title")}
                className="w-28 sm:w-24 sm:h-24 object-contain"
              />
              <div className="absolute -bottom-0 flex items-center text-xs text-white shantell">
                {formatTime(timeLeft.days)}:{formatTime(timeLeft.hours)}:
                {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </div>
            </div>
          </div>

          {/* Блоки балансов */}
          <div
            id="bank-link"
            className="absolute -bottom-5 left-6 flex-col justify-between items-center"
          >
            {/* PCOIN */}
            <div className="relative w-20 hover:opacity-90 transition-opacity mb-4">
              <img
                src={`${store.imgUrl}b_white.png`}
                alt={t("common.labels.pcoin")}
              />
              <div className="absolute inset-0 flex items-center ml-2 text-xs text-amber-800 shantell">
                <span>
                  <img
                    src={`${store.imgUrl}icon_dollar_coin.png`}
                    alt={t("common.labels.coin_icon")}
                    className="w-4"
                  />
                </span>
                {Number(store.pcoin) || 0}
                <Link to="/bank">
                  <span className="absolute -top-0.5 -right-14">
                    <img
                      src={`${store.imgUrl}b_red_plus.png`}
                      alt={t("common.labels.dollar_icon")}
                      className="w-1/2"
                    />
                  </span>
                </Link>
              </div>
            </div>

            {/* PDOLLAR */}
            <div className="relative w-20 hover:opacity-90 transition-opacity mr-7">
              <img
                src={`${store.imgUrl}b_white.png`}
                alt={t("common.labels.pdollar")}
              />
              <div className="absolute inset-0 flex items-center ml-1 text-xs text-amber-800 shantell">
                <span>
                  <img
                    src={`${store.imgUrl}icon_dollar.png`}
                    alt={t("common.labels.dollar_icon")}
                    className="w-6"
                  />
                </span>
                {Number(store.pdollar) || 0}
                <Link to="/bank">
                  <span className="absolute -top-0.5 -right-14">
                    <img
                      src={`${store.imgUrl}b_red_minus.png`}
                      alt={t("common.labels.dollar_icon")}
                      className="w-1/2"
                    />
                  </span>
                </Link>
                <span className="absolute top-8 text-xs text-amber-800 500 shantell whitespace-nowrap tracking-tight">
                  {t("home.income_per_hour", {
                    totalIncome: Number(totalIncome ?? 0).toLocaleString(),
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Центральная кнопка handleClaimDo */}
        <button
          id="claim-button"
          onClick={handleClaimDo}
          className="fixed bottom-25 left-1/2 w-30 lg:w-50 transform -translate-x-1/2 z-50 hover:opacity-90 transition-opacity active:scale-95"
        >
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center text-sm md:text-xl text-blue-900 shantell">
            {store.claimProgress.toFixed(1)}% Забрать
          </div>

          <img
            src={`${store.imgUrl}b_zabrat3.png`}
            alt={t("home.claim_button_alt")}
          />
        </button>

        {/* Модальное окно улучшения этажа */}
        {isModalOpen && selectedFloor && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Заголовок над модальным окном */}
              <div className="relative mb-2 flex justify-center translate-y-[8px]">
                <div className="w-1/2 relative">
                  <img
                    src={`${store.imgUrl}img_window_header.png`}
                    alt={t("common.labels.header")}
                    className="w-full h-auto "
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-800 font-bold text-lg shantell">
                      {getDisplayFloorNumber(selectedFloor.floorId)}
                    </span>
                  </div>
                </div>
                {/* Кнопка закрытия */}
                <button
                  onClick={handleCloseModal}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-10"
                >
                  <img
                    src={`${store.imgUrl}b_close.png`}
                    alt={t("common.buttons.close")}
                    className="w-full h-full"
                  />
                </button>
              </div>

              {/* Основное окно */}
              <div
                className="bg-cover bg-center rounded-lg shadow-2xl min-h-[600px]"
                style={{
                  backgroundImage: `url('${store.imgUrl}img_window_big.png')`,
                }}
              >
                {/* Контент */}
                <div className="p-4 space-y-2 pt-4">
                  {/* Информация об этаже */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-800 shantell">
                        {t("home.upgrade_modal.income_label")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-800 shantell">
                          {selectedFloor.earningsPerHour || 1000}
                        </span>
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt={t("common.labels.dollar_icon")}
                          className="w-6 h-4"
                        />
                        <span className="text-xs text-amber-800 shantell">
                          {t("home.upgrade_modal.per_hour")}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-800 shantell">
                        {t("home.upgrade_modal.balance_label")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-800 shantell">
                          {calculateFloorBalance(selectedFloor)}
                        </span>
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt={t("common.labels.dollar_icon")}
                          className="w-6 h-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Звезды с бонусами */}
                  <div className="flex justify-between items-center">
                    {[1, 2, 3, 4, 5].map((star, index) => {
                      const isActive = index < (selectedFloor.level ?? 0);
                      const floorUpgrades = getCorrectFloorUpgradeData(
                        selectedFloor.floorId
                      );
                      const bonus = floorUpgrades[index]?.incomeBonus || 0;

                      return (
                        <div key={star} className="flex flex-col items-center">
                          <img
                            src={`${store.imgUrl}${
                              isActive ? "icon_star.png" : "icon_star_empty.png"
                            }`}
                            alt={t("common.labels.star")}
                            className="w-8 h-8 mb-1"
                          />
                          <div className="flex items-center gap-0 bg-white px-2 py-1 rounded border border-amber-800">
                            <span className="text-xs font-bold text-amber-800 shantell">
                              +{bonus}
                            </span>
                            <img
                              src={`${store.imgUrl}icon_dollar.png`}
                              alt={t("common.labels.dollar_icon")}
                              className="w-5"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Кнопка улучшения этажа */}
                  {(selectedFloor.level ?? 0) < 5 && (
                    <button
                      onClick={handleUpgradeFromModal}
                      disabled={!store.canUpgradeFloor(selectedFloor.floorId)}
                      className={`w-full relative py-3 rounded-lg flex items-center justify-center gap-3 ${
                        store.canUpgradeFloor(selectedFloor.floorId)
                          ? "hover:opacity-90 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <img
                        src={`${store.imgUrl}b_red_round.png`}
                        alt={t("common.labels.button_background")}
                        className="absolute inset-x-1 w-full"
                      />
                      <img
                        src={`${store.imgUrl}icon_arrow.png`}
                        alt={t("common.labels.arrow")}
                        className="w-5 h-5 relative z-10"
                      />
                      <span className="text-white font-bold shantell relative z-10">
                        {t("home.upgrade_modal.upgrade_to_level", {
                          level: (selectedFloor.level ?? 0) + 1,
                        })}
                      </span>
                      <div className="flex items-center gap-1 relative z-10">
                        <img
                          src={`${store.imgUrl}icon_dollar_coin.png`}
                          alt={t("common.labels.coin_icon")}
                          className="w-5 h-5"
                        />
                        <span className="text-white font-bold shantell">
                          {getCorrectUpgradeCost(
                            selectedFloor.floorId,
                            selectedFloor.level ?? 0
                          )}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Персонал */}
                  <div className="mt-2">
                    <h3 className="text-lg font-bold mb-2 text-amber-800 shantell text-center">
                      {t("home.upgrade_modal.staff_title")}
                    </h3>

                    {/* Менеджер */}
                    <div className="bg-white rounded-lg p-2 mb-4 border border-amber-800 shadow-sm">
                      <div className="flex items-start gap-0 mb-3">
                        <img
                          src={`${store.imgUrl}Manager_small.png`}
                          alt={t("home.upgrade_modal.manager_title")}
                          className="w-18 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 shantell">
                            {t("home.upgrade_modal.manager_title")}
                          </h4>
                          <p className="text-xs text-amber-600 shantell mb-2">
                            {t("home.upgrade_modal.manager_description")}
                          </p>
                          {renderStaffLevelWithStars(
                            getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "manager"
                            ),
                            ["+1%", "+2%", "+3%", "+4%", "+5%"]
                          )}
                        </div>
                      </div>

                      {getStaffCurrentLevel(selectedFloor.floorId, "manager") <
                        5 && (
                        <button
                          onClick={() =>
                            handleStaffUpgrade("manager", selectedFloor.floorId)
                          }
                          disabled={
                            getStaffUpgradeCost(
                              selectedFloor.floorId,
                              "manager"
                            ) > store.pcoin
                          }
                          className={`w-full relative py-2 rounded-lg flex items-center justify-between px-4 ${
                            getStaffUpgradeCost(
                              selectedFloor.floorId,
                              "manager"
                            ) <= store.pcoin
                              ? "hover:opacity-90 cursor-pointer"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <img
                            src={`${store.imgUrl}b_red_round.png`}
                            alt={t("common.labels.button_background")}
                            className="absolute inset-0 w-full h-full"
                          />
                          <span className="text-white font-bold text-sm shantell relative z-10">
                            {getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "manager"
                            ) === 0
                              ? t("home.upgrade_modal.hire_button")
                              : t(
                                  "home.upgrade_modal.upgrade_to_level_button",
                                  {
                                    level:
                                      getStaffCurrentLevel(
                                        selectedFloor.floorId,
                                        "manager"
                                      ) + 1,
                                  }
                                )}
                          </span>
                          <div className="flex items-center gap-1 relative z-10">
                            <img
                              src={`${store.imgUrl}icon_dollar_coin.png`}
                              alt={t("common.labels.coin_icon")}
                              className="w-4 h-4"
                            />
                            <span className="text-white font-bold text-sm shantell">
                              {getStaffUpgradeCost(
                                selectedFloor.floorId,
                                "manager"
                              )}
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Охранник */}
                    <div className="bg-white rounded-lg p-2 border border-amber-800 shadow-sm">
                      <div className="flex items-start gap-0 mb-3">
                        <img
                          src={`${store.imgUrl}Guard_small.png`}
                          alt={t("home.upgrade_modal.guard_title")}
                          className="w-18 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 shantell">
                            {t("home.upgrade_modal.guard_title")}
                          </h4>
                          <p className="text-xs text-amber-600 shantell mb-2">
                            {t("home.upgrade_modal.guard_description")}
                          </p>
                          {renderStaffLevelWithStars(
                            getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "guard"
                            ),
                            ["-4%", "-3%", "-2%", "-1%", "0%"]
                          )}
                        </div>
                      </div>

                      {getStaffCurrentLevel(selectedFloor.floorId, "guard") <
                        5 && (
                        <button
                          onClick={() =>
                            handleStaffUpgrade("guard", selectedFloor.floorId)
                          }
                          disabled={
                            getStaffUpgradeCost(
                              selectedFloor.floorId,
                              "guard"
                            ) > store.pcoin
                          }
                          className={`w-full relative py-2 rounded-lg flex items-center justify-between px-4 ${
                            getStaffUpgradeCost(
                              selectedFloor.floorId,
                              "guard"
                            ) <= store.pcoin
                              ? "hover:opacity-90 cursor-pointer"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <img
                            src={`${store.imgUrl}b_red_round.png`}
                            alt={t("common.labels.button_background")}
                            className="absolute inset-0 w-full h-full"
                          />
                          <span className="text-white font-bold text-sm shantell relative z-10">
                            {getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "guard"
                            ) === 0
                              ? t("home.upgrade_modal.hire_button")
                              : t(
                                  "home.upgrade_modal.upgrade_to_level_button",
                                  {
                                    level:
                                      getStaffCurrentLevel(
                                        selectedFloor.floorId,
                                        "guard"
                                      ) + 1,
                                  }
                                )}
                          </span>
                          <div className="flex items-center gap-1 relative z-10">
                            <img
                              src={`${store.imgUrl}icon_dollar_coin.png`}
                              alt={t("common.labels.coin_icon")}
                              className="w-4 h-4"
                            />
                            <span className="text-white font-bold text-sm shantell">
                              {getStaffUpgradeCost(
                                selectedFloor.floorId,
                                "guard"
                              )}
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модалка бухгалтера */}
        {staffModal === "accountant" && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseStaffModal}
          >
            <div
              className="relative w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Заголовок над модальным окном */}
              <div className="relative mb-2 flex justify-center">
                <div className="w-1/2 relative translate-y-[8px]">
                  <img
                    src={`${store.imgUrl}img_window_header.png`}
                    alt={t("common.labels.header")}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-800 text-lg shantell">
                      {t("home.accountant_modal.title")}
                    </span>
                  </div>
                </div>
                {/* Кнопка закрытия */}
                <button
                  onClick={handleCloseStaffModal}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-10"
                >
                  <img
                    src={`${store.imgUrl}b_close.png`}
                    alt={t("common.buttons.close")}
                    className="w-full h-full"
                  />
                </button>
              </div>

              {/* Основное окно */}
              <div
                className="bg-cover bg-center rounded-lg shadow-2xl min-h-[500px]"
                style={{
                  backgroundImage: `url('${store.imgUrl}img_window_big.png')`,
                }}
              >
                {/* Контент */}
                <div className="p-6 space-y-4 pt-8 flex flex-col items-center text-center">
                  {/* изображение */}
                  <img
                    src={`${store.imgUrl}Accountant_big.png`}
                    alt={t("home.accountant_modal.title")}
                    className="w-3/4 mb-4 object-contain"
                  />

                  {/* таймер */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-amber-800 shantell mb-2">
                      {formatTime(timeLeft.days)}:{formatTime(timeLeft.hours)}:
                      {formatTime(timeLeft.minutes)}:
                      {formatTime(timeLeft.seconds)}
                    </div>
                    <div className="text-sm text-amber-600 shantell">
                      {t("home.accountant_modal.time_left")}
                    </div>
                  </div>

                  {/* описание */}
                  <p className="text-lg text-amber-800 shantell leading-tight mb-6">
                    {t("home.accountant_modal.description")}
                  </p>

                  {/* варианты подписки - показываем только если бухгалтер не активен */}
                  {!isAccountantActive() && (
                    <div className="flex justify-between gap-2 mb-6 w-full">
                      {store.userStaff?.accountantLevel?.map(
                        (opt: {
                          id: number;
                          cost: number;
                          duration?: number;
                          durationDay?: number;
                        }) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              handleHireAccountant(
                                opt.duration ?? opt.durationDay
                              )
                            }
                            className="flex-1 relative hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={`${store.imgUrl}b_white.png`}
                              alt={t(
                                "home.accountant_modal.subscription_days",
                                {
                                  days: opt.duration ?? opt.durationDay,
                                }
                              )}
                              className="w-full scale-y-110"
                            />
                            <span className="absolute inset-0 flex flex-col items-center justify-center text-amber-800 shantell text-sm">
                              <span>
                                {t("home.accountant_modal.subscription_days", {
                                  days: opt.duration ?? opt.durationDay,
                                })}
                              </span>
                              <span className="text-xs text-blue-800 font-bold">
                                {opt.cost}
                                {t("common.labels.pcoin")}
                              </span>
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Сообщение если бухгалтер активен */}
                  {isAccountantActive() && (
                    <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6 w-full">
                      <p className="text-green-800 shantell text-sm">
                        {t("home.accountant_modal.active_message")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Обучающая подсказка — показывается один раз */}
      {showGuide && (
        <GuideOverlay
          steps={introGuideSteps}
          onFinish={() => {
            setShowGuide(false);
            localStorage.setItem("main_tutorial_done", "1");
          }}
        />
      )}

      {/* Уведомление NY_box */}
      {showNYBoxNotification && (
        <button
          onClick={() => setShowNYBoxModal(true)}
          className="fixed bottom-48 -right-68 z-40 animate-bounce hover:scale-105 transition-transform"
          style={{ animationDuration: "2s" }}
        >
          <img
            src={`${store.imgUrl}NY_box.png`}
            alt="NY Box"
            className="w-1/3 object-contain"
          />
        </button>
      )}

      {/* Модальное окно NY_box */}
      {showNYBoxModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-3">
          <div
            className="relative w-full max-w-md mx-auto bg-cover bg-center rounded-2xl"
            style={{
              backgroundImage: `url('${store.imgUrl}img_window_big.png')`,
            }}
          >
            {/* Заголовок */}
            <div className="relative -top-4 flex justify-center">
              <div className="w-1/2 relative">
                <img
                  src={`${store.imgUrl}img_window_header.png`}
                  alt="Header"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-800 font-bold text-lg shantell">
                    NY Box
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={() => {
                setShowNYBoxModal(false);
                setJettonUiMessage(null);
                setJettonUiType(null);
                setIsJettonChecking(false);
              }}
              className="absolute -top-8 -right-2 w-8 h-8 hover:scale-110 transition-transform z-10"
            >
              <img
                src={`${store.imgUrl}b_close.png`}
                alt="Закрыть"
                className="w-full h-full"
              />
            </button>

            {/* Контент */}
            <div className="p-3 text-center">
              <div className="-mt-10">
                <img
                  src={`${store.imgUrl}NY_box_open.png`}
                  alt="NY Box Open"
                  className="w-40 mx-auto"
                />
              </div>

              {/* Основной текст и кнопки - скрываем при положительном результате */}
              {!jettonUiMessage || jettonUiType === "error" ? (
                <>
                  <p className="text-md text-amber-800 shantell mb-1">
                    Для получения данного бокса необходимо сделать депозит от
                    10$ у наших партнеров!
                  </p>

                  {/* Кнопки */}
                  <div className="space-y-3 mb-1">
                    <button
                      onClick={() => {
                        const ok = store.fixClickJetton();
                        if (!ok) {
                          showNotification(
                            "Не удалось зафиксировать переход (нет WS/сессии)",
                            "error"
                          );
                          return;
                        }

                        // открываем партнёра
                        window.open(JETTON_DEPOSIT_URL, "_blank");
                      }}
                      className="relative w-full py-1 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_green.png`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <span className="relative z-10 text-white font-bold shantell text-lg">
                        Сделать депозит
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (isJettonChecking) return;

                        setJettonUiMessage(null);
                        setJettonUiType(null);

                        setIsJettonChecking(true);
                        const ok = store.checkJettonPayment();

                        if (!ok) {
                          setIsJettonChecking(false);
                          setJettonUiType("error");
                          setJettonUiMessage(
                            "Не удалось отправить проверку (нет WS/сессии)."
                          );
                        }
                      }}
                      className="relative w-full py-1 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_red_round.png`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <span className="relative z-10 text-white font-bold shantell text-lg">
                        {isJettonChecking ? "Проверяем..." : "Проверить"}
                      </span>
                    </button>
                  </div>
                </>
              ) : null}

              {/* Результат проверки депозита - ОШИБКА */}
              {jettonUiMessage && jettonUiType === "error" && (
                <div className="mt-2 mb-2">
                  <div className="bg-red-100/70 border-2 border-red-400 rounded-xl p-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-red-800 font-bold shantell text-lg">
                        Депозит не найден
                      </span>
                    </div>
                    <p className="text-red-700 shantell text-sm whitespace-pre-wrap">
                      {jettonUiMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Результат проверки депозита - УСПЕХ */}
              {jettonUiMessage && jettonUiType === "success" && (
                <div className="mt-1 mb-1">
                  {/* Проигрываем звук win.mp3 при успехе */}
                  {(() => {
                    useEffect(() => {
                      if (jettonUiType === "success") {
                        const audio = new Audio(`${store.imgUrl}win.mp3`);
                        audio
                          .play()
                          .catch((e) =>
                            console.log("Ошибка воспроизведения звука:", e)
                          );
                      }
                    }, [jettonUiType]);
                    return null;
                  })()}

                  {/* Заголовок успеха */}
                  <div className="bg-green-100/70 border-2 border-green-400 rounded-xl p-1 mb-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-green-800 font-bold shantell text-xl">
                        Успешно!
                      </span>
                    </div>
                    <p className="text-green-700 shantell text-lg font-bold">
                      Депозит подтверждён!
                    </p>
                  </div>

                  {/* Сетка призов с картинками */}
                  <div className="grid grid-cols-2 gap-3 mb-1">
                    {store.jettonLastResult?.pcoin && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_dollar_coin.png`}
                          alt="P-Coin"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.pcoin}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            P-Coin
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.pizza && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-1 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_pizza.png`}
                          alt="Pizza"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.pizza}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            Pizza
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.pdollar && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt="P-Dollar"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.pdollar}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            P-Dollar
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.commonSlice && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_pizza_common.png`}
                          alt="Common"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.commonSlice}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            Common
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.unCommonSlice && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_pizza_uncommon.png`}
                          alt="Uncommon"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.unCommonSlice}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            Uncommon
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.rareSlice && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_pizza_rare.png`}
                          alt="Rare"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.rareSlice}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            Rare
                          </div>
                        </div>
                      </div>
                    )}

                    {store.jettonLastResult?.mystikalSlice && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
                        <img
                          src={`${store.imgUrl}icon_pizza_mystical.png`}
                          alt="Mystical"
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="text-amber-800 font-bold shantell">
                            +{store.jettonLastResult.mystikalSlice}
                          </div>
                          <div className="text-amber-600 text-sm shantell">
                            Mystical
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowNYBoxModal(false);
                      setJettonUiMessage(null);
                      setJettonUiType(null);
                    }}
                    className="relative w-full py-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={`${store.imgUrl}b_orange_round.png`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <span className="relative z-10 text-white font-bold shantell text-lg">
                      Забрать награды
                    </span>
                  </button>
                </div>
              )}

              {/* Таблица призов - показываем только если нет результатов проверки */}
              {(!jettonUiMessage || jettonUiType === "error") && (
                <div className="bg-white/50 rounded-xl p-4 border border-amber-300">
                  <div className="text-center mb-3">
                    <span className="text-amber-800 font-bold shantell text-lg">
                      Возможные призы:
                    </span>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="P-coin"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            P-coin от 5.000-7.000
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_pizza.png`}
                            alt="Pizza"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Pizza от 20.000-28.000
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_dollar.png`}
                            alt="P-Dollar"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            P-dollar от 50.000-80.000
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_pizza_common.png`}
                            alt="Common"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Common от 1-7
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_pizza_uncommon.png`}
                            alt="Uncommon"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Uncommon от 1-5
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_pizza_rare.png`}
                            alt="Rare"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Rare от 1-3
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}icon_pizza_mystical.png`}
                            alt="Mystical"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Mystical 1
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left">
                          <img
                            src={`${store.imgUrl}law.jpg`}
                            alt="Mystical"
                            className="w-6"
                          />
                        </td>
                        <td className="text-right">
                          <span className="text-amber-800 shantell font-bold">
                            Адвокат
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Уведомление с пиццей */}
      {showPizzaNotification && (
        <button
          onClick={handlePizzaNotificationClick}
          className="fixed bottom-20 -right-68 z-40 hover:scale-105 transition-transform"
          style={{ animationDuration: "2s" }}
        >
          <img
            src={`${store.imgUrl}img_pizza2000.png`}
            alt={t("home.lootbox_modal.pizza_notification_alt")}
            className="w-1/3 object-contain"
          />
        </button>
      )}

      {/* Модальное окно лутбокса */}
      {showPrizeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div
            className="relative w-full max-w-md mx-auto bg-cover bg-center rounded-2xl"
            style={{
              backgroundImage: `url('${store.imgUrl}img_window_big.png')`,
            }}
          >
            {/* Заголовок */}
            <div className="relative -top-4 flex justify-center">
              <div className="w-1/2 relative">
                <img
                  src={`${store.imgUrl}img_window_header.png`}
                  alt={t("common.labels.header")}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-800 font-bold text-lg shantell">
                    {showChancesInfo
                      ? t("home.lootbox_modal.title_about")
                      : prizeModalStage === "intro"
                      ? t("home.lootbox_modal.title")
                      : t("home.lootbox_modal.title_congrats")}
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={handleClosePrizeModal}
              className="absolute -top-8 -right-2 w-8 h-8 hover:scale-110 transition-transform z-10"
            >
              <img
                src={`${store.imgUrl}b_close.png`}
                alt={t("common.buttons.close")}
                className="w-full h-full"
              />
            </button>

            {/* Кнопка информации о шансах */}
            <button
              onClick={() => setShowChancesInfo(!showChancesInfo)}
              className="absolute top-2 left-4 w-8 h-8 hover:scale-110 transition-transform z-10"
            >
              <img
                src={`${store.imgUrl}qwe.png`}
                alt={t("common.labels.info")}
                className="w-full h-full"
              />
            </button>

            {/* Контент */}
            <div className="p-4 text-center">
              {showChancesInfo ? (
                /* Экран с информацией о шансах */
                <>
                  <div className="mb-1">
                    <h3 className="text-xl font-bold text-amber-800 shantell mb-4">
                      {t("home.lootbox_modal.info_title")}
                    </h3>

                    <div className="text-left space-y-3 mb-6">
                      <p className="text-sm text-amber-700 shantell">
                        {t("home.lootbox_modal.info_p1")}
                      </p>
                      <p className="text-sm text-amber-700 shantell">
                        {t("home.lootbox_modal.info_p2")}
                      </p>
                    </div>

                    <div className="bg-white/50 rounded-xl p-2 border border-amber-300 mb-6">
                      <div className="text-center mb-4">
                        <div className="text-xl font-bold text-amber-800 shantell mb-2">
                          {t("home.lootbox_modal.box_price")}
                        </div>
                        <div className="text-sm font-bold text-amber-800 shantell">
                          {t("home.lootbox_modal.probabilities_title")}
                        </div>
                      </div>

                      <div className="space-y-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-700 shantell">
                            1-9 pcoin
                          </span>
                          <span className="text-lg font-bold text-amber-800 shantell">
                            {t("home.lootbox_modal.probabilities.1-9")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-700 shantell">
                            10-19 pcoin
                          </span>
                          <span className="text-lg font-bold text-amber-800 shantell">
                            {t("home.lootbox_modal.probabilities.10-19")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-700 shantell">
                            20-29 pcoin
                          </span>
                          <span className="text-lg font-bold text-amber-800 shantell">
                            {t("home.lootbox_modal.probabilities.20-29")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-700 shantell">
                            30-39 pcoin
                          </span>
                          <span className="text-lg font-bold text-amber-800 shantell">
                            {t("home.lootbox_modal.probabilities.30-39")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-700 shantell">
                            40-50 pcoin
                          </span>
                          <span className="text-lg font-bold text-amber-800 shantell">
                            {t("home.lootbox_modal.probabilities.40-50")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowChancesInfo(false)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-1 rounded-full font-bold shantell text-lg tracking-wide transition transform hover:scale-105"
                  >
                    {t("common.buttons.ok")}
                  </button>
                </>
              ) : prizeModalStage === "intro" ? (
                /* Экран с предложением купить лутбокс */
                <>
                  <div className="mb-2">
                    <img
                      src={`${store.imgUrl}img_pizza2000.png`}
                      alt="Lootbox"
                      className="w-2/3 mx-auto"
                    />
                    <h3
                      className="text-xl font-bold text-amber-800 shantell mb-4"
                      dangerouslySetInnerHTML={{
                        __html: t("home.lootbox_modal.open_for"),
                      }}
                    ></h3>
                    <p className="text-md text-amber-700 shantell mb-2">
                      {t("home.lootbox_modal.guaranteed_pcoin")}
                    </p>
                  </div>

                  <div className="mb-8 bg-white/50 rounded-xl p-4 border border-amber-300">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <img
                        src={`${store.imgUrl}icon_pizza.png`}
                        alt="Pizza"
                        className="w-8 h-8"
                      />
                      <span className="text-3xl font-bold text-amber-800 shantell">
                        2000
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 shantell">
                      {t("home.lootbox_modal.your_balance", {
                        balance: store.pizza.toLocaleString(),
                      })}
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleClosePrizeModal}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-full font-bold shantell text-lg transition transform hover:scale-105"
                    >
                      {t("common.buttons.close")}
                    </button>
                    <button
                      onClick={handleBuyLootbox}
                      disabled={store.pizza < 2000}
                      className={`px-6 py-3 rounded-full font-bold shantell text-lg transition transform hover:scale-105 ${
                        store.pizza >= 2000
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {t("common.buttons.buy")}
                    </button>
                  </div>
                </>
              ) : (
                /* Экран с результатами */
                <>
                  <div className="mb-6">
                    <img
                      src={`${store.imgUrl}img_pizza2000.png`}
                      alt="Prize"
                      className="w-32 h-32 mx-auto mb-4"
                    />
                    <h3 className="text-2xl font-bold text-amber-800 shantell mb-2">
                      {t("home.lootbox_modal.prize_title")}
                    </h3>
                    <p
                      className="text-lg text-amber-700 shantell"
                      dangerouslySetInnerHTML={{
                        __html: t("home.lootbox_modal.prize_subtitle", {
                          pcoins: wonPcoins,
                        }),
                      }}
                    ></p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center gap-3 bg-white/50 rounded-xl p-3">
                      <img
                        src={`${store.imgUrl}icon_dollar_coin.png`}
                        alt={t("common.labels.coin_icon")}
                        className="w-10 h-10"
                      />
                      <div className="text-left">
                        <p className="text-lg font-bold text-amber-800">
                          {t("home.lootbox_modal.prize_pcoin_label", {
                            pcoins: wonPcoins,
                          })}
                        </p>
                        <p className="text-sm text-amber-600">
                          {t("home.lootbox_modal.prize_pcoin_description")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClosePrizeModal}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold shantell text-lg tracking-wide transition transform hover:scale-105"
                  >
                    {t("common.buttons.claim_prizes")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
});

export default Home;
