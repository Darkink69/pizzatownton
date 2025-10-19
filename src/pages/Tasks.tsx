import { useState } from "react";
import store from "../store/store";

function Tasks() {
  const [showDailyCombo, setShowDailyCombo] = useState(false);

  const taskBlocks = [
    {
      id: 1,
      title: "Пригласить 1 друга",
      reward: "500",
      buttonText: "ВЫПОЛНИТЬ",
      buttonBg: "b_red_small.png" 
    },
    {
      id: 2,
      title: "Достигнуть уровень 2",
      reward: "750",
      buttonText: "ЗАБРАТЬ",
      buttonBg: "b_blue_small.png" 
    },
    {
      id: 3,
      title: "Достигнуть уровень 3", 
      reward: "1000",
      buttonText: "ЗАБРАТЬ",
      buttonBg: "b_blue_small.png" 
    },
  ];

  const handleDailyComboClick = () => {
    setShowDailyCombo(!showDailyCombo);
  };

  const pizzaList = [
    "NewYork", "California", "Neapolitan", "Sicilian",
    "Margarita", "4 cheeses", "Mozzarella", "Bacon", 
    "Vegetarian", "Shrimp", "Pepperoni", "Chili",
    "Hawaii", "Mushroom", "BBQ", "Chiken"
  ];

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFBC6B]">
          {/* Фоновая картинка */}
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
          <img
            src={`${store.imgUrl}img_task_list.png`}
            alt="tasks"
          />
        </div>

        {/* Контейнер для скролла */}
        <div className="relative z-30 h-screen flex flex-col">
          {/* Фиксированная верхняя часть */}
          <div className="flex-shrink-0 pt-25">
            {/* Можно добавить дополнительный контент здесь если нужно */}
          </div>

          {/* Прокручиваемая область с блоками заданий */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 py-4">
              {taskBlocks.map((block) => (
                <div 
                  key={block.id}
                  className="w-11/12 max-w-md"
                >
                  <div className="relative">
                    <img 
                      src={`${store.imgUrl}img_block.png`} 
                      alt="Task block" 
                      className="w-full h-auto object-contain"
                    />
                    
                    <div className="absolute inset-0 flex flex-col p-4 sm:p-6 md:p-8">
                      <div className="space-y-0 sm:space-y-1 px-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-base sm:text-lg text-amber-800 shantell flex-1 leading-4">
                            {block.title}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 mx-2 sm:mx-4">
                            <span className="font-bold text-base sm:text-lg text-amber-800 shantell">
                              {block.reward}
                            </span>
                            <img 
                              src={`${store.imgUrl}icon_dollar.png`} 
                              alt="dollar" 
                              className="w-8 h-auto sm:w-10"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto px-2">
                        <button className="relative w-full hover:opacity-90 transition-opacity">
                          <img 
                            src={`${store.imgUrl}${block.buttonBg}`} 
                            alt="Выполнить задачу" 
                            className="w-full h-auto"
                          />
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-sm sm:text-base shantell">
                              {block.buttonText}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Кнопка Daily Combo в скролле */}
              <button 
                onClick={handleDailyComboClick}
                className="flex justify-center w-11/12 max-w-md hover:opacity-90 transition-opacity"
              >
                <img src={`${store.imgUrl}b_daily_combo.png`} alt="combo" className=" w-1/2 h-auto" />
              </button>

              {/* Блок Daily Combo */}
              {showDailyCombo && (
                <>
                  <div className="w-11/12 max-w-md">
                    <div className="relative">
                      
                      <div className="absolute inset-0 flex flex-col">

                        {/* Grid 4x4 с пиццами */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                          {pizzaList.map((pizzaName, index) => (
                            <div key={index} className="flex flex-col items-center"
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

                    <div className="relative">
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
                              <span className="font-bold text-2xl sm:text-3xl text-amber-800 shantell ">
                                1000
                             <img 
                                src={`${store.imgUrl}icon_dollar.png`} 
                                alt="dollar" 
                                className="ml-2 inline-block w-12 h-auto sm:w-18"
                              />
                              </span>
 
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto px-2">
                        </div>
                      </div>
                    </div>

                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Отступ для футера */}
          <div className="flex-shrink-0 pb-20"></div>
        </div>
      </div>
    </>
  );
}

export default Tasks;