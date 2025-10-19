import { useState } from "react";
import store from "../store/store";



function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
              backgroundImage: `url('${store.imgUrl}bg_house_people.png')`,
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

        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src={`${store.imgUrl}pizza_logo.png`}
            alt="Pizza Logo"
            className="w-70 sm:w-100"
          />
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
                <span className="ont-bold text-base sm:text-lg text-amber-800 shantell">0</span>
                <img 
                  src={`${store.imgUrl}icon_dollar.png`} 
                  alt="dollar" 
                  className="w-8 h-auto sm:w-10"
                />
                <span className="font-bold text-base sm:text-lg text-amber-800 shantell">/ час</span>
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
                <span className="ont-bold text-base sm:text-lg text-amber-800 shantell">0</span>
                <img 
                  src={`${store.imgUrl}icon_dollar.png`} 
                  alt="dollar" 
                  className="w-8 h-auto sm:w-10"
                />
                <span className="font-bold text-base sm:text-lg text-amber-800 shantell">/ час</span>
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
              <span className="text-white text-sm sm:text-base shantell font-bold">625</span>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_2679_1208)">
          <path d="M8.43227 23.4387C8.67848 23.5273 8.93453 23.5765 9.18566 23.6455C9.44171 23.7095 9.68299 23.7833 9.95874 23.8129L10.6038 23.9064L10.9239 23.9508L11.2144 23.9655L11.8003 23.9902L11.9481 23.9951L12.0219 24H12.1352L12.4503 23.9852C12.8689 23.9557 13.2874 23.9606 13.701 23.8769C14.1147 23.808 14.5283 23.7587 14.9321 23.6356C16.5521 23.2269 18.0786 22.4686 19.3834 21.4346C20.6834 20.4005 21.7765 19.1005 22.5299 17.6233L22.7958 17.062C22.8795 16.8748 22.978 16.6927 23.042 16.4908L23.2488 15.9048L23.3523 15.6143C23.3818 15.5158 23.4015 15.4124 23.431 15.3139L23.5788 14.7132C23.6034 14.6098 23.6329 14.5162 23.6477 14.4079L23.692 14.0927C23.7462 13.6742 23.825 13.2409 23.825 12.8617C23.9924 11.414 23.8791 9.87772 23.4606 8.43496C23.047 6.98236 22.333 5.60854 21.3777 4.41691C20.4224 3.22528 19.2308 2.21584 17.8816 1.4723L16.8426 0.965121C16.4832 0.827247 16.1188 0.694296 15.7593 0.561346C15.39 0.453016 15.0158 0.364382 14.6415 0.265901C14.2575 0.187115 13.8488 0.137874 13.4548 0.0787854L13.3071 0.059089L13.1742 0.0492409L12.9083 0.0344686L12.3765 0.00984817L12.2435 0.00492409L12.1795 0H12.0564L11.7659 0.0147723L11.175 0.0344686L10.8845 0.0492409C10.7909 0.059089 10.6924 0.0787854 10.5989 0.0886336L10.0277 0.182191C9.6436 0.226508 9.27429 0.344686 8.90006 0.438244C7.41299 0.846943 6.0047 1.55109 4.78352 2.49159C3.55743 3.42716 2.51844 4.5991 1.72567 5.91875C1.62718 6.08617 1.51885 6.24374 1.43514 6.41609L1.18402 6.93312C1.10523 7.10546 1.01167 7.2778 0.937811 7.45507L0.735924 7.99672C0.671911 8.17891 0.598049 8.35618 0.53896 8.53837L0.391238 9.09479L0.243515 9.65614L0.145033 10.2519C0.0219311 10.8527 0.18935 11.6159 0.287832 11.8769C0.509416 12.3792 0.726076 11.7538 0.952584 10.8034C1.3859 9.23759 2.11959 7.66188 3.18319 6.24374C3.3063 6.06155 3.46879 5.90398 3.60667 5.73164L3.82333 5.47558L3.93166 5.34756L4.04983 5.22938C4.2074 5.07181 4.3699 4.91424 4.52747 4.75174L4.64565 4.63357L4.7786 4.52524L5.03958 4.30858C5.37441 4.00328 5.75849 3.75708 6.13272 3.49118C6.31491 3.3533 6.52665 3.25975 6.71869 3.14157C6.91565 3.02831 7.10769 2.90029 7.31943 2.81658C8.29932 2.3094 9.37277 2.00903 10.4561 1.85146C10.7269 1.82191 10.9977 1.76282 11.2735 1.76775L11.6822 1.75297L11.889 1.74805L11.9924 1.74313H12.0761L12.9329 1.80222L13.1545 1.81699C13.2283 1.82191 13.2874 1.83668 13.3514 1.84653L13.7404 1.91547L14.1294 1.97948C14.2575 2.0041 14.3904 2.04842 14.5234 2.08289L14.9173 2.19122C15.0502 2.22569 15.1783 2.26016 15.3063 2.31432L16.0646 2.60484C16.3108 2.72302 16.5521 2.84612 16.7934 2.96922C17.7486 3.48625 18.6202 4.14608 19.3736 4.91916C20.127 5.69717 20.7376 6.6032 21.2152 7.56832L21.3875 7.9327L21.4762 8.1149L21.5451 8.30694L21.8209 9.06524L22.0178 9.84817C22.0326 9.91219 22.0523 9.9762 22.0671 10.0451L22.0966 10.247L22.1557 10.6459L22.2197 11.0447L22.2394 11.4485L22.2591 11.8523L22.269 12.0542V12.1182L22.264 12.2265L22.2246 13.1079C22.1951 13.3787 22.1459 13.62 22.1163 13.881C21.9341 14.92 21.5944 15.9787 21.1019 16.9438C20.5603 17.8744 19.8857 18.7214 19.1028 19.4551C16.6309 21.7989 12.9674 22.7345 9.69284 21.9073L9.08225 21.7497L8.48644 21.533L8.19099 21.4247C8.09251 21.3853 7.99895 21.3361 7.90539 21.2918L7.3342 21.0209C6.60051 20.6073 5.88159 20.1543 5.26116 19.5782C4.93125 19.3123 4.65057 18.9922 4.36005 18.6869C4.20741 18.5392 4.09415 18.357 3.95628 18.1945C3.82825 18.0222 3.68545 17.8695 3.5722 17.6873C3.35061 17.3279 3.09456 16.9832 2.91729 16.5942C2.82374 16.4021 2.71541 16.2199 2.62677 16.023L2.39042 15.437C1.66658 13.6348 1.57302 11.9508 1.09046 12.0985C0.88857 12.1674 0.731 12.581 0.637442 13.2753C0.627594 13.62 0.62267 14.0336 0.666987 14.5014C0.706379 14.7329 0.750696 14.9791 0.799937 15.2351C0.829481 15.3632 0.849178 15.4961 0.88857 15.6291C0.932887 15.7571 0.977204 15.89 1.02152 16.0279C1.32189 17.0127 1.8143 17.9237 2.35595 18.8002C2.66124 19.2187 2.94191 19.652 3.30137 20.0312L3.55743 20.3217C3.64113 20.4202 3.72977 20.5187 3.82333 20.6024L4.3896 21.1342C5.17745 21.8039 6.03424 22.4194 6.98459 22.8527C7.44745 23.094 7.94479 23.2565 8.43227 23.4387Z" fill="white"/>
          <path d="M9.31777 13.684C9.20944 13.8711 9.24883 14.1518 9.57382 14.4571C9.87419 14.7328 10.1893 14.8412 10.3715 14.7279C10.7014 14.5162 11.0412 14.3094 11.3071 14.0287C11.5435 13.7825 11.7601 13.5117 11.9719 13.2458C12.4593 13.9598 13.1832 14.4522 13.7199 15.1169C13.7494 15.1563 13.9267 15.0923 14.0301 15.0234C14.232 14.8904 14.3354 14.6984 14.3748 14.5211C14.5127 13.9401 14.3994 13.5117 14.168 13.1965C13.9021 12.8371 13.651 12.4678 13.3752 12.1182C14.0252 11.6356 14.4979 10.9659 15.1233 10.4587C15.1627 10.4292 15.0986 10.2519 15.0297 10.1485C14.8968 9.94663 14.7047 9.84322 14.5275 9.80383C13.9464 9.66596 13.518 9.77921 13.2029 10.0106C12.8434 10.2765 12.4741 10.5277 12.1245 10.8034L12.1196 10.7985C11.6567 10.2224 11.1545 9.68565 10.4946 9.31142C10.3075 9.20309 10.0268 9.24249 9.72155 9.56748C9.4458 9.86784 9.33747 10.183 9.45072 10.3652C9.66246 10.6951 9.86927 11.0349 10.1499 11.3008C10.3961 11.5371 10.662 11.7488 10.9329 11.9655C10.8886 11.9951 10.8442 12.0295 10.7999 12.064C10.2287 12.5219 9.692 13.0242 9.31777 13.684Z" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_2679_1208">
          <rect width="24" height="24" fill="white"/>
          </clipPath>
          </defs>
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
