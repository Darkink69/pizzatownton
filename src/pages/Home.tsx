import store from "../store/store";

function Home() {
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

        <div className="relative z-30 shantell pt-40 text-center text-white text-4xl">
          Home Page
        </div>
      </div>
    </>
  );
}

export default Home;
