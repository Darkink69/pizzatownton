import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import store from "../store/store";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import WebSocketComponent from "../components/websocket";


function Tasks() {
  const [showDailyCombo, setShowDailyCombo] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribedToTeamLove, setIsSubscribedToTeamLove] = useState(false); // ✅ новое состояние
  const [isInviteTaskDone, setIsInviteTaskDone] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);

  // Инициализация выполненных заданий из localStorage
  useEffect(() => {
    const subscribedDone =
      localStorage.getItem("subscribedTaskDone") === "true";
    const subscribedTeamLoveDone =
      localStorage.getItem("subscribedTeamLoveTaskDone") === "true";
    const inviteDone = localStorage.getItem("invite3TaskDone") === "true";

    if (subscribedDone) {
      setIsSubscribed(true);
      setCompletedTaskIds((prev) => [...prev, 1]);
    }

    if (subscribedTeamLoveDone) {
      setIsSubscribedToTeamLove(true);
      setCompletedTaskIds((prev) => [...prev, 3]);
    }

    if (inviteDone) {
      setIsInviteTaskDone(true);
      setCompletedTaskIds((prev) => [...prev, 2]);
    }
  }, []);

  // следим за статусом INVITE_3_FRIENDS из стора:
  useEffect(() => {
    if (store.taskInvite3Status === "rewarded") {
      setIsInviteTaskDone(true);
      localStorage.setItem("invite3TaskDone", "true");
      setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 2), 2]);
    }
  }, [store.taskInvite3Status]);

  useEffect(() => {
    if (
        store.referral.totalReferrals >= 3 &&
        store.taskInvite3Status === "idle"
    ) {
      toast.success("🎉 Вы можете забрать награду за приглашение 3 друзей!");
    }
  }, [store.referral.totalReferrals, store.taskInvite3Status]);

  // выполнение таски подписки на канал Pizza TowerTON
  const handleSubscribe = () => {
    if (isSubscribed) return;

    const tgId = store.user?.telegramId ?? 0;
    toast.info("🔔 Проверяем подписку...");

    const timer = setTimeout(() => {
      const rq = {
        type: "TASKS_COMPLETE" as const,
        requestId: Math.random().toString(36).substring(2, 10),
        session: store.sessionId ?? "",
        taskRq: {
          telegramId: tgId,
          code: "SUBSCRIBE_MAIN_CHANNEL",
        },
      };

      if (store.send(rq)) {
        toast.dismiss();
        toast.success("✅ Подписка подтверждена! Получаем награду...");
        setIsSubscribed(true);
        localStorage.setItem("subscribedTaskDone", "true");
        setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 1), 1]);
      } else {
        toast.error("WebSocket не подключён");
      }
    }, 8000);
    return () => clearTimeout(timer);
  };

  const handleSubscribeToTeamLove = () => {
    if (isSubscribedToTeamLove) return;

    const tgId = store.user?.telegramId ?? 0;
    toast.info("🔔 Проверяем подписку на TEAM LOVE...");

    const timer = setTimeout(() => {
      const rq = {
        type: "TASKS_COMPLETE" as const,
        requestId: Math.random().toString(36).substring(2, 10),
        session: store.sessionId ?? "",
        taskRq: {
          telegramId: tgId,
          code: "SUBSCRIBE_TEAM_LOVE_CHANNEL",
        },
      };

      if (store.send(rq)) {
        toast.dismiss();
        toast.success("✅ Подписка на TEAM LOVE подтверждена!");
        setIsSubscribedToTeamLove(true);
        localStorage.setItem("subscribedTeamLoveTaskDone", "true");
        setCompletedTaskIds((prev) => [...prev.filter((id) => id !== 3), 3]);
      } else {
        toast.error("WebSocket не подключён");
      }
    }, 8000);
    return () => clearTimeout(timer);
  };

  // выполнение таски INVITE_3_FRIENDS (инициируем проверку)
  const handleInvite3Task = () => {
    // если уже получена награда — просто сообщаем
    if (store.taskInvite3Status === "rewarded") {
      toast.info("✅ Награда уже получена!");
      return;
    }

    if (isInviteTaskDone) return;
    if (!store.sessionId || !store.user?.telegramId) {
      toast.error("Авторизуйтесь, чтобы выполнить задание");
      return;
    }

    // если друзей меньше трёх — направляем на страницу друзей
    const totalReferrals = Number(store.referral?.totalReferrals ?? 0);
    if (totalReferrals < 3) {
      toast.info("👇 Пригласите 3 друзей, чтобы забрать награду!");
      window.location.href = "/friends";
      return;
    }

    // если друзей 3+ и все условия выполнены → просто получаем награду
    if (totalReferrals >= 3) {
      toast.success("🎁 Проверяем выполнение и выдаём награду...");
      store.verifyInvite3Task();
    }


  };

  const taskBlocks = [
    {
      id: 1,
      title: "Подписаться на официальный канал",
      rewardPizza: "1000",
      link: "https://t.me/pizzatowerton",
      buttonText: isSubscribed ? "ВЫПОЛНЕНО" : "ПЕРЕЙТИ",
      buttonBg: isSubscribed ? "b_blue_small.png" : "b_red_small.png",
      onClick: !isSubscribed ? handleSubscribe : undefined,
      disabled: isSubscribed,
      isCompleted: isSubscribed,
    },
    {
      id: 2,
      title: "Пригласи 3 друзей, которые купят 1 этаж",
      rewardPizza: "2000",
      link: "/friends",
      buttonText:
          store.taskInvite3Status === "rewarded"
              ? "ВЫПОЛНЕНО"
              : store.taskInvite3Status === "verified"
                  ? "ЗАБРАТЬ НАГРАДУ"
                  : store.referral.totalReferrals >= 3
                      ? "ЗАБРАТЬ НАГРАДУ"
                      : "ПРИГЛАСИТЬ",
      buttonBg:
          store.taskInvite3Status === "rewarded"
              ? "b_blue_small.png"
              : "b_red_small.png",
      onClick:
          store.taskInvite3Status === "rewarded"
              ? undefined
              : handleInvite3Task,
      disabled: store.taskInvite3Status === "rewarded",
      isCompleted: store.taskInvite3Status === "rewarded",
    },

    {
      id: 3,
      title: "Подписаться на канал MELEGATEAM",
      rewardPizza: "1000",           // было "300"
      rewardPcoin: "30",             // новое поле
      link: "https://t.me/+GlIl1TY4Lsg4MzMx",
      buttonText: isSubscribedToTeamLove ? "ВЫПОЛНЕНО" : "ПЕРЕЙТИ",
      buttonBg: isSubscribedToTeamLove ? "b_blue_small.png" : "b_red_small.png",
      onClick: !isSubscribedToTeamLove ? handleSubscribeToTeamLove : undefined,
      disabled: isSubscribedToTeamLove,
      isCompleted: isSubscribedToTeamLove,
    },
  ];

  // Фильтруем задания, чтобы показывать только невыполненные
  const visibleTaskBlocks = taskBlocks.filter(
    (block) => !completedTaskIds.includes(block.id)
  );

  const handleDailyComboClick = () => {
    setShowDailyCombo(!showDailyCombo);
  };

  const pizzaList = [
    "NewYork",
    "California",
    "Neapolitan",
    "Sicilian",
    "Margarita",
    "4 cheeses",
    "Mozzarella",
    "Bacon",
    "Vegetarian",
    "Shrimp",
    "Pepperoni",
    "Chili",
    "Hawaii",
    "Mushroom",
    "BBQ",
    "Chiken",
  ];

  // Если все задания выполнены, показываем сообщение
  const allTasksCompleted = visibleTaskBlocks.length === 0;

  // Рендерим adsgram-task только если он загружен и не в cooldown-е
  // const shouldRenderAdsgram = isAdsgramLoaded && !isAdsTaskDone;

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

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <img src={`${store.imgUrl}img_task_list.png`} alt="tasks" />
        </div>

        {/* Контейнер для скролла */}
        <div className="relative z-30 h-screen flex flex-col">
          <div className="flex-shrink-0 pt-25"></div>

          {/* Прокручиваемая область с блоками заданий */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 py-4">
              {/* Сообщение, если все задания выполнены */}
              {allTasksCompleted ? (
                <div className="w-11/12 max-w-md mt-10 text-center">
                  <div className="relative">
                    <img
                      src={`${store.imgUrl}img_block.png`}
                      alt="All tasks completed"
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      <img
                        src={`${store.imgUrl}icon_star.png`}
                        alt="Star"
                        className="w-16 h-16 mb-4"
                      />
                      <div className="text-2xl font-bold text-amber-800 shantell mb-2">
                        Все задания выполнены!
                      </div>
                      <div className="text-lg text-amber-700 shantell">
                        Возвращайтесь позже за новыми заданиями
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Показываем только незавершенные задания
                visibleTaskBlocks.map((block) => (
                  <div key={block.id} className="w-11/12 max-w-md">
                    <div className="relative">
                      <img
                        src={`${store.imgUrl}img_block.png`}
                        alt="Task block"
                        className={`w-full h-auto object-contain ${
                          block.id === 1 ? "scale-y-110" : ""
                        }`}
                      />
                      <div className="absolute inset-0 flex flex-col p-2 sm:p-6 md:p-8">
                        <div className="space-y-0 sm:space-y-1 px-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                              {block.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                                  {block.rewardPizza}
                                </span>
                                <img
                                    src={`${store.imgUrl}icon_pizza.png`}
                                    alt="Pizza"
                                    className="w-5 sm:w-6"
                                />
                              </div>
                              {block.rewardPcoin && (
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                                  + {block.rewardPcoin}
                                  </span>
                                  <img
                                      src={`${store.imgUrl}icon_dollar_coin.png`}
                                      alt="Coin"
                                      className="w-5 sm:w-6"
                                  />
                              </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="mt-auto px-2">
                          {block.id === 1 || block.id === 3 ? (
                            block.link ? (
                              <a
                                href={block.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  if (block.onClick) block.onClick();
                                }}
                                className="block"
                              >
                                <button
                                  disabled={block.disabled}
                                  className={`relative w-full transition-opacity ${
                                    block.disabled
                                      ? "opacity-70 cursor-not-allowed"
                                      : "hover:opacity-90 cursor-pointer"
                                  }`}
                                >
                                  <img
                                    src={`${store.imgUrl}${block.buttonBg}`}
                                    alt="Выполнить задачу"
                                    className="w-full h-auto"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-sm sm:text-base shantell font-bold">
                                      {block.buttonText}
                                    </div>
                                  </div>
                                </button>
                              </a>
                            ) : null
                          ) : (
                            <Link to="/friends" className="block">
                              <button
                                disabled={block.disabled}
                                onClick={block.onClick}
                                className={`relative w-full transition-opacity ${
                                  block.disabled
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:opacity-90 cursor-pointer"
                                }`}
                              >
                                <img
                                  src={`${store.imgUrl}${block.buttonBg}`}
                                  alt="Выполнить задачу"
                                  className="w-full h-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-white text-sm sm:text-base shantell font-bold">
                                    {block.buttonText}
                                  </div>
                                </div>
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Кнопка и блок Daily Combo — оставлены, как были */}
              <button
                onClick={handleDailyComboClick}
                className="flex justify-center w-11/12 max-w-md hover:opacity-90 transition-opacity"
              >
                <img
                  src={`${store.imgUrl}b_daily_combo.png`}
                  alt="combo"
                  className="w-1/2 h-auto"
                />
              </button>

              {showDailyCombo && (
                <>
                  <div className="w-11/12 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                          {pizzaList.map((pizzaName, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                              onClick={() => alert(pizzaName)}
                            >
                              <div className="relative aspect-square w-full">
                                <img
                                  src={`${store.imgUrl}img_block_pizza.png`}
                                  alt="Pizza background"
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                  <img
                                    src={`${store.imgUrl}pizza_${pizzaName}.png`}
                                    alt={pizzaName}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                              <div className="text-center mt-1">
                                <span className="text-white text-xs font-bold shantell leading-tight">
                                  {pizzaName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="relative mt-auto">
                          <img
                            src={`${store.imgUrl}img_block.png`}
                            alt="Additional block"
                            className="w-full h-auto object-contain"
                          />
                          <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                            <div className="space-y-0 sm:space-y-1 px-2">
                              <div className="flex items-center justify-between">
                                <img
                                  src={`${store.imgUrl}img_daily_combo.png`}
                                  alt="combo"
                                  className="w-1/3 h-auto"
                                />
                                <div className="flex flex-col gap-1 sm:gap-2 mx-2 sm:mx-4">
                                  <div className="text-right leading-4 text-md sm:text-lg text-amber-800 shantell">
                                    MAX награда
                                  </div>
                                  <span className="font-bold text-2xl sm:text-3xl text-amber-800 shantell">
                                    1000
                                    <img
                                      src={`${store.imgUrl}icon_pizza.png`}
                                      alt="dollar"
                                      className="ml-2 inline-block w-12 h-auto sm:w-18"
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-auto px-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 pb-20"></div>
        </div>
      </div>
      <Footer />
      <WebSocketComponent />
    </>
  );
}

export default Tasks;
