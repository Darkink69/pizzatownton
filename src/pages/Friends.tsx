import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import store from "../store/store";
import Footer from "../components/Footer";
import {PCOIN_PERCENTS, PDOLLAR_PERCENTS} from "../utils/referral";
import {useTranslation} from "react-i18next";

const Friends = observer(() => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const {t} = useTranslation();


  // -------------------- запросим статистику при загрузке --------------------
  useEffect(() => {
    if (store.sessionId && store.user?.telegramId) {
      console.log("📨 Requesting staff info...");
      store.requestReferralInfo();
    }
  }, [store.sessionId, store.user?.telegramId]);


  const toNum = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    const n = typeof v === "string" ? Number(v) : (v as number);
    return Number.isFinite(n) ? n : 0;
  };

  const {
    link,
    earnedPcoin = 0,
    earnedPdollar = 0,
    levels = [],
  } = store.referral as any;

  const levelsNormalized = Array.from({ length: 7 }, (_, i) => {
    const level = i + 1;
    const row = Array.isArray(levels)
        ? levels.find((x: any) => Number(x.level) === level)
        : null;

    return {
      level,
      countRef: toNum(row?.countRef ?? 0),
      pcoin: toNum(row?.earnedPcoin ?? row?.pcoin ?? 0),
      pdollar: toNum(row?.earnedPdollar ?? row?.pdollar ?? 0),
    };
  });

  const totalFromLevels = levelsNormalized.reduce((sum, r) => sum + r.countRef, 0);

  // -------------------- копирование ссылки --------------------
  function tryExecCommandCopy(text: string): boolean {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.readOnly = true;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function tryClipboardCopy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  const handleCopy = async () => {
    const link = store.referral.link;
    if (!link) return;

    let ok = tryExecCommandCopy(link);
    if (!ok) ok = await tryClipboardCopy(link);

    if (ok) {
      setCopied(true);
      // вернём в исходное состояние через 600мс
      setTimeout(() => setCopied(false), 600);
    }
  };


  return (
      <>
        <div className="relative min-h-screen w-full overflow-hidden">

          {/* фон */}
          <div className="absolute inset-0 bg-[#FFBC6B]">
            <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{backgroundImage: `url('${store.imgUrl}bg_pizza.png')`}}
            />
          </div>

          {/* «тесто» шапка */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1550px]">
            <img
                src={`${store.imgUrl}testo.png`}
                alt={t('tasks.alts.testo')}
                className="w-full h-auto"
            />
          </div>

          {/* картинка друзей */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
            <img src={`${store.imgUrl}img_friends.png`} alt={t('friends.statistics.friends')}/>
          </div>

          {/* окно */}
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="relative w-11/12 max-w-md h-[80vh]">
              {/* фон */}
              <img
                  src={`${store.imgUrl}img_window2.png`}
                  alt={t("friends.alts.modal_background")}
                  className="absolute inset-0 w-full h-full object-fill"
              />

              {/* контент + скролл */}
              <div className="relative h-full flex flex-col p-4 sm:p-5 pr-2 overflow-y-auto">
                {/* заголовок */}
                <div className="text-center text-lg sm:text-2xl mb-2 text-amber-800 shantell font-bold">
                  {t("friends.title")}
                </div>

                {/* ссылка */}
                <input
                    ref={inputRef}
                    type="text"
                    value={link || t("common.notifications.loading")}
                    readOnly
                    onFocus={(e) => e.currentTarget.select()}
                    className="bg-white rounded-xl px-4 py-3 mb-4 border-2 border-amber-800 shadow-inner text-center font-bold text-base sm:text-lg text-amber-800 shantell truncate"
                    placeholder={t("friends.referral_link")}
                />

                {/* кнопка копировать */}
                <button
                    className={`relative w-full flex justify-center mb-4 transition-all duration-200 ${
                        copied ? "brightness-125" : "brightness-100"
                    }`}
                    onClick={handleCopy}
                    disabled={!link}
                >
                  <img
                      src={`${store.imgUrl}b_yellow.png`}
                      alt={t('friends.alts.copy_button_alt')}
                      className="w-1/2 h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-800 text-lg sm:text-xl shantell">
                    {t('friends.copy_button')}
                  </span>
                  </div>
                </button>

                {/* описание */}
                <div className="text-center mb-5 text-amber-800 font-bold text-base sm:text-lg shantell leading-tight">
                  {t('friends.description')}
                  <img
                      src={`${store.imgUrl}icon_dollar_coin.png`}
                      alt={t('common.labels.pcoin')}
                      className="w-6 sm:w-8 inline-block mx-1"
                  />
                  {t('common.labels.pdollar')}
                  <img
                      src={`${store.imgUrl}icon_dollar.png`}
                      alt={t('common.labels.pdollar')}
                      className="w-8 sm:w-10 inline-block mx-1"
                  />
                </div>

                {/* заголовок статистики */}
                <div className="text-center font-bold text-lg sm:text-2xl mb-5 text-amber-800 shantell">
                  {t('friends.subtitle')}
                </div>

                {/* три блока статистики */}
                <div className="flex justify-between gap-3">
                  <StatBlock
                      icon={`${store.imgUrl}icon_dollar.png`}
                      value={`+${(earnedPdollar ?? 0).toLocaleString()}`}
                      // label={t('common.labels.pdollar')}
                  />
                  <StatBlock
                      icon={`${store.imgUrl}icon_dollar_coin.png`}
                      value={`+${(earnedPcoin ?? 0).toLocaleString()}`}
                      // label={t('common.labels.pcoin')}
                  />
                  <StatBlock
                      icon={`${store.imgUrl}icon_friends.png`}
                      value={`+${totalFromLevels}`}
                      // label={t('friends.statistics.friends')}
                  />
                </div>

                {/* детализация по уровням */}
                <div className="mt-4">
                  <div className="text-center font-bold text-base sm:text-lg mb-2 text-amber-800 shantell">
                    {t("friends.levels.title")}
                  </div>

                  <div className="bg-white/70 rounded-xl border-2 border-amber-800 p-3">
                    {/* header */}
                    <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-bold text-amber-800 shantell mb-2">
                      <div>{t("friends.levels.cols.level")}</div>
                      <div>{t("friends.levels.cols.friends")}</div>
                      <div>{t("friends.levels.cols.pcoin")}</div>
                      <div>{t("friends.levels.cols.pdollar")}</div>
                      <div>{t("friends.levels.cols.percent")}</div>
                    </div>

                    {levelsNormalized.map((r) => {
                      const pcoinPct = PCOIN_PERCENTS[r.level] ?? 0;
                      const pdollarPct = PDOLLAR_PERCENTS[r.level] ?? 0;

                      const pctLabel =
                          (pcoinPct ? `PC ${pcoinPct}%` : "") +
                          (pcoinPct && pdollarPct ? " / " : "") +
                          (pdollarPct ? `PD ${pdollarPct}%` : "");

                      return (
                          <div
                              key={r.level}
                              className="grid grid-cols-5 gap-2 text-xs sm:text-sm text-amber-900 shantell py-1 border-t border-amber-800/30"
                          >
                            <div className="font-bold">{r.level}</div>
                            <div>{r.countRef}</div>
                            <div>{r.pcoin.toLocaleString()}</div>
                            <div>{r.pdollar.toLocaleString()}</div>
                            <div className="text-amber-800 font-bold">{pctLabel || "—"}</div>
                          </div>
                      );
                    })}
                  </div>

                  {/* подсказка по правилам */}
                  <div className="mt-2 text-center text-xs sm:text-sm text-amber-800 shantell">
                    {t("friends.levels.hint")}
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        <Footer/>

      </>
  );
});

function StatBlock({icon, value}: { icon: string; value: string }) {
  return (
      <div className="relative flex-1">
        <img
            src={`${store.imgUrl}b_white.png`}
            alt="bg"
            className="w-full h-auto"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-3 px-2 py-1">
          <img src={icon} alt="icon" className="w-8 sm:w-10 inline-block"/>
          <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
          {value}
        </span>
        </div>
      </div>
  );
}

export default Friends;
