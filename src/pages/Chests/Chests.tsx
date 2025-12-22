import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";

import store from "../../store/store";
import ChestModal from "./ChestModal";
import {
  type Rarity,
  type ChestType,
  rarityList,
  chestTypeList,
  type Reward,
} from "../../types/chests";
import styles from "./Chests.module.css";

interface ModalData {
  title: string;
  message: string;
}

const ChestsPage = observer(() => {
  const { t } = useTranslation();
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
        .map((r: Reward) =>
          t("chests.reward_format", {
            amount: r.amount,
            rarity: r.rarity ? t(`chests.rarities.${r.rarity}`) : "",
            type: t(`chests.types.${r.type}`),
          })
        )
        .join(", ");

      setModalData({
        title: t("chests.modal.chest_opened_title"),
        message: t("chests.modal.chest_opened_message", {
          rewardsMessage,
        }),
      });
      store.clearLastRewards();
    }
  }, [lastRewards, t]);

  /** --- Реакция на успешный крафт --- */
  useEffect(() => {
    if (lastCraftResult) {
      setModalData({
        title: t("chests.modal.craft_success_title"),
        message: t("chests.modal.craft_success_message", {
          rarity: t(`chests.rarities.${lastCraftResult.rarity}`),
        }),
      });
      store.clearLastCraftResult();
    }
  }, [lastCraftResult, t]);

  const closeModal = () => {
    setModalData(null);
  };

  /**
   * Обработчик открытия сундука.
   * @param {ChestType} chestType - Тип открываемого сундука.
   */
  const handleOpenChest = (chestType: ChestType) => {
    if (keys[chestType] < 1) {
      toast.warn(t("chests.notifications.no_keys"));
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
      toast.info(t("chests.notifications.select_rarity"));
      return;
    }
    if ((pieces[selectedRarity] || 0) < 9) {
      toast.warn(t("chests.notifications.not_enough_pieces"));
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
            alt={t("chests.alts.testo")}
            className={styles.testoImage}
          />
        </div>

        <div className={styles.headerImageWrapper}>
          <img
            src={`${store.imgUrl}img_task_list.png`}
            alt={t("chests.alts.header")}
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
                          alt={t("chests.alts.pizza_slice")}
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
                    {isLoading.craft
                      ? t("chests.craft.button_creating")
                      : t("chests.craft.button_create")}
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
                            alt={t(`chests.rarities.${rarity}`)}
                            className={styles.pieceForegroundImage}
                          />
                        </div>
                        <div className={styles.pieceCountBadge}>
                          <span className={styles.pieceCountText}>
                            {pieces[rarity] || 0}{" "}
                            {t("chests.inventory.piece_unit")}
                          </span>
                        </div>
                      </div>
                      <div className={styles.pieceNameContainer}>
                        <span className={`${styles.pieceNameText} shantell`}>
                          {t(`chests.rarities.${rarity}`)}
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
                        alt={t("chests.chest_section.alt", {
                          name: t(`chests.names.${chestType}`),
                        })}
                        className={styles.chestImage}
                      />
                      <div className={styles.keyCount}>
                        {t("chests.chest_section.keys_count", {
                          count: keys[chestType],
                        })}
                      </div>
                      <button
                        className={styles.openButtonMini}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChest(chestType);
                        }}
                        disabled={keys[chestType] < 1 || isLoading[chestType]}
                      >
                        {isLoading[chestType]
                          ? t("chests.chest_section.open_button_opening")
                          : t("chests.chest_section.open_button_open")}
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
            {modalData.title === t("chests.modal.craft_success_title")
              ? t("chests.modal.great_button")
              : t("common.buttons.close")}
          </button>
        </ChestModal>
      )}


      <Footer />
    </>
  );
});

export default ChestsPage;
