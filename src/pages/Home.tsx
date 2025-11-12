import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import { Link } from "react-router-dom";
import FooterHome from "../components/FooterHome";

const Home = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  // const [claimRewards, setClaimRewards] = useState<{ [key: number]: string }>(
  //   {}
  // );
  const [staffModal, setStaffModal] = useState<
    "manager" | "accountant" | "guard" | null
  >(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const floors = 11; // basement + 9 этажей + крыша

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

  // Используем безопасные геттеры
  const areFloorsLoaded = store.areFloorsLoaded;
  const userFloorList = store.safeUserFloorList;
  if (!Array.isArray(userFloorList)) return null;

  // Принудительный запрос данных при монтировании
  useEffect(() => {
    if (!areFloorsLoaded && store.sessionId && store.user?.telegramId) {
      console.log("Requesting floors data on component mount...");
      store.requestFloorsData();
    }
  }, [areFloorsLoaded, store.sessionId, store.user?.telegramId]);

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

  const handleOpenManagerModal = () => {
    setStaffModal("manager");
  };

  const handleOpenAccountantModal = () => {
    setStaffModal("accountant");
  };

  const handleOpenGuardModal = () => {
    setStaffModal("guard");
  };

  // Обработчик найма персонажа
  const handleHireStaff = () => {
    // Здесь будет логика найма персонажа
    showNotification(`${getStaffName(staffModal)} нанят!`, "success");
    handleCloseStaffModal();
  };

  // Функция для получения названия персонажа
  const getStaffName = (type: string | null) => {
    switch (type) {
      case "manager":
        return "Manager";
      case "accountant":
        return "Accountant";
      case "guard":
        return "Guard";
      default:
        return "";
    }
  };

  // Функция для получения описания персонажа
  const getStaffDescription = (type: string | null) => {
    switch (type) {
      case "manager":
        return "Менеджер. +% к PD/час всех этажей";
      case "accountant":
        return "Бухгалтер. Автоматически собирает прибыль каждые 12 часов";
      case "guard":
        return "Охранник. Снижает/исключает % потери дохода всех этажей";
      default:
        return "";
    }
  };

  // Закрытие модального окна персонажа
  const handleCloseStaffModal = () => {
    setStaffModal(null);
  };

  // Показываем загрузку пока данные не получены ----------------------------------------------------------------------
  if (!areFloorsLoaded) {
    return (
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B] flex items-center justify-center">
        <div className="text-white text-xl shantell">Загрузка этажей...</div>
        <Footer />
        <WebSocketComponent />
      </div>
    );
  }

  const getFloorData = (index: number) => {
    if (index === 0) return null;
    if (index === floors - 1) return null;

    const realFloorId = floors - 1 - index;
    // console.log(index, "→ floorId", realFloorId);
    return (
      store.safeUserFloorList.find((f) => f.floorId === realFloorId) || null
    );
  };

  const renderStars = (level: number) => {
    const stars = [];
    const totalStars = 5;

    for (let i = 0; i < totalStars; i++) {
      if (i < level) {
        stars.push(
          <img
            key={i}
            src={`${store.imgUrl}icon_star.png`}
            alt="Star"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        );
      } else {
        stars.push(
          <img
            key={i}
            src={`${store.imgUrl}icon_star_empty.png`}
            alt="Empty star"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        );
      }
    }
    return stars;
  };

  // Открытие модального окна для улучшения этажа
  const handleOpenUpgradeModal = (floorData: any) => {
    setSelectedFloor(floorData);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFloor(null);
  };

  // Улучшение этажа из модального окна
  const handleUpgradeFromModal = () => {
    if (!selectedFloor) return;

    // const upgradeCost = store.getUpgradeCost(selectedFloor.floorId);

    // Инстантное уведомление
    showNotification(
      `🚀 Отправляем запрос на улучшение этажа ${selectedFloor.floorId}...`,
      "success"
    );

    const success: any = store.upgradeFloor(selectedFloor.floorId);

    if (success) {
      setTimeout(() => {
        showNotification(
          `✅ Этаж ${selectedFloor.floorId} улучшен до уровня ${
            selectedFloor.level + 1
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
    if (index === 0) return -2; // крыша
    if (index === floors - 1) return -1; // basement‑фон
    return floors - 1 - index; // 9→1
  };

  const getFloorImage = (index: number) => {
    // Самый нижний - basement картинка
    if (index === floors - 1) return "img_basement_floor.png";
    // Крыша
    if (index === 0) return "img_roof.png";

    const floorId = getFloorIdByIndex(index);
    const floor = store.getFloorById(floorId);

    // ✅ если этаж куплен — рисуем "пустой", иначе "тёмный"
    return floor?.owned ? "img_floor_empty.png" : "img_floor_dark.png";
  };

  const isFilledFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    // basement и крыша всегда заполнены (просто картинки)
    if (floorId === -1 || floorId === -2) return true;

    const floor = store.getFloorById(floorId);
    return floor?.owned;
  };

  const isEmptyFloor = (index: number) => {
    const floorId = getFloorIdByIndex(index);
    // basement и крыша никогда не пустые
    if (floorId === -1 || floorId === -2) return false;

    const floor = store.getFloorById(floorId);
    return !floor?.owned;
  };

  const getFloorNameByIndex = (index: number): string => {
    const floorId = getFloorIdByIndex(index);

    if (index === 0) return "Крыша";
    if (floorId === -1) return "Basement"; // basement картинка
    if (floorId === 1) return "Basement"; // 1 этаж отображается как "Basement"

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

  // Обработчик улучшения этажа (открывает модальное окно)
  const handleUpgradeFloor = (floorId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (floorId === 1) {
      // 🧱 basement временно не апгрейдится
      showNotification(
        "Basement сейчас нельзя улучшить — ждём звёздный апгрейд!",
        "error"
      );
      return;
    }
    const floor = store.getFloorById(floorId);
    if (!floor) return;

    // если этаж нельзя улучшить — показываем, чего не хватает
    if (!store.canUpgradeFloor(floorId)) {
      const upgradeCost = floor.upgradeAmount ?? 0;
      const currency = floor.upgradeCurrency ?? "pcoin";

      if (!store.hasEnoughCurrency(upgradeCost, currency)) {
        showNotification(
          `Недостаточно ${currency.toUpperCase()} для улучшения! Нужно: ${upgradeCost}`,
          "error"
        );
      } else {
        showNotification(
          `Этаж ${floorId} уже имеет максимальный уровень.`,
          "error"
        );
      }
      return;
    }

    // Всё в порядке — открываем модалку с информацией об апгрейде
    handleOpenUpgradeModal(floor);
  };

  return (
    <>
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B]">
        {/* Кнопка звука в левом верхнем углу */}
        <button
          onClick={toggleMusic}
          className="fixed scale-30 top-4 left-4 z-50 w-12 h-12 sm:w-14 sm:h-14 hover:scale-50 transition-transform"
          aria-label={isMusicPlaying ? "Выключить звук" : "Включить звук"}
        >
          {isMusicPlaying ? (
            <svg
              width="108"
              height="108"
              viewBox="0 0 108 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="54"
                cy="54"
                r="52"
                fill="#FEDB9F"
                stroke="#0E0E0E"
                strokeWidth="4"
              ></circle>
              <path
                d="M32.1461 29.7167C25.0892 37.8855 24.898 51.2557 18.5327 45.7568C12.1673 40.2579 12.7279 29.178 19.7848 21.0092C26.8417 12.8404 37.7226 10.676 44.088 16.1749C50.4533 21.6738 41.0156 23.2123 32.1461 29.7167Z"
                fill="white"
              ></path>
              <path
                d="M47.87 70.6202C46.95 69.8402 45.76 68.3002 44.55 68.0202C41.22 67.7802 30.66 69.9402 29.13 66.2902L29 43.3202C30.21 39.1702 42.24 41.8602 45.64 40.7802C51.41 36.1202 56.8 29.9902 62.6 25.4902C65.08 23.5702 67.27 23.1202 68.53 26.4802L68.33 83.4602C66.51 86.6002 64.62 85.3802 62.39 83.6502C57.5 79.8602 52.69 74.7102 47.87 70.6202Z"
                fill="black"
              ></path>
              <path
                d="M76.57 33.7301C78.68 33.1001 81.65 35.4001 83.22 36.7101C92.29 44.2601 94.29 57.5701 87.8 67.4201C85.94 70.2401 79.02 78.0801 75.65 74.9001C72.47 71.9101 77.8 70.0101 79.56 68.5601C88.43 61.2501 88.12 47.8401 79.33 40.6001C77.71 39.2601 73.8 38.1301 74.95 35.4001C75.17 34.8801 76.02 33.8901 76.57 33.7301Z"
                fill="black"
              ></path>
              <path
                d="M75.8691 64.2599V45.0799C77.1891 44.9299 78.5691 46.5799 79.2991 47.5699C81.9991 51.1899 82.4991 56.0199 80.4291 60.0499C79.6391 61.5899 77.6991 64.2399 75.8691 64.2699V64.2599Z"
                fill="black"
              ></path>
            </svg>
          ) : (
            <svg
              width="108"
              height="108"
              viewBox="0 0 108 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="54"
                cy="54"
                r="52"
                fill="#FEDB9F"
                stroke="#0E0E0E"
                strokeWidth="4"
              ></circle>
              <path
                d="M32.1461 29.7167C25.0892 37.8855 24.898 51.2557 18.5327 45.7568C12.1673 40.2579 12.7279 29.178 19.7848 21.0092C26.8417 12.8404 37.7226 10.676 44.088 16.1749C50.4533 21.6738 41.0156 23.2123 32.1461 29.7167Z"
                fill="white"
              ></path>
              <path
                d="M28.13 42.3304C30.42 39.5704 40.84 41.8904 44.32 40.7604L61.92 24.9004C64.54 22.6704 67.76 24.9004 67.62 28.1204C66.4 45.1904 69.19 64.4004 67.62 81.2204C67.29 84.7204 65.09 86.6404 61.92 84.4404L43.54 68.1004C39.98 68.1804 36.29 68.6504 32.72 68.3404C31.18 68.2104 28.8 67.9604 28 66.5304L28.14 42.3404L28.13 42.3304Z"
                fill="black"
              ></path>
              <path
                d="M86.9302 46.8607C88.3902 45.5407 89.7602 44.7807 91.4902 46.3007C94.6702 49.1007 88.7802 52.6407 87.2002 54.6807C88.8402 56.8407 94.2002 59.7807 91.6902 62.8607C88.8502 66.3407 85.4302 60.2007 83.3102 58.9507C80.7202 60.1007 78.4802 65.5207 75.1902 63.4107C71.6402 61.1307 76.9902 56.6307 78.9302 55.2207L79.0402 54.3107C77.1302 52.4107 72.6702 49.5707 74.5802 46.5607C77.2702 42.3207 81.7502 50.4107 83.3102 50.4107C84.9002 49.9507 85.8602 47.8307 86.9302 46.8707V46.8607Z"
                fill="black"
              ></path>
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

        <div className="relative min-h-[200vh]">
          <div className="h-screen">
            <div className="absolute inset-0 bottom-0 bg-[#FFBC6B]">
              <div
                className="
                  w-full h-full
                  bg-cover bg-center bg-no-repeat
                  sm:bg-auto sm:bg-center
                  md:bg-auto md:bg-center
                  lg:bg-contain lg:bg-center
                  "
                style={{
                  backgroundImage: `url('${store.imgUrl}bg_house_people.jpg')`,
                }}
              />
            </div>
          </div>

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
                const isBasementImage = floorId === -1; // basement картинка
                const isRoof = floorId === -2; // крыша
                const isFirstFloor = floorId === 1; // 1 этаж (отображается как Basement)

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

                    {/* Кнопка покупки для пустых этажей (кроме basement картинки и крыши) */}
                    {isEmpty && !isBasementImage && !isRoof && (
                      <button
                        onClick={() => handleBuyFloor(index)}
                        disabled={!canBuy}
                        className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity
                            ${
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

                    {/* Блок с данными для заполненных этажей (кроме basement картинки и крыши) */}
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
                              <div className="flex-1 px-2 sm:px-4 text-xs sm:text-sm text-amber-800 shantell text-center leading-3">
                                {floorName}
                              </div>

                              <div className="flex items-center gap-0.5">
                                {renderStars(floorData.level)}
                              </div>
                              {/* Кнопка CLAIM_DO для обычных этажей */}
                              {!isFirstFloor && (
                                <div
                                  // onClick={(e) => {
                                  //   e.stopPropagation();
                                  //   handleClaimDo(floorData.floorId);
                                  // }}
                                  className="pl-4 flex items-center"
                                >
                                  {/* <span className="text-sm sm:text-md text-amber-800 shantell font-bold whitespace-nowrap">
                                    {store.lastClaimRewards?.floorId ===
                                    floorData.floorId
                                      ? `+${
                                          store.lastClaimRewards.amount.toFixed?.(
                                            0
                                          ) ?? store.lastClaimRewards.amount
                                        }`
                                      : floorData.earned &&
                                        Number(floorData.earned) > 0
                                      ? `${Number(
                                          floorData.earned.toFixed?.(0) ??
                                            floorData.earned
                                        )}`
                                      : "0"}
                                  </span> */}
                                  <img
                                    src={`${store.imgUrl}icon_dollar.png`}
                                    alt="pdollar"
                                    className="w-6 h-4 sm:w-9 sm:h-5 ml-1"
                                  />
                                </div>
                              )}

                              {/* Специальная кнопка для 1 этажа (Basement) с пиццей */}
                              {isFirstFloor && (
                                <div
                                  // onClick={(e) => {
                                  //   e.stopPropagation();
                                  //   handleClaimDo(floorData.floorId);
                                  // }}
                                  className="pl-4 flex items-centerd"
                                >
                                  {/* <span className="text-sm sm:text-md text-amber-800 shantell font-bold whitespace-nowrap">
                                    {floorData.earned?.toFixed?.(0) ??
                                      floorData.earned ??
                                      0}
                                  </span> */}
                                  <img
                                    src={`${store.imgUrl}icon_pizza.png`}
                                    alt="pizza"
                                    className="w-6 h-6 sm:w-8 sm:h-8 ml-1"
                                  />
                                </div>
                              )}

                              <button
                                onClick={(e) =>
                                  handleUpgradeFloor(floorData.floorId, e)
                                }
                                disabled={
                                  floorData.floorId === 1 ||
                                  !store.canUpgradeFloor(floorData.floorId)
                                }
                                className={`relative translate-x-[40px] ${
                                  floorData.floorId === 1 ||
                                  !store.canUpgradeFloor(floorData.floorId)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:opacity-90 transition-opacity"
                                }`}
                              >
                                <img
                                  src={`${store.imgUrl}b_red_mini.png`}
                                  alt="Upgrade"
                                  className="h-10 sm:h-12 w-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-0 px-1 sm:px-2">
                                  <img
                                    src={`${store.imgUrl}icon_dollar_coin.png`}
                                    alt="Coin"
                                    className="w-8 sm:w-10"
                                  />
                                  <span className="text-white text-md sm:text-lg shantell">
                                    {store.getUpgradeCost(floorData.floorId) ||
                                      0}
                                  </span>
                                  <img
                                    src={`${store.imgUrl}icon_arrow.png`}
                                    alt="Upgrade"
                                    className="w-8 sm:w-12"
                                  />
                                </div>
                              </button>
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
        <div className="absolute bottom-26 left-1/2 transform -translate-x-1/2 w-full max-w-lg mx-auto z-30">
          {/* Блоки персонажей */}
          <div className="flex justify-between items-end px-4 mb-2">
            {/* Manager */}
            <div
              className="flex flex-col items-center relative"
              onClick={handleOpenManagerModal}
            >
              <img
                src={`${store.imgUrl}Manager.png`}
                alt="Manager"
                className="w-28 sm:w-24 sm:h-24 object-contain"
              />
              <div className="absolute -bottom-0 flex items-center gap-1">
                {renderStars(4)}
              </div>
            </div>

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
                00:00:00
              </div>
            </div>

            {/* Guard */}
            <div
              className="flex flex-col items-center relative"
              onClick={handleOpenGuardModal}
            >
              <img
                src={`${store.imgUrl}Guard.png`}
                alt="Guard"
                className="w-28 sm:w-24 sm:h-24 object-contain"
              />
              <div className="absolute -bottom-0 flex items-center gap-1">
                {renderStars(2)}
              </div>
            </div>
          </div>

          {/* Блоки балансов */}
          <div className="flex justify-between items-center px-4">
            {/* Блок PCOIN */}
            <div className="relative w-20 hover:opacity-90 transition-opacity">
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

            {/* Блок PDOLLAR под Guard */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Центральная кнопка handleClaimDo */}
        <button
          onClick={handleClaimDo}
          className="fixed bottom-4 left-1/2 w-30 sm:w-50 transform -translate-x-1/2
             z-50 hover:opacity-90 transition-opacity active:scale-95"
        >
          <div
            className="absolute top-8 left-1/2 transform -translate-x-1/2
                  flex items-center justify-center text-2xl md:text-4xl
                  text-blue-900 shantell"
          >
            {store.claimProgress.toFixed(0)}%
          </div>
          <img src={`${store.imgUrl}b_zabrat2.png`} alt="Claim" />
        </button>

        {/* Модальное окно улучшения этажа */}
        {isModalOpen && selectedFloor && (
          <>
            <div
              className="fixed inset-0 bg-black opacity-70 z-40"
              onClick={handleCloseModal}
            />

            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
              <div className="relative">
                <img
                  src={`${store.imgUrl}img_window.png`}
                  alt="Modal background"
                  className="w-full h-auto object-contain"
                />

                <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                  {/* Заголовок с номером этажа и текущим уровнем */}
                  <div className="text-center mb-4 mt-2 sm:mt-4">
                    <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 shantell text-center text-sm sm:text-md text-amber-800 font-bold py-1 inline-block">
                      ЭТАЖ {selectedFloor.floorId} - УРОВЕНЬ{" "}
                      {selectedFloor.level}
                    </div>
                  </div>

                  {/* Изображение кухни */}
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-3/4 sm:w-full rounded-xl overflow-hidden">
                      <img
                        src={`${store.imgUrl}img_kitchen.png`}
                        alt="Кухня"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 px-2">
                    {/* Доходность Этажа */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                        Доходность этажа:
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mx-2 sm:mx-4">
                        <span className="ont-bold text-base sm:text-lg text-amber-800 shantell">
                          {selectedFloor.yieldPerHour}
                        </span>
                        <img
                          src={`${store.imgUrl}icon_dollar.png`}
                          alt="dollar"
                          className="w-8 h-auto sm:w-10"
                        />
                        <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          / час
                        </span>
                      </div>
                      <div className="relative w-16 sm:w-20">
                        <img
                          src={`${store.imgUrl}b_yellow.png`}
                          alt="Увеличить доходность"
                          className="w-full h-auto"
                        />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-sm sm:text-base shantell">
                          +41
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Блок звезд с ценами */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex justify-center items-center gap-2 sm:gap-4 mb-3">
                      {Array.from({ length: 5 }, (_, index) => {
                        const starLevel = index + 1;
                        const isActive = starLevel <= selectedFloor.level;
                        const upgradeCost = 1000;

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            {/* Звезда */}
                            <img
                              src={`${store.imgUrl}${
                                isActive
                                  ? "icon_star.png"
                                  : "icon_star_empty.png"
                              }`}
                              alt={isActive ? "Active star" : "Empty star"}
                              className="w-6 h-6 sm:w-8 sm:h-8 mb-1"
                            />
                            {/* Цена под звездой */}
                            <div className="relative">
                              <img
                                src={`${store.imgUrl}b_white.png`}
                                alt="Price background"
                                className="w-12 h-6 sm:w-14 sm:h-7"
                              />
                              <div className="absolute inset-0 flex items-center justify-center gap-1 px-1">
                                <span className="text-xs text-amber-800 shantell font-bold">
                                  {upgradeCost}
                                </span>
                                <img
                                  src={`${store.imgUrl}icon_dollar_coin.png`}
                                  alt="coin"
                                  className="w-3 h-3"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Текущий уровень текстом */}
                    <div className="text-center">
                      <span className="text-sm sm:text-base text-amber-800 shantell">
                        Текущий уровень: {selectedFloor.level}/5
                      </span>
                    </div>
                  </div>

                  {/* Кнопка улучшения */}
                  <div className="mt-auto px-2">
                    <button
                      onClick={handleUpgradeFromModal}
                      disabled={!store.canUpgradeFloor(selectedFloor.floorId)}
                      className={`relative w-full transition-opacity ${
                        store.canUpgradeFloor(selectedFloor.floorId)
                          ? "hover:opacity-90"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <img
                        src={`${store.imgUrl}b_red.png`}
                        alt="Улучшить этаж"
                        className="w-full h-auto"
                      />

                      <div className="absolute inset-0 flex items-center justify-between ">
                        <div className="text-white text-sm sm:text-base shantell flex-1 text-center">
                          Этаж {selectedFloor.floorId} - Улучшить <br></br>до
                          уровня {selectedFloor.level + 1}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 mx-2">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="dollar"
                            className="w-8 h-auto sm:w-10"
                          />
                          <span className="text-white text-sm sm:text-base shantell font-bold">
                            {store.getUpgradeCost(selectedFloor.floorId) || 0}
                          </span>
                          <img
                            src={`${store.imgUrl}icon_arrow.png`}
                            alt="arrow"
                            className="w-8 h-auto sm:w-10"
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Кнопка закрытия */}
                <button
                  onClick={handleCloseModal}
                  className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-50 p-1 shadow-lg hover:scale-110 transition-transform"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="white" />
                    <path
                      d="M8 8L16 16"
                      stroke="#FFBC6B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 8L8 16"
                      stroke="#FFBC6B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Модальные окна персонажей */}
        {staffModal && (
          <>
            {/* Затемненный фон с прозрачностью */}
            <div
              className="fixed inset-0 bg-black opacity-70 z-50"
              onClick={handleCloseStaffModal}
            />

            {/* Модальное окно */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl">
                {/* Заголовок с кнопкой закрытия */}
                <div className="relative p-4 border-b border-gray-200">
                  <h2 className="text-center text-xl font-bold text-amber-800 shantell">
                    {getStaffName(staffModal)}
                  </h2>
                  <button
                    onClick={handleCloseStaffModal}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:scale-110 transition-transform"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="12" fill="#FFBC6B" />
                      <path
                        d="M8 8L16 16"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 8L8 16"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Контент модального окна */}
                <div className="p-6">
                  {/* Картинка персонажа */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={`${store.imgUrl}${getStaffName(staffModal)}_big.png`}
                      alt={getStaffName(staffModal)}
                      className="w-full object-contain"
                    />
                  </div>

                  {/* Описание персонажа */}
                  <div className="text-center mb-6">
                    <p className="text-lg text-amber-800 shantell leading-tight">
                      {getStaffDescription(staffModal)}
                    </p>
                  </div>

                  {/* Дополнительные кнопки для бухгалтера */}
                  {staffModal === "accountant" && (
                    <div className="flex justify-between gap-2 mb-6">
                      <button className="flex-1 relative hover:opacity-90 transition-opacity">
                        <img
                          src={`${store.imgUrl}b_white.png`}
                          alt="7 дней"
                          className="w-full"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-amber-800 shantell text-sm">
                          7 дней
                        </span>
                      </button>
                      <button className="flex-1 relative hover:opacity-90 transition-opacity">
                        <img
                          src={`${store.imgUrl}b_white.png`}
                          alt="14 дней"
                          className="w-full"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-amber-800 shantell text-sm">
                          14 дней
                        </span>
                      </button>
                      <button className="flex-1 relative hover:opacity-90 transition-opacity">
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
                  )}

                  {/* Кнопка "Нанять" */}
                  <button
                    onClick={handleHireStaff}
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
          </>
        )}
      </div>

      <FooterHome />
      <WebSocketComponent />
    </>
  );
});

export default Home;
