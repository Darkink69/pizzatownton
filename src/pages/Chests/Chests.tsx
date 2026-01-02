import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import store from "../../store/store";
import ChestModal from "./ChestModal";
import {
  CHEST_NAMES,
  type ChestType,
  chestTypeList,
  type Rarity,
  rarityList,
  type Reward,
} from "../../types/chests";

const GiftsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const gifts = [
    { name: "B-Day Candle", fileName: "B-Day Candle" },
    { name: "Lol Pop", fileName: "Lol Pop" },
    { name: "Light Sword", fileName: "Light Sword" },
    { name: "Desk Calendar", fileName: "Desk Calendar" },
    { name: "Whip-Cupcake", fileName: "Whip Cupcake" },
    { name: "Ice Cream", fileName: "Ice Cream" },
    { name: "Lunar Snake", fileName: "Lunar Snake" },
    { name: "Hypno Lollipop", fileName: "Hypno Lollipop" },
    { name: "Hex Pot", fileName: "Hex Pot" },
    { name: "Winter Wreath", fileName: "Winter Wreath" },
    { name: "Star Notepad", fileName: "Star Notepad" },
    { name: "Restless Jar", fileName: "Restless Jar" },
    { name: "Snoop Dogg", fileName: "Snoop Dogg" },
    { name: "Party Sparkler", fileName: "Party Sparkler" },
    { name: "Swag Bag", fileName: "Swag Bag" },
    { name: "Holiday Drink", fileName: "Holiday Drink" },
  ];

  // Функция для получения URL изображения
  const getGiftImageUrl = (fileName: string) => {
    return `${store.imgUrl}${fileName}.webp`;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative max-h-[80vh] flex flex-col">
        <h2 className="text-2xl mb-2 font-bold">Подарки для тебя!</h2>

        <p className="text-amber-600 mb-6 text-lg">
          Скрафти и получи ценный приз NFT!
        </p>

        <div className="flex-1 overflow-y-auto mb-6">
          <div className="grid grid-cols-3 gap-4">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <div className="w-full aspect-square mb-2">
                  <img
                    src={getGiftImageUrl(gift.fileName)}
                    alt={gift.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback если изображение не загрузилось
                      console.error(`Failed to load image: ${gift.fileName}`);
                      e.currentTarget.src = `${store.imgUrl}B-Day Candle.webp`;
                    }}
                  />
                </div>

                <span className="text-sm font-semibold text-amber-800 text-center">
                  {gift.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Изображения подарков могут незначительно отличаться цветом или формой
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="relative px-10 py-3 rounded-lg text-lg font-bold cursor-pointer transition-all duration-200 hover:opacity-90"
          >
            <img
              src={`${store.imgUrl}b_orange_round.png`}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span className="relative z-10 shantell text-amber-900">
              Закрыть
            </span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute -top-10 right-2 w-8 h-8 bg-transparent hover:scale-110 transition-transform z-10"
        >
          <img
            src={`${store.imgUrl}b_close.png`}
            alt="Закрыть"
            className="w-full h-full"
          />
        </button>
      </div>
    </div>
  );
};

// Позиции для 9 кусочков пиццы, направленных к центру
const pizzaPiecePositions = [
  { top: "5%", left: "50%", transform: "translate(-25%, 0%)" }, // 12 часов
  { top: "32%", left: "72%", transform: "translate(-50%, -50%)" }, // 2 часа
  { top: "55%", left: "75%", transform: "translate(-50%, -50%)" }, // 3 часа
  { top: "72%", left: "70%", transform: "translate(-50%, -50%)" }, // 5 часов
  { top: "95%", left: "51%", transform: "translate(-50%, -100%)" }, // 6 часов
  { top: "72%", left: "30%", transform: "translate(-50%, -50%)" }, // 7 часов
  { top: "60%", left: "25%", transform: "translate(-50%, -50%)" }, // 9 часов
  { top: "33%", left: "26%", transform: "translate(-50%, -50%)" }, // 10 часов
  { top: "25%", left: "25%", transform: "translate(-25%, -50%)" },
];

const ChestsPage = observer(() => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [craftingSlots, setCraftingSlots] = useState<Array<Rarity | null>>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    rewards?: Reward[];
    craftResult?: { rarity: Rarity; nftBoxId: number; piecesLeft: number };
  } | null>(null);
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);
  const { keys, pieces, lastRewards, lastCraftResult } = store;

  useEffect(() => {
    store.getChestsState();
  }, []);

  /** --- Реакция на открытие сундука --- */
  useEffect(() => {
    if (lastRewards && lastRewards.length > 0) {
      setModalData({
        title: "Сундук открыт!",
        message: lastRewards
          .map(
            (r: Reward) =>
              `${r.amount}x ${r.rarity || ""} ${r.type.replaceAll("_", " ")}`
          )
          .join(", "),
        rewards: lastRewards,
      });
      store.clearLastRewards();
    }
  }, [lastRewards]);

  /** --- Реакция на успешный крафт --- */
  useEffect(() => {
    if (lastCraftResult) {
      setModalData({
        title: "Успешный крафт!",
        message: `Вы получили подарок: ${lastCraftResult.nftPrizeName}`, // code
        craftResult: {
          rarity: lastCraftResult.piecesRarity,
          nftBoxId: lastCraftResult.nftPrizeId,
          piecesLeft: lastCraftResult.piecesLeft,
        },
      });

      setIsLoading((prev) => ({ ...prev, craft: false }));
      store.clearLastCraftResult();
    }
  }, [lastCraftResult]);

  const closeModal = () => {
    setModalData(null);
  };

  /**
   * Обработчик открытия сундука.
   * @param {ChestType} chestType - Тип открываемого сундука.
   */
  const handleOpenChest = (chestType: ChestType) => {
    if (keys[chestType] < 1) {
      toast.warn("Недостаточно ключей!");
      return;
    }
    if (isLoading[chestType]) return;

    setIsLoading((prev) => ({ ...prev, [chestType]: true }));
    store.openChest(chestType);

    // TODO: Управлять isLoading на основе ответов от WS, а не таймером
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, [chestType]: false }));
    }, 5000);
  };

  /**
   * Обработчик крафта NFT-бокса.
   */
  const handleCraft = () => {
    if (!selectedRarity) {
      toast.info("Выберите редкость для крафта.");
      return;
    }
    if ((pieces[selectedRarity] || 0) < 9) {
      toast.warn("Недостаточно кусочков для крафта!");
      return;
    }
    if (isLoading.craft) return;

    setIsLoading((prev) => ({ ...prev, craft: true }));

    const ok = store.craftPizza(selectedRarity);
    if (!ok) {
      setIsLoading((prev) => ({ ...prev, craft: false }));
      toast.error("Не удалось отправить запрос на крафт (нет WS/сессии)");
    }
  };

  /**
   * Обработчик выбора пиццы для крафта.
   * @param {Rarity} rarity - Редкость выбранной пиццы.
   */
  const handleSelectPizza = (rarity: Rarity) => {
    setSelectedRarity(rarity);
    const availablePieces = pieces[rarity] || 0;
    const slotsToFill = Math.min(availablePieces, 9);
    const newCraftingSlots = Array(9).fill(null);
    for (let i = 0; i < slotsToFill; i++) {
      newCraftingSlots[i] = rarity;
    }
    setCraftingSlots(newCraftingSlots);
  };

  const canCraft = selectedRarity && (pieces[selectedRarity] || 0) >= 9;
  const isModalOpen = modalData !== null;

  // Получаем текущую редкость для отображения кусочков
  const currentRarity = selectedRarity || "common";

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

        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}img_task_list.png`}
            alt="Chests header image"
          />
        </div>

        <div className="relative z-30 h-screen flex flex-col">
          <div className="flex-shrink-0 pt-25"></div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 py-4 text-white w-full max-w-[500px] mx-auto">
              <div className="relative w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
                  style={{
                    backgroundImage: `url('${store.imgUrl}img_window.png')`,
                    minHeight: "400px", // Фиксированная высота
                  }}
                />

                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
                  <span className="shantell text-xl text-amber-800 tracking-wider">
                    ЛУТБОКС
                  </span>
                </div>

                <div className="relative z-10 p-4 pt-12">
                  {/* Верхняя часть с крафтом - внутри одного блока */}
                  <div className="flex gap-4 items-center mb-4">
                    <div className="relative w-3/4 flex justify-center">
                      <div className="relative w-70">
                        <img
                          src={`${store.imgUrl}bg_big_pizza.png`}
                          alt="pizza base"
                          className="w-full h-full object-contain"
                        />

                        {/* Кусочки пиццы, направленные к центру - всегда показываем все 9 кусочков */}
                        {Array.from({ length: 9 }).map((_, index) => (
                          <div
                            key={index}
                            className="absolute"
                            style={{
                              top: pizzaPiecePositions[index].top,
                              left: pizzaPiecePositions[index].left,
                              transform: pizzaPiecePositions[index].transform,
                              width: "40%",
                              height: "40%",
                              zIndex: craftingSlots[index] ? 10 : 1,
                              opacity: craftingSlots[index] ? 1 : 0.3, //
                            }}
                          >
                            <img
                              src={`${store.imgUrl}big_pizza_${currentRarity}_${
                                index + 1
                              }.png`}
                              alt={`pizza piece ${index + 1}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Если нет картинки для этой редкости, используем common
                                if (currentRarity !== "common") {
                                  e.currentTarget.src = `${
                                    store.imgUrl
                                  }big_pizza_common_${index + 1}.png`;
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Правая часть: блок с картинкой и кнопкой */}
                    <div className="w-1/4 flex flex-col items-center justify-center gap-3">
                      <div className="relative w-full">
                        <img
                          src={`${store.imgUrl}img_block_pizza.png`}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={`${store.imgUrl}craft_1.png`}
                            alt="craft icon"
                            className="w-full h-full"
                          />
                        </div>
                      </div>

                      {/* НОВАЯ КНОПКА: Мои подарки */}
                      <button
                        className="relative p-3 rounded-lg border-none text-base font-bold cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-[120px] h-12 flex items-center justify-center"
                        onClick={() => {
                          setIsGiftsModalOpen(true);
                          const ok = store.getGiftsList();
                          if (!ok)
                            toast.error(
                              "Не удалось загрузить подарки (нет WS/сессии)"
                            );
                        }}
                      >
                        <img
                          src={`${store.imgUrl}b_orange_round.png`}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <span className="relative z-10 shantell text-xs text-[#333]">
                          Подарки
                        </span>
                      </button>

                      <button
                        className="relative p-3 rounded-lg border-none text-base font-bold cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-[120px] h-12 flex items-center justify-center"
                        onClick={handleCraft}
                        disabled={!canCraft || isLoading.craft}
                      >
                        <img
                          src={`${store.imgUrl}b_red_craft.png`}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <span className="relative z-10 shantell text-xs">
                          {isLoading.craft ? "Создание..." : "Создать"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Блок инвентаря под секцией крафта */}
                  <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-3 border border-[rgba(255,255,255,0.1)]">
                    <div className="grid grid-cols-4 gap-2">
                      {rarityList.map((rarity) => (
                        <div
                          key={rarity}
                          onClick={() => handleSelectPizza(rarity)}
                          className="cursor-pointer"
                        >
                          <div className="relative aspect-square w-full">
                            <img
                              src={`${store.imgUrl}img_block_pizza.png`}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                              <img
                                src={`${store.imgUrl}icon_pizza_${rarity}.png`}
                                alt={rarity}
                                className="w-full object-contain"
                              />
                            </div>
                            <div className="absolute top-0 right-1 rounded px-1 py-0.5">
                              <span className="text-xs font-bold text-[#ffc107]">
                                {pieces[rarity] || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-center mt-1">
                            <span className="text-amber-800 text-md font-bold leading-tight capitalize shantell">
                              {rarity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Секция сундуков - отдельный блок под окном */}
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-xl p-[15px] border border-[rgba(255,255,255,0.1)]">
                <div className="grid grid-cols-3 gap-4">
                  {chestTypeList.map((chestType) => (
                    <div
                      key={chestType}
                      className={`relative flex flex-col items-center gap-2 ${
                        keys[chestType] < 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* Фон для сундука */}
                      <div className="relative w-full aspect-square">
                        <img
                          src={`${store.imgUrl}img_block_chest.png`}
                          alt="chest background"
                          className="absolute inset-0 w-full h-full object-contain"
                        />

                        {/* Картинка сундука по центру */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={`${store.imgUrl}img_chest_${chestType}.png`}
                            alt={`${CHEST_NAMES[chestType]} chest`}
                            className="w-3/4 h-3/4 object-contain"
                          />

                          {/* Количество ключей в левом нижнем углу фона */}
                          <div className="absolute bottom-4 left-4">
                            <span className="text-sm text-white shantell bg-amber-400 rounded-2xl p-1 pl-2 pr-2">
                              {keys[chestType]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Кнопка Открыть под фоном */}
                      <button
                        className="relative w-full h-10 flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChest(chestType);
                        }}
                        disabled={keys[chestType] < 1 || isLoading[chestType]}
                      >
                        <img
                          src={`${store.imgUrl}b_orange_round.png`}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <span className="relative z-10 shantell text-sm text-[#333]">
                          {isLoading[chestType] ? "Открытие..." : "Открыть"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 pb-20"></div>
        </div>
      </div>
      {modalData && (
        <ChestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalData.title}
          rewards={modalData.rewards}
          craftResult={modalData.craftResult}
        >
          <p>{modalData.message}</p>
          <button onClick={closeModal}>
            {modalData.title === "Успешный крафт!" ? "Отлично!" : "Закрыть"}
          </button>
        </ChestModal>
      )}
      // Затем в компоненте ChestsPage замените существующее модальное окно на:
      {isGiftsModalOpen && (
        <GiftsModal
          isOpen={isGiftsModalOpen}
          onClose={() => setIsGiftsModalOpen(false)}
        />
      )}
      <Footer />
    </>
  );
});

export default ChestsPage;
