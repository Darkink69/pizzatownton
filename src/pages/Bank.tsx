function Bank() {
  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFBC6B]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat sm:bg-auto sm:bg-center md:bg-auto md:bg-center lg:bg-contain lg:bg-center"
            style={{
              backgroundImage: `url('https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/bg_pizza.png')`,
            }}
          />
        </div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[2000px] xl:max-w-[1550px]">
          <img
            src="https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/testo.png"
            alt="Testo"
            className="w-full max-w-full h-auto object-cover"
          />
        </div>

        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
          <img
            src="https://s3.twcstorage.ru/c6bae09a-a5938890-9b68-453c-9c54-76c439a70d3e/Pizzatownton/pizza_logo.png"
            alt="Pizza Logo"
            className="w-70 sm:w-100"
          />
        </div>

        <div className="relative z-30 shantell pt-40 text-center text-white text-4xl">
          Bank Page
        </div>
      </div>
    </>
  );
}

export default Bank;
