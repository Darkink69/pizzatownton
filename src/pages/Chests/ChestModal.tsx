import type { ReactNode } from "react";
import { useEffect } from "react";
import store from "../../store/store";
import type { Reward, Rarity } from "../../types/chests"; // Импортируем типы

interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  rewards?: Reward[]; // Используем тип Reward из types/chests
  craftResult?: {
    rarity: Rarity; // Используем Rarity из types/chests
    nftBoxId: number;
    piecesLeft: number;
    nftPrizeName?: string;
  };
}

const ChestModal = ({
  isOpen,
  onClose,
  title,
  rewards,
  craftResult,
}: ChestModalProps) => {
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio(`${store.imgUrl}win.mp3`);
      audio
          .play()
          .catch((e) => console.log("Ошибка воспроизведения звука:", e));
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Функция для получения изображения приза
  const getRewardImage = (reward: Reward) => {
    const imgUrl = store.imgUrl;

    if (reward.type === "pizza_piece" && reward.rarity) {
      return `${imgUrl}icon_pizza_${reward.rarity}.png`;
    } else if (reward.type === "pcoin") {
      return `${imgUrl}icon_dollar_coin.png`;
    } else if (reward.type === "key") {
      return `${imgUrl}icon_key.png`;
    }

    return `${imgUrl}icon_reward_default.png`;
  };

  // Функция для получения названия приза
  const getRewardName = (reward: Reward) => {
    if (reward.type === "pizza_piece" && reward.rarity) {
      return `${reward.rarity} pizza`;
    } else if (reward.type === "pcoin") {
      return "P-Coin";
    } else if (reward.type === "key") {
      return "Key";
    }
    return reward.type.replace(/_/g, " ");
  };

  // Функция для получения изображения NFT-приза
  const getNftPrizeImage = () => {
    if (craftResult?.nftPrizeName) {
      return `${store.imgUrl}${craftResult.nftPrizeName}.png`;
    }
    return `${store.imgUrl}B_DAY_CANDLE.png`; // fallback
  };

  // Функция для получения названия NFT-приза
  const getNftPrizeName = () => {
    if (craftResult?.nftPrizeName) {
      return craftResult.nftPrizeName.replace(/_/g, " ");
    }
    return "NFT Prize";
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-lg border-2 border-amber-800 shantell text-amber-800 relative">
        {/* Заголовок */}
        {title && <h2 className="text-xl mb-6 font-bold">{title}</h2>}

        {/* Содержимое */}
        <div className="mb-8">
          {/* Результат крафта NFT-бокса */}
          {craftResult ? (
            <div className="flex flex-col items-center">
              {/* Изображение NFT-приза */}
              <div className="mb-4">
                <img
                  src={getNftPrizeImage()}
                  alt={getNftPrizeName()}
                  className="w-40 h-40 object-contain mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = `${store.imgUrl}B_DAY_CANDLE.png`;
                  }}
                />
              </div>

              {/* Название NFT-приза */}
              <div className="text-lg font-bold mb-6">{getNftPrizeName()}</div>
            </div>
          ) : rewards && rewards.length > 0 ? (
            /* Призы из сундука - горизонтальное расположение */
            <div className="mb-6">
              <p className="text-amber-800 mb-6 text-lg">Вы получили:</p>

              <div className="flex flex-wrap justify-center gap-6 mb-6">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-center gap-3">
                      {/* Изображение приза без фона */}
                      <div className="flex-shrink-0">
                        <img
                          src={getRewardImage(reward)}
                          alt={getRewardName(reward)}
                          className="w-20 h-20 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = `${store.imgUrl}icon_pizza_common.png`;
                          }}
                        />
                      </div>

                      {/* Количество справа */}
                      <div className="flex items-center gap-1">
                        <span className="text-3xl font-bold text-amber-600">
                          ×
                        </span>
                        <span className="text-4xl font-bold text-amber-800">
                          {reward.amount}
                        </span>
                      </div>
                    </div>

                    {/* Название приза под изображением */}
                    <span className="shantell text-amber-800 text-sm mt-2">
                      {getRewardName(reward)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Кнопка закрытия */}
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
              {title === "Успешный крафт!" ? "Отлично!" : "Закрыть"}
            </span>
          </button>
        </div>

        {/* Кнопка закрытия модального окна (крестик) */}
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

export default ChestModal;
