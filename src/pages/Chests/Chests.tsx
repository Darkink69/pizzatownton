import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import WebSocketComponent from "../../components/websocket";
import store from "../../store/store";
import ChestModal from "./ChestModal";
import {
  type Rarity,
  type ChestType,
  rarityList,
  chestTypeList,
  CHEST_NAMES,
  type Reward,
} from "../../types/chests";
import styles from "./Chests.module.css";

interface ModalData {
  title: string;
  message: string;
}

const ChestsPage = observer(() => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [craftingSlots, setCraftingSlots] = useState<Array<Rarity | null>>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const { keys, pieces, lastRewards, lastCraftResult } = store;

  useEffect(() => {
    store.getChestsState();
  }, []);

  /** --- Реакция на открытие сундука --- */
  useEffect(() => {
    if (lastRewards && lastRewards.length > 0) {
      const rewardsMessage = lastRewards
        .map(
          (r: Reward) =>
            `${r.amount}x ${r.rarity || ""} ${r.type.replace("_", " ")}`
        )
        .join(", ");

      setModalData({
        title: "Сундук открыт!",
        message: `Вы получили: ${rewardsMessage}`,
      });
      store.clearLastRewards();
    }
  }, [lastRewards]);

  /** --- Реакция на успешный крафт --- */
  useEffect(() => {
    if (lastCraftResult) {
      setModalData({
        title: "Успешный крафт!",
        message: `Вы создали NFT-бокс редкости: ${lastCraftResult.rarity}.`,
      });
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
    store.craftPizza(selectedRarity);
    setSelectedRarity(null);

    // TODO: Управлять isLoading на основе ответов от WS, а не таймером
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, craft: false }));
    }, 5000);
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

  return (
    <>
      <div className={styles.pageWrapper}>
        <div className={styles.backgroundContainer}>
          <div
            className={styles.backgroundImage}
            style={{
              backgroundImage: `url('${store.imgUrl}bg_pizza.png')`,
            }}
          />
        </div>

        <div className={styles.testoImageWrapper}>
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className={styles.testoImage}
          />
        </div>

        <div className={styles.headerImageWrapper}>
          <img
            src={`${store.imgUrl}img_task_list.png`}
            alt="Chests header image"
            className={styles.headerImage}
          />
        </div>

        <div className={styles.scrollContainer}>
          <div className={styles.topPadding}></div>

          <div className={styles.scrollableArea}>
            <div className={styles.pageContent}>
              <div className={styles.craftSection}>
                <div className={styles.craftGrid}>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className={styles.craftCell}>
                      {craftingSlots[index] && (
                        <img
                          src={`${store.imgUrl}icon_pizza.png`}
                          alt="pizza slice"
                          className={styles.craftCellImage}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.craftControl}>
                  <div className={styles.craftIcon}>?</div>
                  <button
                    className={styles.craftButton}
                    onClick={handleCraft}
                    disabled={!canCraft || isLoading.craft}
                  >
                    {isLoading.craft ? "Создание..." : "Создать"}
                  </button>
                </div>
              </div>

              <div className={styles.inventorySection}>
                <div className={styles.inventoryGrid}>
                  {rarityList.map((rarity) => (
                    <div key={rarity} onClick={() => handleSelectPizza(rarity)}>
                      <div className={styles.pieceImageContainer}>
                        <img
                          src={`${store.imgUrl}img_block_pizza.png`}
                          alt=""
                          className={styles.pieceBackgroundImage}
                        />
                        <div className={styles.pieceForegroundWrapper}>
                          <img
                            src={`${store.imgUrl}icon_pizza.png`}
                            alt={rarity}
                            className={styles.pieceForegroundImage}
                          />
                        </div>
                        <div className={styles.pieceCountBadge}>
                          <span className={styles.pieceCountText}>
                            {pieces[rarity] || 0} шт.
                          </span>
                        </div>
                      </div>
                      <div className={styles.pieceNameContainer}>
                        <span className={`${styles.pieceNameText} shantell`}>
                          {rarity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.chestsSection}>
                <div className={styles.chestsGrid}>
                  {chestTypeList.map((chestType) => (
                    <div
                      key={chestType}
                      className={`${styles.chestCard} ${
                        keys[chestType] < 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleOpenChest(chestType)}
                    >
                      <img
                        src={`${store.imgUrl}img_chest_${chestType}.png`}
                        alt={`${CHEST_NAMES[chestType]} chest`}
                        className={styles.chestImage}
                      />
                      <div className={styles.keyCount}>
                        Ключей: {keys[chestType]}
                      </div>
                      <button
                        className={styles.openButtonMini}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChest(chestType);
                        }}
                        disabled={keys[chestType] < 1 || isLoading[chestType]}
                      >
                        {isLoading[chestType] ? "Открытие..." : "Открыть"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomPadding}></div>
        </div>
      </div>

      {modalData && (
        <ChestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalData.title}
        >
          <p>{modalData.message}</p>
          <button onClick={closeModal}>
            {modalData.title === "Успешный крафт!" ? "Отлично!" : "Закрыть"}
          </button>
        </ChestModal>
      )}

      <WebSocketComponent />
      <Footer />
    </>
  );
});

export default ChestsPage;
