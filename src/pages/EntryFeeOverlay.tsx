import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import { bankStore } from "../store/BankStore";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { beginCell } from "@ton/core";

const SUPPORT_LINK = "https://t.me/pizzatower_support";

function toNano(ton: string | number): string {
  const amount = typeof ton === "number" ? ton : Number(ton);
  return BigInt(Math.floor(amount * 1e9)).toString();
}

function encodeCommentAsPayload(comment: string): string {
  return beginCell()
      .storeUint(0, 32)
      .storeStringTail(comment)
      .endCell()
      .toBoc()
      .toString("base64");
}

const EntryFeeOverlay = observer(() => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  // таймер поддержки: запускается только после успешного sendTransaction
  const [paymentSentAt, setPaymentSentAt] = useState<number | null>(null);
  const [showSupportBlock, setShowSupportBlock] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const tgId = store.user?.telegramId ?? store.user?.id;
  const isReady = Boolean(tgId) && store.isAuthed;
  const isPaid = store.user?.isPaidAccess === true;

  const entryOrder = bankStore.entryOrder;
  const isWaiting = !!entryOrder;

  const status = entryOrder?.status ?? "WAITING_PAYMENT";
  const isExpired = status === "EXPIRED";
  const isCancelled = status === "CANCELLED";
  const isPaidOrder = status === "PAID";

  const statusText = useMemo(() => {
    if (isPaidOrder) return "Оплата подтверждена. Открываем доступ...";
    if (isExpired) return "Ордер истёк. Создайте новый ордер.";
    if (isCancelled) return "Ордер отменён. Создайте новый ордер.";
    return "Ожидаем подтверждение оплаты...";
  }, [isPaidOrder, isExpired, isCancelled]);

  // 1) polling статуса ордера каждые 5 сек (страховка если пуш не пришёл / ws отвалился)
  useEffect(() => {
    const id = bankStore.entryOrder?.orderId;
    if (!id) return;

    const timer = setInterval(() => {
      bankStore.fetchOrder(id);
    }, 5000);

    return () => clearInterval(timer);
  }, [bankStore.entryOrder?.orderId]);

  // 2) через 5 минут после отправки транзакции показываем блок поддержки, если доступ не открылся
  useEffect(() => {
    if (!paymentSentAt) return;

    const tmr = setTimeout(() => {
      if (store.user?.isPaidAccess !== true) {
        setShowSupportBlock(true);

        // подтянем реф-ссылку, если ещё не загружена
        if (!store.referral?.link && store.sessionId && (store.user?.telegramId ?? store.user?.id)) {
          store.requestReferralInfo();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(tmr);
  }, [
    paymentSentAt,
    store.user?.isPaidAccess,
    store.sessionId,
    store.user?.telegramId,
    store.user?.id,
    store.referral?.link,
  ]);

  // 3) если доступ открылся — сбрасываем поддержку/таймер
  useEffect(() => {
    if (store.user?.isPaidAccess === true) {
      setShowSupportBlock(false);
      setPaymentSentAt(null);
    }
  }, [store.user?.isPaidAccess]);

  // 4) если мы в ожидании, но нет referral.link — попробуем подгрузить заранее (для поддержки)
  useEffect(() => {
    if (!isReady) return;
    if (!isWaiting) return;
    if (store.referral?.link) return;
    store.requestReferralInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isWaiting]);

  if (!isReady) return null;
  if (isPaid) return null;

  const handleCreateOrder = () => {
    // сбросим UI и создадим новый
    bankStore.entryOrder = null;
    bankStore.entryError = null;
    setShowSupportBlock(false);
    setPaymentSentAt(null);

    bankStore.createEntryOrder();
  };

  const handleRefreshStatus = () => {
    const id = bankStore.entryOrder?.orderId;
    if (!id) return;

    setManualRefreshing(true);
    try {
      bankStore.fetchOrder(id);
    } finally {
      setTimeout(() => setManualRefreshing(false), 800);
    }
  };

  const handleWalletPay = async () => {
    if (!entryOrder?.merchantAddr || !entryOrder?.amountTon || !entryOrder?.tonComment) return;

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: entryOrder.merchantAddr,
          amount: toNano(entryOrder.amountTon),
          payload: encodeCommentAsPayload(entryOrder.tonComment),
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(tx);
      // стартуем 5-минутный таймер поддержки
      setPaymentSentAt(Date.now());
      setShowSupportBlock(false);
    } catch (err) {
      // пользователь отменил или ошибка кошелька
      console.error("❌ TonConnect payment error:", err);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn("copy failed", e);
    }
  };

  const referralLink = store.referral?.link || "";
  const tgIdStr = String(store.user?.telegramId ?? store.user?.id ?? "");

  return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative bg-[#FFF3E0] border-4 border-amber-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-amber-700 p-4 border-b-4 border-amber-800 text-center">
            <h2 className="text-2xl font-bold text-white shantell uppercase tracking-wider drop-shadow-md">
              ВХОД В ИГРУ
            </h2>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">
            {/* Картинка как в гайде */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <img
                  src={`${store.imgUrl}img_chif_talk.png`}
                  alt="Шеф"
                  className="w-36 sm:w-48 object-contain relative z-10"
              />
            </div>

            {/* ЭКРАН 1: ОФФЕР */}
            {!isWaiting ? (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-amber-900 font-bold text-lg shantell">
                      Для открытия пиццерии необходимо пройти регистрацию бизнеса.
                    </p>

                    <div className="bg-amber-100 p-3 rounded-xl border-2 border-amber-300">
                      <p className="text-amber-800 text-sm font-semibold">Стоимость:</p>
                      <p className="text-3xl font-black text-amber-600 shantell mt-1">
                        2 TON
                      </p>
                    </div>
                  </div>

                  <button
                      onClick={handleCreateOrder}
                      disabled={bankStore.entryCreating}
                      className={`w-full py-3 rounded-xl font-bold text-xl shantell text-white shadow-lg transition-transform active:scale-95 ${
                          bankStore.entryCreating
                              ? "bg-gray-400 cursor-wait"
                              : "bg-green-500 hover:bg-green-600 shadow-[0_4px_0_#15803d]"
                      }`}
                  >
                    {bankStore.entryCreating ? "Загрузка..." : "Оплатить 2 TON"}
                  </button>

                  {bankStore.entryError && (
                      <div className="text-sm text-red-600 shantell text-center">
                        {bankStore.entryError}
                      </div>
                  )}
                </>
            ) : (
                /* ЭКРАН 2: ОЖИДАНИЕ/ОПЛАТА */
                <div className="w-full space-y-4">
                  <p className="text-center text-amber-800 font-medium shantell">
                    Нажмите кнопку ниже и подтвердите оплату в кошельке.
                  </p>

                  <div className="flex flex-col gap-2 items-center">
                    {!wallet ? (
                        <TonConnectButton />
                    ) : (
                        <button
                            onClick={handleWalletPay}
                            className="w-full py-3 rounded-xl font-bold text-lg shantell text-white bg-blue-600 hover:bg-blue-700 transition"
                        >
                          Оплатить через TonConnect
                        </button>
                    )}
                  </div>

                  <div className="text-center mt-2">
                    <div className="flex items-center justify-center gap-2">
                      <div
                          className={`w-3 h-3 rounded-full ${
                              isExpired || isCancelled ? "bg-red-500" : "bg-green-500"
                          } ${!isExpired && !isCancelled ? "animate-pulse" : ""}`}
                      ></div>
                      <span
                          className={`font-bold text-sm shantell ${
                              isExpired || isCancelled ? "text-red-700" : "text-green-700"
                          }`}
                      >
                    {statusText}
                  </span>
                    </div>
                    <p className="text-xs text-amber-600/70 mt-1">
                      Если долго не проходит — нажмите «Обновить статус»
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                        onClick={handleRefreshStatus}
                        disabled={manualRefreshing}
                        className={`flex-1 py-2 rounded-xl font-bold shantell text-white transition ${
                            manualRefreshing ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"
                        }`}
                    >
                      {manualRefreshing ? "Обновляем..." : "Обновить статус"}
                    </button>

                    <button
                        onClick={handleCreateOrder}
                        className="flex-1 py-2 rounded-xl font-bold shantell text-white bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      Создать новый ордер
                    </button>
                  </div>

                  {bankStore.entryError && (
                      <div className="text-sm text-red-600 shantell text-center">
                        {bankStore.entryError}
                      </div>
                  )}

                  {/* БЛОК ТЕХПОДДЕРЖКИ: появляется через 5 минут после sendTransaction */}
                  {showSupportBlock && (
                      <div className="w-full mt-3 pt-3 border-t border-amber-300">
                        <div className="text-center text-sm text-amber-800 shantell font-bold">
                          Оплата прошла, но доступ не открылся?
                        </div>
                        <div className="text-center text-xs text-amber-700 shantell mt-1">
                          Если прошло больше 5 минут — напишите в техподдержку и пришлите вашу реф‑ссылку (или Telegram ID).
                        </div>

                        <div className="mt-2 bg-white rounded-xl px-3 py-2 border-2 border-amber-200 text-center">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                            Реф‑ссылка для поддержки
                          </div>
                          <div className="text-xs font-mono text-blue-700 break-all select-all">
                            {referralLink || "Загрузка ссылки..."}
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <button
                              disabled={!referralLink}
                              onClick={() => copy(referralLink)}
                              className={`py-2 rounded-xl font-bold shantell text-white transition ${
                                  referralLink ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-400"
                              }`}
                          >
                            Скопировать ссылку
                          </button>

                          <button
                              onClick={() => copy(tgIdStr)}
                              className="py-2 rounded-xl font-bold shantell text-white bg-slate-700 hover:bg-slate-800 transition"
                          >
                            Скопировать ID
                          </button>
                        </div>

                        <a
                            href={SUPPORT_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block w-full text-center py-2 rounded-xl font-bold shantell text-white bg-blue-600 hover:bg-blue-700 transition"
                        >
                          Написать в техподдержку
                        </a>
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  );
});

export default EntryFeeOverlay;