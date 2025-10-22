import { useState } from "react";
import store from "../store/store";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floors] = useState(7); // Количество этажей

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Функция для определения изображения этажа
  const getFloorImage = (index: number) => {
    if (index === 0) return "img_roof.png"; // Крыша (первая ячейка)
    if (index === floors - 1) return "img_first_floor.png"; // Первый этаж (последняя ячейка)
    if (index === floors - 2) return "img_floor_empty.png"; // Этаж с дыркой для видео
    return "img_floor_dark.png"; // Остальные этажи
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFBC6B]">
          {/* Фоновая картинка */}
          <div
            className="
            w-full h-full
          bg-cover bg-center bg-no-repeat
          /* Мобильная версия - обрезаем до 70% ширины */
          sm:bg-auto sm:bg-center
          md:bg-auto md:bg-center
          lg:bg-contain lg:bg-center
          "
            style={{
              backgroundImage: `url('${store.imgUrl}bg_house_people.jpg')`,
            }}
          />
        </div>

        {/* Grid этажей дома */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-[50%]">
          <div className="flex flex-col items-center relative">
            {Array.from({ length: floors }, (_, index) => (
              <div
                key={index}
                className="w-full flex justify-center relative"
                style={{
                  marginBottom: index === floors - 1 ? "0" : "-2px",
                }}
              >
                {/* Фон этажа */}
                <img
                  src={`${store.imgUrl}${getFloorImage(index)}`}
                  alt={`Этаж ${floors - index}`}
                  className="w-full max-w-md object-contain"
                />

                {/* Видео chif.mp4 на этаже с img_floor_empty.png */}
                {index === floors - 2 && (
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

                    {/* Статистика этажа - только на этаже с видео */}
                    <div className="absolute -top-10 left-1/3 transform -translate-x-1/2 translate-y-1/2 z-40 w-4/5 max-w-xs">
                      <div className="flex items-center relative">
                        <img
                          src={`${store.imgUrl}img_block_mini.png`}
                          alt="Background"
                          className="w-full h-auto object-contain"
                        />

                        {/* Контент поверх фона */}
                        <div className="absolute inset-0 flex items-center p-2 sm:p-2">
                          {/* Левая часть - название этажа и уровня */}
                          <div className="flex-1 px-2 sm:px-4 text-xs sm:text-sm text-amber-800 shantell text-center leading-3">
                            Этаж 1 - Уровень 1
                          </div>

                          {/* Звезды */}
                          <div className="flex items-center gap-1 mr-2 sm:mr-4">
                            <img
                              src={`${store.imgUrl}icon_star.png`}
                              alt="Star"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <img
                              src={`${store.imgUrl}icon_star_empty.png`}
                              alt="Empty star"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <img
                              src={`${store.imgUrl}icon_star_empty.png`}
                              alt="Empty star"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <img
                              src={`${store.imgUrl}icon_star_empty.png`}
                              alt="Empty star"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <img
                              src={`${store.imgUrl}icon_star_empty.png`}
                              alt="Empty star"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                          </div>

                          {/* Правая часть - стоимость улучшения */}
                          <div className="relative  translate-x-[40px]">
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
                                625
                              </span>
                              <img
                                src={`${store.imgUrl}icon_arrow.png`}
                                alt="Upgrade"
                                className="w-8 sm:w-12"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Видео лифта - позиционируется относительно всего грида */}
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

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src={`${store.imgUrl}testo.png`}
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}pizza_logo.png`}
            alt="Pizza Logo"
            className="w-70 sm:w-100"
          />
        </div>
        <div className="fixed bottom-40 left-1/2 w-20 transform -translate-x-1/2 z-20 hover:opacity-90 transition-opacity">
          <img src={`${store.imgUrl}b_red_mini.png`} alt="red" />
          <div className="absolute inset-0 flex items-center justify-center text-md text-white shantell">
            0%
            <span>
              <img
                src={`${store.imgUrl}icon_dollar.png`}
                alt="icon_dollar"
                className="w-10"
              />
            </span>
          </div>
        </div>

        {/* Кнопка для открытия модального окна */}
        <button
          onClick={handleOpenModal}
          className="fixed bottom-20 left-1/2 w-50 sm:w-80 transform -translate-x-1/2 z-20 hover:opacity-90 transition-opacity"
        >
          <img src={`${store.imgUrl}b_zabrat.png`} alt="Zabrat" />
        </button>

        {/* Затемнение экрана и модальное окно */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black opacity-70 z-40"
              onClick={handleCloseModal}
            />

            {/* Модальное окно */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md">
              <div className="relative">
                {/* Фон модального окна */}
                <img
                  src={`${store.imgUrl}img_window.png`}
                  alt="Modal background"
                  className="w-full h-auto object-contain"
                />

                <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                  <div className="text-center mb-4 mt-2 sm:mt-4">
                    <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 shantell text-center text-sm sm:text-md text-amber-800 font-bold py-1 inline-block">
                      ЭТАЖ 1 - УРОВЕНЬ 1
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
                      <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1">
                        Поваров:
                      </div>
                      <div className="font-bold text-base sm:text-lg text-amber-800 shantell mx-2 sm:mx-4">
                        0 / 5
                      </div>
                      <div className="relative w-16 sm:w-20">
                        <img
                          src={`${store.imgUrl}b_yellow.png`}
                          alt="Добавить повара"
                          className="w-full h-auto"
                        />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-sm sm:text-base shantell">
                          +1
                        </span>
                      </div>
                    </div>

                    {/* Доходность Этажа */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                        Доходность этажа:
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

                    {/* Общая Доходность */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base sm:text-lg text-amber-800 shantell leading-4 flex-1">
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

                  {/* Кнопка улучшения */}
                  <div className="mt-auto px-2">
                    <button className="relative w-full hover:opacity-90 transition-opacity">
                      <img
                        src={`${store.imgUrl}b_red.png`}
                        alt="Улучшить этаж"
                        className="w-full h-auto"
                      />

                      <div className="absolute inset-0 flex items-center justify-between ">
                        <div className="text-white text-sm sm:text-base shantell flex-1 text-center">
                          Этаж 1 - Улучшить <br></br>до уровня 1
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 mx-2">
                          <img
                            src={`${store.imgUrl}icon_dollar_coin.png`}
                            alt="dollar"
                            className="w-8 h-auto sm:w-10"
                          />
                          <span className="text-white text-sm sm:text-base shantell font-bold">
                            625
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
                    {/* SVG код остался без изменений */}
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Home;
