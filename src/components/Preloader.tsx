import { useEffect, useState } from "react";
import store from "../store/store";

const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Небольшая задержка перед началом анимации исчезновения
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-[#FFBC6B] z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
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
      <div className="slow-spin-animation rounded-full">
        <img
          src={`${store.imgUrl}pizza_big_logo.png`}
          alt="Loading..."
          className="w-max"
        />
      </div>
      <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <img
          src={`${store.imgUrl}img_blue_pizza.png`}
          alt="Pizza Logo"
          className="w-max max-w-md"
        />
      </div>
    </div>
  );
};

export default Preloader;
