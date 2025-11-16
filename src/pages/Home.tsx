import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import { Link } from "react-router-dom";
import FooterHome from "../components/FooterHome";

const Home = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [staffModal, setStaffModal] = useState<"accountant" | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const floors = 11;

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

  // Запрос данных при монтировании
  useEffect(() => {
    if (!store.areFloorsLoaded) {
      console.log("Requesting floors data on component mount...");
      store.requestFloorsData();
    }
  }, [store.areFloorsLoaded]);

  // Автоскролл при загрузке
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
  }, []);

  // Показ уведомления
  const showNotification = (
    message: string,
    type: "error" | "success" = "error"
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleClaimDo = () => {
    if (store.sendClaimDo(0)) {
      showNotification("💰 Доход собирается...", "success");
    } else {
      showNotification("❌ Ошибка при сборе дохода", "error");
    }
  };

  // Персонал
  const handleOpenAccountantModal = () => setStaffModal("accountant");
  const handleCloseStaffModal = () => setStaffModal(null);

  const handleHireStaff = (option?: number) => {
    if (!staffModal) return;

    const ok = store.sendHireStaff(3, undefined, option ?? 7, 0);
    if (ok) showNotification("Бухгалтер нанят!", "success");
    else showNotification("Ошибка при найме бухгалтера", "error");

    handleCloseStaffModal();
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
        alt={i < level ? "Star" : "Empty star"}
        className="w-4 h-4"
      />
    ));
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
    showNotification(
      `🚀 Отправляем запрос на улучшение этажа ${selectedFloor.floorId}...`,
      "success"
    );
    const success = store.upgradeFloor(selectedFloor.floorId);
    if (success) {
      setTimeout(() => {
        showNotification(
          `✅ Этаж ${selectedFloor.floorId} улучшен до уровня ${
            (selectedFloor.level ?? 0) + 1
          }!`,
          "success"
        );
      }, 800);
    } else {
      setTimeout(() => {
        showNotification(
          `❌ Не удалось улучшить этаж ${selectedFloor.floorId}. Недостаточно средств!`,
          "error"
        );
      }, 800);
    }
    handleCloseModal();
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

  const getFloorNameByIndex = (index: number): string => {
    const floorId = getFloorIdByIndex(index);
    if (index === 0) return "Крыша";
    if (floorId === -1) return "Basement";
    if (floorId === 1) return "Basement";
    return `${floorId} этаж`;
  };

  const handleBuyFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    const success = store.buyNewFloor(floorId);

    if (success) {
      showNotification(
        `🏗 Запрос на покупку этажа ${floorId} отправлен!`,
        "success"
      );
    } else {
      showNotification(
        `❌ Не удалось купить этаж ${floorId}. Проверь баланс или соединение.`,
        "error"
      );
    }
  };

  const handleUpgradeFloor = (floorId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (floorId === 1) {
      showNotification(
        "Basement сейчас нельзя улучшить — ждём звёздный апгрейд!",
        "error"
      );
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
    // стоимость следующего уровня
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
    // Находим этаж в списке пользователя
    const floor = store.safeUserFloorList.find((f) => f.floorId === floorId);
    if (!floor) {
      showNotification(`Этаж ${floorId} не найден`, "error");
      return;
    }

    // Проверяем, есть ли данные по персоналу на этом этаже
    if (!Array.isArray(floor.staff) || floor.staff.length === 0) {
      showNotification("Персонал для этого этажа ещё не загружен", "error");
      console.warn(`⚠️ Нет данных floor.staff для этажа ${floorId}`);
      return;
    }

    // Ищем нужного персонажа по роли (Manager / Guard)
    const staff = floor.staff.find(
      (s) => s.staffName.toLowerCase() === staffType
    );

    if (!staff) {
      showNotification(
        `Не найден персонаж ${
          staffType === "manager" ? "Менеджер" : "Охранник"
        }`,
        "error"
      );
      console.warn(
        `⚠️ Не найден ${staffType} на этаже ${floorId}`,
        floor.staff
      );
      return;
    }

    // Берём его реальные данные
    const staffId = staff.staffId; // ✅ Правильный id из spr_staff / Redis
    const currentLevel = staff.staffLevel ?? 0; // Текущий уровень
    const nextLevel = currentLevel + 1; // К следующему апгрейду

    console.debug("🟢 sendHireStaff:", {
      staffType,
      staffId,
      currentLevel,
      nextLevel,
      floorId,
    });

    // Отправляем запрос на сервер
    const ok = store.sendHireStaff(staffId, nextLevel, undefined, floorId);

    if (ok) {
      showNotification(
        `👔 ${staffType === "manager" ? "Менеджер" : "Охранник"} ${
          currentLevel ? "улучшен" : "нанят"
        } (уровень ${nextLevel}) на этаже ${floorId}`,
        "success"
      );
    } else {
      showNotification("❌ Ошибка при покупке/апгрейде персонала", "error");
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
          // Уровень считается активным только если index < currentLevel
          const isActive = index < currentLevel;

          return (
            <div
              key={index}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded text-xs shantell font-bold ${
                isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-amber-800"
              }`}
            >
              {/* Звездочка над процентом */}
              <img
                src={`${store.imgUrl}${
                  isActive ? "icon_star.png" : "icon_star_empty.png"
                }`}
                alt="Star"
                className="w-3 h-3 mb-1"
              />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Показываем загрузку пока данные не получены -----------------------------------------------------------
  if (!store.areFloorsLoaded) {
    return (
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B] flex items-center justify-center">
        <div className="text-white text-xl shantell">Загрузка этажей...</div>
        <Footer />
        <WebSocketComponent />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B]">
        {/* Кнопка звука */}
        <button
          onClick={toggleMusic}
          className="fixed scale-30 top-4 left-4 z-50 w-12 h-12 sm:w-14 sm:h-14 hover:scale-50 transition-transform"
          aria-label={isMusicPlaying ? "Выключить звук" : "Включить звук"}
        >
          {/* SVG иконки звука */}
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

        {/* Уведомление */}
        {notification && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
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
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[16%]">
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

                // Данные персонала с сервера
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
                      alt={`Этаж ${floorName}`}
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
                            alt="Open new floor"
                            className="w-4/5"
                          />
                          <div className="absolute inset-0 flex items-center px-2 sm:px-4">
                            <div className="flex items-center gap-1">
                              <img
                                src={`${store.imgUrl}icon_dollar_coin.png`}
                                alt="Coin"
                                className="w-8 sm:w-10"
                              />
                              <span className="text-white text-sm sm:text-base shantell pr-4">
                                {floorCost}
                              </span>
                            </div>
                            <div className="text-blue-900 text-sm sm:text-md shantell font-bold whitespace-nowrap">
                              ОТКРЫТЬ {floorName.toUpperCase()}
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
                            className="w-3/4 max-w-80 h-[90%] object-cover -translate-y-[15px] -translate-x-[20px]"
                          >
                            <source
                              src={`${store.imgUrl}chif.mp4`}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>

                        <div className="absolute -top-10 left-2/5 transform -translate-x-1/2 translate-y-1/2 z-40 w-4/5 max-w-xs">
                          <div className="flex items-center relative">
                            <img
                              src={`${store.imgUrl}img_block_mini.png`}
                              alt="Background"
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
                                  alt="Upgrade"
                                  className="h-10 sm:h-12 w-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-0 px-1 sm:px-2">
                                  <span className="text-white text-sm sm:text-md shantell font-bold">
                                    {floorData.floorId} этаж
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
                                    alt="Manager"
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                  />
                                  <img
                                    src={`${store.imgUrl}${
                                      manager.owned
                                        ? "icon_star.png"
                                        : "icon_star_empty.png"
                                    }`}
                                    alt="Star"
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
                                    alt="Guard"
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                  />
                                  <img
                                    src={`${store.imgUrl}${
                                      guard.owned
                                        ? "icon_star.png"
                                        : "icon_star_empty.png"
                                    }`}
                                    alt="Star"
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

              <div className="absolute bottom-2 right-[20px] z-20">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-[60px] object-contain"
                >
                  <source src={`${store.imgUrl}lift.mp4`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>

        {/* Верхние элементы */}
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}pizza_logo.png`}
            alt="Pizza Logo"
            className="w-70 sm:w-100"
          />
        </div>

        {/* Нижний блок */}
        <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg mx-auto z-30">
          {/* Блок только с бухгалтером */}
          <div className="flex justify-center items-end px-4 mb-2">
            {/* Accountant */}
            <div
              className="flex flex-col items-center relative"
              onClick={handleOpenAccountantModal}
            >
              <img
                src={`${store.imgUrl}Accountant.png`}
                alt="Accountant"
                className="w-28 sm:w-24 sm:h-24 object-contain"
              />
              <div className="absolute -bottom-0 flex items-center text-xs text-white shantell">
                {formatTime(timeLeft.days)}:{formatTime(timeLeft.hours)}:
                {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </div>
            </div>
          </div>

          {/* Блоки балансов */}
          <div className="absolute -bottom-5 left-6 flex-col justify-between items-center">
            {/* PCOIN */}
            <div className="relative w-20 hover:opacity-90 transition-opacity mb-4">
              <img src={`${store.imgUrl}b_white.png`} alt="pcoin" />
              <div className="absolute inset-0 flex items-center ml-2 text-xs text-amber-800 shantell">
                <span>
                  <img
                    src={`${store.imgUrl}icon_dollar_coin.png`}
                    alt="icon_dollar_coin"
                    className="w-4"
                  />
                </span>
                {store.pcoin}
                <Link to="/bank">
                  <span className="absolute -top-0.5 -right-14">
                    <img
                      src={`${store.imgUrl}b_red_plus.png`}
                      alt="icon_dollar"
                      className="w-1/2"
                    />
                  </span>
                </Link>
              </div>
            </div>

            {/* PDOLLAR */}
            <div className="relative w-20 hover:opacity-90 transition-opacity mr-7">
              <img src={`${store.imgUrl}b_white.png`} alt="pdollar" />
              <div className="absolute inset-0 flex items-center ml-1 text-xs text-amber-800 shantell">
                <span>
                  <img
                    src={`${store.imgUrl}icon_dollar.png`}
                    alt="icon_dollar"
                    className="w-6"
                  />
                </span>
                {store.pdollar}
                <Link to="/bank">
                  <span className="absolute -top-0.5 -right-14">
                    <img
                      src={`${store.imgUrl}b_red_minus.png`}
                      alt="icon_dollar"
                      className="w-1/2"
                    />
                  </span>
                </Link>
                <span className="absolute top-8 text-xs text-white shantell">
                  +2.666/час
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Центральная кнопка handleClaimDo */}
        <button
          onClick={handleClaimDo}
          className="fixed bottom-4 left-1/2 w-30 lg:w-50 transform -translate-x-1/2 z-50 hover:opacity-90 transition-opacity active:scale-95"
        >
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center text-2xl md:text-4xl text-blue-900 shantell">
            {store.claimProgress.toFixed(0)}%
          </div>
          <img src={`${store.imgUrl}b_zabrat2.png`} alt="Claim" />
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
                    alt="Header"
                    className="w-full h-auto "
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-800 font-bold text-lg shantell">
                      {selectedFloor.floorId} этаж
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
                    alt="Закрыть"
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
                        Доходность Этажа:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-800 shantell">
                          {selectedFloor.yieldPerHour || 1000}
                        </span>
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt="Доллар"
                          className="w-6 h-4"
                        />
                        <span className="text-xs text-amber-800 shantell">
                          / час
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-800 shantell">
                        Баланс Этажа:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-800 shantell">
                          {selectedFloor.balance || 2755}
                        </span>
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt="Доллар"
                          className="w-5 h-5"
                        />
                        <span className="text-xs text-amber-800 shantell">
                          / час
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Звезды с бонусами */}
                  <div className="flex justify-between items-center">
                    {[1, 2, 3, 4, 5].map((star, index) => {
                      const isActive = index < (selectedFloor.level ?? 0);
                      const bonuses = [64, 104, 130, 164, 206];
                      return (
                        <div key={star} className="flex flex-col items-center">
                          <img
                            src={`${store.imgUrl}${
                              isActive ? "icon_star.png" : "icon_star_empty.png"
                            }`}
                            alt="Звезда"
                            className="w-8 h-8 mb-1"
                          />
                          <div className="flex items-center gap-0 bg-white px-2 py-1 rounded border border-amber-800">
                            <span className="text-xs font-bold text-amber-800 shantell">
                              +{bonuses[index]}
                            </span>
                            <img
                              src={`${store.imgUrl}icon_dollar.png`}
                              alt="Доллар"
                              className="w-5"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Кнопка улучшения этажа */}
                  <button
                    onClick={handleUpgradeFromModal}
                    disabled={!store.canUpgradeFloor(selectedFloor.floorId)}
                    className={`w-full relative py-3 rounded-lg flex items-center justify-center gap-3 ${
                      store.canUpgradeFloor(selectedFloor.floorId)
                        ? "hover:opacity-90 cursor-pointer"
                        : "hidden"
                    }`}
                  >
                    <img
                      src={`${store.imgUrl}b_red_round.png`}
                      alt="Button background"
                      className="absolute inset-x-1 w-full"
                    />
                    <img
                      src={`${store.imgUrl}icon_arrow.png`}
                      alt="Стрелка"
                      className="w-5 h-5 relative z-10"
                    />
                    <span className="text-white font-bold shantell relative z-10">
                      Улучшить до уровня {(selectedFloor.level ?? 0) + 1}
                    </span>
                    <div className="flex items-center gap-1 relative z-10">
                      <img
                        src={`${store.imgUrl}icon_dollar_coin.png`}
                        alt="Монетка"
                        className="w-5 h-5"
                      />
                      <span className="text-white font-bold shantell">
                        {selectedFloor.level >= 5
                          ? 0
                          : store.getUpgradeCost(selectedFloor.floorId) || 1000}
                      </span>
                    </div>
                  </button>

                  {/* Персонал */}
                  <div className="mt-2">
                    <h3 className="text-lg font-bold mb-2 text-amber-800 shantell text-center">
                      ПЕРСОНАЛ:
                    </h3>

                    {/* Менеджер */}
                    <div className="bg-white rounded-lg p-2 mb-4 border border-amber-800 shadow-sm">
                      <div className="flex items-start gap-0 mb-3">
                        <img
                          src={`${store.imgUrl}Manager_small.png`}
                          alt="Менеджер"
                          className="w-18 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 shantell">
                            Менеджер
                          </h4>
                          <p className="text-xs text-amber-600 shantell mb-2">
                            Повышает доход PDollar/час
                          </p>
                          {/* Проценты улучшения менеджера с звездочками */}
                          {renderStaffLevelWithStars(
                            getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "manager"
                            ),
                            ["+1%", "+2%", "+3%", "+4%", "+5%"]
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleStaffUpgrade("manager", selectedFloor.floorId)
                        }
                        className="w-full relative py-2 rounded-lg flex items-center justify-between px-4 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={`${store.imgUrl}b_red_round.png`}
                          alt="Button background"
                          className="absolute inset-0 w-full h-full"
                        />
                        <span className="text-white font-bold text-sm shantell relative z-10">
                          {getStaffCurrentLevel(
                            selectedFloor.floorId,
                            "manager"
                          ) === 0
                            ? "Нанять"
                            : `Улучшить до ${
                                getStaffCurrentLevel(
                                  selectedFloor.floorId,
                                  "manager"
                                ) + 1
                              } уровня`}
                        </span>
                        <div className="flex items-center gap-1 relative z-10">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="Монетка"
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
                    </div>

                    {/* Охранник */}
                    <div className="bg-white rounded-lg p-2 border border-amber-800 shadow-sm">
                      <div className="flex items-start gap-0 mb-3">
                        <img
                          src={`${store.imgUrl}Guard_small.png`}
                          alt="Охранник"
                          className="w-18 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 shantell">
                            Охранник
                          </h4>
                          <p className="text-xs text-amber-600 shantell mb-2">
                            Снижает потери дохода PDollar
                          </p>
                          {/* Проценты улучшения охранника с звездочками */}
                          {renderStaffLevelWithStars(
                            getStaffCurrentLevel(
                              selectedFloor.floorId,
                              "guard"
                            ),
                            ["-4%", "-3%", "-2%", "-1%", "0%"]
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleStaffUpgrade("guard", selectedFloor.floorId)
                        }
                        className="w-full relative py-2 rounded-lg flex items-center justify-between px-4 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={`${store.imgUrl}b_red_round.png`}
                          alt="Button background"
                          className="absolute inset-0 w-full h-full"
                        />
                        <span className="text-white font-bold text-sm shantell relative z-10">
                          {getStaffCurrentLevel(
                            selectedFloor.floorId,
                            "guard"
                          ) === 0
                            ? "Нанять"
                            : `Улучшить до ${
                                getStaffCurrentLevel(
                                  selectedFloor.floorId,
                                  "guard"
                                ) + 1
                              } уровня`}
                        </span>
                        <div className="flex items-center gap-1 relative z-10">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="Монетка"
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
                    alt="Header"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-800 text-lg shantell">
                      Бухгалтер
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
                    alt="Закрыть"
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
                    alt="Accountant"
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
                      Осталось времени найма
                    </div>
                  </div>

                  {/* описание */}
                  <p className="text-lg text-amber-800 shantell leading-tight mb-6">
                    Бухгалтер. Автосбор прибыли каждые 12 часов.
                  </p>

                  {/* варианты подписки */}
                  <div className="flex justify-between gap-2 mb-6 w-full">
                    <button
                      onClick={() => handleHireStaff(7)}
                      className="flex-1 relative hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_white.png`}
                        alt="7 дней"
                        className="w-full"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-amber-800 shantell text-sm">
                        7 дней
                      </span>
                    </button>

                    <button
                      onClick={() => handleHireStaff(14)}
                      className="flex-1 relative hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_white.png`}
                        alt="14 дней"
                        className="w-full"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-amber-800 shantell text-sm">
                        14 дней
                      </span>
                    </button>

                    <button
                      onClick={() => handleHireStaff(30)}
                      className="flex-1 relative hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`${store.imgUrl}b_white.png`}
                        alt="30 дней"
                        className="w-full"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-amber-800 shantell text-sm">
                        30 дней
                      </span>
                    </button>
                  </div>

                  {/* кнопка нанять */}
                  <button
                    onClick={() => handleHireStaff()}
                    className="w-full relative hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={`${store.imgUrl}b_blue_small.png`}
                      alt="Нанять"
                      className="w-full"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-blue-900 shantell text-lg font-bold">
                      Нанять
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FooterHome />
      <WebSocketComponent />
    </>
  );
});

export default Home;
