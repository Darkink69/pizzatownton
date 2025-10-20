import { useEffect, useState } from 'react';
import store from "../store/store";

const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Небольшая задержка перед началом анимации исчезновения
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800); // Начинаем скрывать за 200ms до окончания 2 секунд

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 bg-[#FFBC6B] z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="slow-spin-animation rounded-full">
        <img 
          src={`${store.imgUrl}pizza_big_logo.png`} 
          alt="Loading..." 
          className="w-70 "
        />
      </div>
    </div>
  );
};

export default Preloader;