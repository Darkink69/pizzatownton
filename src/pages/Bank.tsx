import { useState } from "react";
import store from "../store/store";

function Bank() {
  const [tonAmount, setTonAmount] = useState('0,01');
  const [pcoinAmount, setPcoinAmount] = useState('500');
  const [pdollarAmount, setPdollarAmount] = useState('100');
  const [tonExchangeAmount, setTonExchangeAmount] = useState('0,02');

  const handleBuy = () => {
    alert(`Вы купили ${pcoinAmount} PCOIN за ${tonAmount} TON`);
  };

  const handleExchange = () => {
    alert(`Вы обменяли ${pdollarAmount} PDOLLAR на ${tonExchangeAmount} TON`);
  };

  const exchangeBlocks = [
    {
      id: 1,
      type: "buy",
      title: "ПОКУПКА МОНЕТ",
      topCurrency: {
        name: "TON",
        icon: "icon_ton.png",
        balance: "0.04",
        value: tonAmount,
        setValue: setTonAmount
      },
      bottomCurrency: {
        name: "PCOIN", 
        icon: "icon_dollar_coin.png",
        value: pcoinAmount,
        setValue: setPcoinAmount
      },
      rate: "0.00002 TON за 1",
      buttonText: "КУПИТЬ",
      buttonBg: "b_blue2.png",
      onAction: handleBuy
    },
    {
      id: 2,
      type: "exchange",
      title: "ОБМЕННИК",
      topCurrency: {
        name: "Pdollar",
        icon: "icon_dollar.png",
        balance: "150",
        value: pdollarAmount,
        setValue: setPdollarAmount
      },
      bottomCurrency: {
        name: "TON",
        icon: "icon_ton.png",
        value: tonExchangeAmount,
        setValue: setTonExchangeAmount
      },
      rate: "0.5 PDOLLAR за 1 TON",
      buttonText: "ОБМЕНЯТЬ",
      buttonBg: "b_blue2.png",
      onAction: handleExchange
    }
  ];

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
          <img
            src={`${store.imgUrl}img_bank.png`}
            alt="bank"
          />
        </div>

        {/* Контейнер для скролла */}
        <div className="relative z-30 h-screen flex flex-col pt-25 pb-20">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 py-4">
              {exchangeBlocks.map((block) => (
                <div key={block.id} className="w-11/12 max-w-md">
                  <div className="relative">
                    {/* Фон модального окна */}
                    <img 
                      src={`${store.imgUrl}img_window2.png`} 
                      alt="Modal background" 
                      className="w-full h-auto object-contain"
                    />
                    
                    {/* Контент поверх фона */}
                    <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-5">
                      
                      <div className="text-center text-lg sm:text-2xl mb-2 sm:mb-3 text-amber-800 shantell leading-tight tracking-wide">
                        {block.title}
                      </div>

                      {/* Верхний блок валюты */}
                      <div className="">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={`${store.imgUrl}${block.topCurrency.icon}`} 
                              alt={block.topCurrency.name} 
                              className="w-6 h-auto sm:w-8 inline-block"
                            />                    
                            <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
                              {block.topCurrency.name}
                            </span>
                          </div>
                          <div className="font-bold text-base sm:text-lg text-amber-800 shantell">
                            Баланс: {block.topCurrency.balance}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                            <input
                              type="text"
                              value={block.topCurrency.value}
                              onChange={(e) => block.topCurrency.setValue(e.target.value)}
                              className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Стрелка вниз */}
                      <div className="text-center">
                        <img 
                          src={`${store.imgUrl}icon_arrow_down.png`} 
                          alt="down" 
                          className="w-6 h-auto sm:w-8 inline-block"
                        /> 
                      </div>

                      {/* Нижний блок валюты */}
                      <div className="">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={`${store.imgUrl}${block.bottomCurrency.icon}`} 
                            alt={block.bottomCurrency.name} 
                            className="w-6 h-6 sm:w-8 sm:h-8"
                          />
                          <span className="font-bold text-lg sm:text-xl text-amber-800 shantell">
                            {block.bottomCurrency.name}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="bg-white rounded-xl px-4 py-4 mb-2 sm:mb-3 border-2 border-amber-800 shadow-inner text-center text-base sm:text-lg text-amber-800 shantell">
                            <input
                              type="text"
                              value={block.bottomCurrency.value}
                              onChange={(e) => block.bottomCurrency.setValue(e.target.value)}
                              className="absolute inset-0 bg-transparent w-full px-4 py-2 text-center font-bold text-lg sm:text-xl text-amber-800 shantell border-none outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Курс обмена */}
                      <div className="text-center mb-4 sm:mb-6 font-bold text-base sm:text-lg text-amber-800 shantell flex items-center justify-center">
                        {block.rate}
                        {block.type === "buy" && (
                          <img 
                            src={`${store.imgUrl}icon_dollar_coin.png`} 
                            alt="PCOIN" 
                            className="w-6 h-6 sm:w-8 sm:h-8 ml-1 mr-1"
                          />
                        )}
                      </div>

                      {/* Кнопка действия */}
                      <button
                        onClick={block.onAction}
                        className="relative w-full flex justify-center hover:opacity-90 transition-opacity"
                      >
                        <img 
                          src={`${store.imgUrl}${block.buttonBg}`} 
                          alt={block.buttonText} 
                          className="w-1/3 h-auto"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-blue-900 text-md sm:text-lg shantell">
                            {block.buttonText}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Bank;