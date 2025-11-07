import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";
import {Link} from "react-router-dom";

const Home = observer(() => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState<any>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: "error" | "success";
    } | null>(null);
    const floors = 10;

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
        setNotification({message, type});
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // Обработчик кнопки CLAIM_DO для конкретного этажа
    const handleClaimDo = (floorId: number) => {
        const success = store.sendClaimDo(floorId);
        if (success) {
            showNotification(`Запрос на получение награды для этажа ${floorId} отправлен!`, "success");
        } else {
            showNotification("Ошибка при отправке запроса");
        }
    };

    // Показываем загрузку пока данные не получены
    if (!areFloorsLoaded) {
        return (
            <div className="relative w-full min-h-screen overflow-y-auto bg-[#FFBC6B] flex items-center justify-center">
                <div className="text-white text-xl">Загрузка этажей...</div>
                <Footer/>
                <WebSocketComponent/>
            </div>
        );
    }

    const getFloorData = (index: number) => {
        const visualIndexToFloorId = (visualIndex: number): number => {
            if (visualIndex === 0) return 1;
            if (visualIndex === floors - 1) return 1;
            return floors - visualIndex;
        };

        const floorId = visualIndexToFloorId(index);

        const floorData = userFloorList.find((floor) => floor.floorId === floorId);

        return floorData || null;
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

        if (!success) {
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
        if (index === 0) return 1;
        if (index === floors - 1) return 1;
        return floors - index;
    };

    const getFloorImage = (index: number) => {
        if (index === 0) return "img_roof.png";
        if (getFloorIdByIndex(index) === 1) return "img_basement_floor.png";
        if (index === floors - 1) return "img_first_floor.png";

        const floorData = getFloorData(index);
        if (floorData) {
            return "img_floor_empty.png";
        }

        return "img_floor_dark.png";
    };

    const isFilledFloor = (index: number) => {
        const img = getFloorImage(index);
        return img === 'img_floor_empty.png' || img === 'img_basement_floor.png';
    };

    const isEmptyFloor = (index: number) => {
        const id = getFloorIdByIndex(index);
        const img = getFloorImage(index);
        return img === 'img_floor_dark.png' && id !== 1;
    };

    const getFloorNameByIndex = (index: number): string => {
        const floorId = getFloorIdByIndex(index);

        if (index === 0) return "Крыша";
        if (floorId === 1) return "Basement";
        if (index === floors - 1) return "1 этаж";

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

                <div className="relative min-h-[160vh]">
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

                    <div
                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[16%]">
                        <div className="flex flex-col items-center relative">
                            {Array.from({length: floors}, (_, index) => {
                                const floorData = getFloorData(index);
                                const isFilled = isFilledFloor(index);
                                const isEmpty = isEmptyFloor(index);
                                const floorId = getFloorIdByIndex(index);
                                const floorName = getFloorNameByIndex(index);
                                const canBuy = store.canBuyFloor(floorId);
                                const floorCost = store.getFloorCost(floorId);

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

                                        {isEmpty && floorId !== 1 && (  // ⛔ Basement не покупаем
                                            <button
                                                onClick={() => handleBuyFloor(index)}
                                                disabled={!canBuy}
                                                className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity
      ${canBuy
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
                                                            <span
                                                                className="text-white text-sm sm:text-base shantell pr-4">
                                                              {floorCost}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="text-blue-900 text-sm sm:text-md shantell font-bold whitespace-nowrap">
                                                            ОТКРЫТЬ {floorName.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {isFilled && floorData && (
                                            <>
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center -z-10">
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

                                                <div
                                                    className="absolute -top-10 left-1/3 transform -translate-x-1/2 translate-y-1/2 z-40 w-4/5 max-w-xs">
                                                    <div className="flex items-center relative">
                                                        <img
                                                            src={`${store.imgUrl}img_block_mini.png`}
                                                            alt="Background"
                                                            className="w-full h-auto object-contain"
                                                        />

                                                        <div className="absolute inset-0 flex items-center">
                                                            <div
                                                                className="flex-1 px-2 sm:px-4 text-xs sm:text-sm text-amber-800 shantell text-center leading-3">
                                                                {floorName} - Уровень {floorData.level}
                                                            </div>

                                                            <div className="flex items-center gap-1 ml-2 sm:ml-4">
                                                                {renderStars(floorData.level)}
                                                            </div>

                                                            <button
                                                                onClick={(e) =>
                                                                    handleUpgradeFloor(floorData.floorId, e)
                                                                }
                                                                disabled={
                                                                    !store.canUpgradeFloor(floorData.floorId)
                                                                }
                                                                className={`relative translate-x-[40px] ${
                                                                    store.canUpgradeFloor(floorData.floorId)
                                                                        ? "cursor-pointer hover:opacity-90 transition-opacity"
                                                                        : "opacity-50 cursor-not-allowed"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={`${store.imgUrl}b_red_mini.png`}
                                                                    alt="Upgrade"
                                                                    className="h-10 sm:h-12 w-auto"
                                                                />
                                                                <div
                                                                    className="absolute inset-0 flex items-center justify-center gap-0 px-1 sm:px-2">
                                                                    <img
                                                                        src={`${store.imgUrl}icon_dollar_coin.png`}
                                                                        alt="Coin"
                                                                        className="w-8 sm:w-10"
                                                                    />
                                                                    <span
                                                                        className="text-white text-md sm:text-lg shantell">
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

                                                            {/* Кнопка CLAIM_DO для этажа */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClaimDo(floorData.floorId);
                                                                }}
                                                                className="relative ml-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
                                                            >
                                <span className="text-xs sm:text-sm text-amber-800 shantell font-bold">
                                  0%
                                </span>
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
                                    <source src={`${store.imgUrl}lift.mp4`} type="video/mp4"/>
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
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

                {/* Кнопка статистики */}
                <div className="fixed bottom-24 left-[5%] w-20 z-20 hover:opacity-90 transition-opacity">
                    <img src={`${store.imgUrl}b_white.png`} alt="red"/>
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

                <div className="fixed bottom-24 left-[60%] w-20 z-20 hover:opacity-90 transition-opacity">
                    <img src={`${store.imgUrl}b_white.png`} alt="red"/>
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

                {/* Модальное окно улучшения этажа */}
                {isModalOpen && selectedFloor && (
                    <>
                        <div
                            className="fixed inset-0 bg-black opacity-70 z-40"
                            onClick={handleCloseModal}
                        />

                        <div
                            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
                            <div className="relative">
                                <img
                                    src={`${store.imgUrl}img_window.png`}
                                    alt="Modal background"
                                    className="w-full h-auto object-contain"
                                />

                                <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                                    {/* Заголовок с номером этажа и текущим уровнем */}
                                    <div className="text-center mb-4 mt-2 sm:mt-4">
                                        <div
                                            className="absolute -top-0 left-1/2 transform -translate-x-1/2 shantell text-center text-sm sm:text-md text-amber-800 font-bold py-1 inline-block">
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
                                        {/* Повара */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1">
                                                Поваров:
                                            </div>
                                            <div
                                                className="font-bold text-base sm:text-lg text-amber-800 shantell mx-2 sm:mx-4">
                                                0 / 5
                                            </div>
                                            <div className="relative w-16 sm:w-20">
                                                <img
                                                    src={`${store.imgUrl}b_yellow.png`}
                                                    alt="Добавить повара"
                                                    className="w-full h-auto"
                                                />
                                                <span
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-sm sm:text-base shantell">
                          +1
                        </span>
                                            </div>
                                        </div>

                                        {/* Доходность Этажа */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
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
                                                <span
                                                    className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          / час
                        </span>
                                            </div>
                                            <div className="relative w-16 sm:w-20">
                                                <img
                                                    src={`${store.imgUrl}b_yellow.png`}
                                                    alt="Увеличить доходность"
                                                    className="w-full h-auto"
                                                />
                                                <span
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-sm sm:text-base shantell">
                          +41
                        </span>
                                            </div>
                                        </div>

                                        {/* Общая Доходность */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="font-bold text-base sm:text-lg text-amber-800 shantell leading-4 flex-1">
                                                Общая доходность:
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-2 mx-2 sm:mx-4">
                        <span className="ont-bold text-base sm:text-lg text-amber-800 shantell">
                          0
                        </span>
                                                <img
                                                    src={`${store.imgUrl}icon_dollar.png`}
                                                    alt="dollar"
                                                    className="w-8 h-auto sm:w-10"
                                                />
                                                <span
                                                    className="font-bold text-base sm:text-lg text-amber-800 shantell">
                          / час
                        </span>
                                            </div>
                                            <div className="relative w-16 sm:w-20">
                                                <img
                                                    src={`${store.imgUrl}b_yellow.png`}
                                                    alt="Увеличить доходность"
                                                    className="w-full h-auto"
                                                />
                                                <span
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-sm sm:text-base shantell">
                          +41
                        </span>
                                            </div>
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
                                                <div
                                                    className="text-white text-sm sm:text-base shantell flex-1 text-center">
                                                    Этаж {selectedFloor.floorId} - Улучшить <br></br>до
                                                    уровня {selectedFloor.level + 1}
                                                </div>

                                                <div className="flex items-center gap-1 sm:gap-2 mx-2">
                                                    <img
                                                        src={`${store.imgUrl}icon_dollar_coin.png`}
                                                        alt="dollar"
                                                        className="w-8 h-auto sm:w-10"
                                                    />
                                                    <span
                                                        className="text-white text-sm sm:text-base shantell font-bold">
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
                                        <circle cx="12" cy="12" r="12" fill="white"/>
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
            </div>
            <Footer/>
            <WebSocketComponent/>
        </>
    );
});

export default Home;