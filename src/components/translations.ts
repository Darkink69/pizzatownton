export type Language = 'ru' | 'en' | 'es';

export interface Translations {
  // === Ключи для Friends.tsx ===
  friends: {
    title: string;
    subtitle: string;
    copyButton: string;
    description: string;
    referralLink: string;
    loading: string;
    statistics: {
      pcoin: string;
      pdollar: string;
      friends: string;
    };
  };
  
  // === Ключи для Bank.tsx и BankOrderModal.tsx ===
  bank: {
    pizza: string;
    pcoin: string;
    pdollar: string;
    buyPcoin: string;
    exchange: string;
    buyButton: string;
    exchangeButton: string;
    createOrder: string;
    howMuchPcoin: string;
    exchangeRate: string;
    tonRate: string;
    pdollarRate: string;
    minAmount: string;
    insufficientFunds: string;
    processing: string;
    buyConfirm: string;
    buySuccess: string;
    tonBalance: string;
  };
  
  // === Ключи для ExchangeModal (в Bank.tsx) ===
  exchangeModal: {
    title: string;
    walletLabel: string;
    amountLabel: string;
    maxAmount: string;
    lastWithdrawal: string;
    confirmButton: string;
    minAmountError: string;
    balanceLabel: string;
    insufficientBalance: string;
    successMessage: string;
    walletAddress: string;
    statusSuccess: string;
  };
  
  // === Ключи для AdminModal (в Bank.tsx) ===
  adminModal: {
    title: string;
    telegramId: string;
    walletAddress: string;
    amountTon: string;
    status: string;
    approved: string;
    pending: string;
    noData: string;
    totalRecords: string;
  };
  
  // === Ключи для BankOrderModal.tsx ===
  orderModal: {
    title: string;
    amountToPay: string;
    amountToCredit: string;
    payWithWallet: string;
    processingNote: string;
  };
  
  // === Ключи для Home.tsx ===
  home: {
    // Звук и музыка
    soundToggleOn: string;
    soundToggleOff: string;
    
    // Уведомления и сообщения
    notificationOkay: string;
    randomNotificationOkay: string;
    incomeCollection: string;
    incomeError: string;
    incomeWarning: string;
    staffLossWarning: string;
    
    // Этажи
    roof: string;
    basement: string;
    floor: string;
    openFloor: string;
    upgradeFloor: string;
    
    // Персонал
    accountant: string;
    hireAccountant: string;
    accountantDescription: string;
    accountantActive: string;
    accountantTimeLeft: string;
    manager: string;
    managerDescription: string;
    guard: string;
    guardDescription: string;
    hire: string;
    upgradeToLevel: string;
    
    // Статистика и доходы
    floorProfit: string;
    floorBalance: string;
    perHour: string;
    totalIncome: string;
    
    // Модальные окна
    floorUpgrade: string;
    staffTitle: string;
    incomeBonus: string;
    
    // Лутбокс
    lootboxTitle: string;
    lootboxInfo: string;
    lootboxCongratulations: string;
    lootboxBuy: string;
    lootboxOpen: string;
    lootboxClose: string;
    lootboxPrice: string;
    lootboxBalance: string;
    lootboxWon: string;
    lootboxPrizes: string;
    lootboxChances: string;
    lootboxDetails: string;
    lootboxOdds: string;
    
    // Обучение
    tutorialWelcome: string;
    tutorialFloors: string;
    tutorialBalances: string;
    tutorialClaim: string;
    tutorialAccountant: string;
    tutorialBank: string;
    tutorialFinish: string;
  };
  
  // === Общие ключи ===
  common: {
    ton: string;
    close: string;
    wallet: string;
    balance: string;
    amount: string;
    confirm: string;
    success: string;
    error: string;
    loading: string;
    copy: string;
    hour: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    level: string;
    staff: string;
    income: string;
  };
}

const translations: Record<Language, Translations> = {
  ru: {
    friends: {
      title: "ВАША ССЫЛКА",
      subtitle: "ПАРТНЕРСКАЯ СТАТИСТИКА",
      copyButton: "Копировать",
      description: "Получайте 7% от покупок PCoin ваших друзей и 3% от прибыли PDollar ваших друзей",
      referralLink: "Ваша ссылка",
      loading: "Загрузка...",
      statistics: {
        pcoin: "PCoin",
        pdollar: "PDollar",
        friends: "Друзья"
      }
    },
    
    bank: {
      pizza: "Pizza",
      pcoin: "PCoin",
      pdollar: "PDollar",
      buyPcoin: "Купить PCoin",
      exchange: "ОБМЕННИК",
      buyButton: "Купить",
      exchangeButton: "ОБМЕНЯТЬ",
      createOrder: "Создание заказа...",
      howMuchPcoin: "Сколько PCoin вы хотите купить",
      exchangeRate: "Курс:",
      tonRate: "1 TON = 1000 PCoin",
      pdollarRate: "1 PDollar = 0.00001 TON",
      minAmount: "Минимум — 100 PCoin",
      insufficientFunds: "Недостаточно средств",
      processing: "Обработка...",
      buyConfirm: "Сумма к оплате",
      buySuccess: "Сумма к зачислению",
      tonBalance: "Баланс TON"
    },
    
    exchangeModal: {
      title: "Заявка на вывод",
      walletLabel: "Кошелек для вывода:",
      amountLabel: "Сумма вывода (мин. 25 000)",
      maxAmount: "Максимум:",
      lastWithdrawal: "Последний вывод:",
      confirmButton: "Подтвердить",
      minAmountError: "Минимум 25,000",
      balanceLabel: "Ваш баланс PDollar:",
      insufficientBalance: "У вас пока меньше 25,000 PDollar",
      successMessage: "Ваша заявка на вывод принята и будет обработана в течении 24 часов. Вывод средств осуществляется на тот же адрес кошелька, с которого была сделана последняя покупка.",
      walletAddress: "Адрес кошелька",
      statusSuccess: "Успешно"
    },
    
    adminModal: {
      title: "Админка",
      telegramId: "Telegram ID",
      walletAddress: "Wallet Address",
      amountTon: "Amount TON",
      status: "Status",
      approved: "APPROVED",
      pending: "PENDING",
      noData: "Нет данных для отображения",
      totalRecords: "Всего записей:"
    },
    
    orderModal: {
      title: "Оплата TON",
      amountToPay: "Сумма к оплате:",
      amountToCredit: "Сумма к зачислению:",
      payWithWallet: "Оплатить через кошелёк",
      processingNote: "*Из суммы пополнения вычитается 7% на реферальное вознаграждение."
    },
    
    home: {
      soundToggleOn: "Выключить звук",
      soundToggleOff: "Включить звук",
      notificationOkay: "Понятно",
      randomNotificationOkay: "Понятно",
      incomeCollection: "Доход собирается...",
      incomeError: "❌ Ошибка при сборе дохода",
      incomeWarning: "⚠️ Вы теряете до 5% дохода, не используя дополнительных наемных сотрудников",
      staffLossWarning: "staffLossWarning",
      
      roof: "Крыша",
      basement: "Базовый этаж",
      floor: "этаж",
      openFloor: "ОТКРЫТЬ",
      upgradeFloor: "Улучшить",
      
      accountant: "Бухгалтер",
      hireAccountant: "Бухгалтер. Автосбор прибыли каждые 12 часов.",
      accountantDescription: "Бухгалтер. Автосбор прибыли каждые 12 часов.",
      accountantActive: "Бухгалтер уже нанят и работает. Вы можете продлить найм после окончания текущего периода.",
      accountantTimeLeft: "Осталось времени найма",
      manager: "Менеджер",
      managerDescription: "Повышает доход PDollar/час",
      guard: "Охранник",
      guardDescription: "Снижает потери дохода PDollar",
      hire: "Нанять",
      upgradeToLevel: "Улучшить до",
      
      floorProfit: "Доходность Этажа:",
      floorBalance: "Баланс Этажа:",
      perHour: "/ час",
      totalIncome: "Общий доход",
      
      floorUpgrade: "Улучшение этажа",
      staffTitle: "ПЕРСОНАЛ:",
      incomeBonus: "Доход бонус",
      
      lootboxTitle: "Лутбокс",
      lootboxInfo: "О лутбоксе",
      lootboxCongratulations: "Поздравляем!",
      lootboxBuy: "Купить",
      lootboxOpen: "Открыть Лутбокс за 2000 pizza",
      lootboxClose: "Закрыть",
      lootboxPrice: "Цена коробки 2000 pizza",
      lootboxBalance: "Ваш баланс:",
      lootboxWon: "Вы выиграли!",
      lootboxPrizes: "Забрать призы",
      lootboxChances: "Выиграй pcoin для роста!",
      lootboxDetails: "и получи гарантированно pcoin!",
      lootboxOdds: "В ней будет pcoin с вероятностью:",
      
      tutorialWelcome: "Добро пожаловать в ПИЦЦЕРИЮ!\n\nЗдесь ты строишь свой первый ресторанный бизнес — пиццерию!\nПокупай этажи, улучшай их, нанимай персонал и собирай доход в PDollar!",
      tutorialFloors: "Базовый этаж — бесплатный и фармит будущий мемкоин PizzaSlice.\nЭтажи 1–8 покупаются за PCoin и приносят PDollar.",
      tutorialBalances: "Здесь ты видишь свои балансы:\n\n— PCoin — для покупок;\n— PDollar — доход с этажей;\n— Доход PD/час — твоя мощность бизнеса!",
      tutorialClaim: "Нажимай «Забрать» каждые 12часов, чтобы собрать прибыль.\n\nНе хочешь следить вручную?\nНайми бухгалтера!",
      tutorialAccountant: "Бухгалтер собирает прибыль каждые 12часов автоматически.\nНанимай его на 7, 14 или 30 дней за PCoin — и спи спокойно!",
      tutorialBank: "В банке можно купить PCoin и обменять PDollar на TON.\nСледи за курсом и увеличивай доход!",
      tutorialFinish: "Готово! Ты всё знаешь, чтобы построить пицца‑империю.\nУдачи, шеф!"
    },
    
    common: {
      ton: "TON",
      close: "Закрыть",
      wallet: "Кошелек",
      balance: "Баланс",
      amount: "Сумма",
      confirm: "Подтвердить",
      success: "Успешно",
      error: "Ошибка",
      loading: "Загрузка...",
      copy: "Копировать",
      hour: "час",
      days: "дн",
      hours: "ч",
      minutes: "м",
      seconds: "с",
      level: "уровень",
      staff: "Персонал",
      income: "Доход"
    }
  },
  
  en: {
    friends: {
      title: "YOUR LINK",
      subtitle: "PARTNER STATISTICS",
      copyButton: "Copy",
      description: "Get 7% from your friends' PCoin purchases and 3% from your friends' PDollar profit",
      referralLink: "Your link",
      loading: "Loading...",
      statistics: {
        pcoin: "PCoin",
        pdollar: "PDollar",
        friends: "Friends"
      }
    },
    
    bank: {
      pizza: "Pizza",
      pcoin: "PCoin",
      pdollar: "PDollar",
      buyPcoin: "Buy PCoin",
      exchange: "EXCHANGE",
      buyButton: "Buy",
      exchangeButton: "EXCHANGE",
      createOrder: "Creating order...",
      howMuchPcoin: "How much PCoin do you want to buy",
      exchangeRate: "Rate:",
      tonRate: "1 TON = 1000 PCoin",
      pdollarRate: "1 PDollar = 0.00001 TON",
      minAmount: "Minimum — 100 PCoin",
      insufficientFunds: "Insufficient funds",
      processing: "Processing...",
      buyConfirm: "Amount to pay",
      buySuccess: "Amount to credit",
      tonBalance: "TON Balance"
    },
    
    exchangeModal: {
      title: "Withdrawal Request",
      walletLabel: "Wallet for withdrawal:",
      amountLabel: "Withdrawal amount (min. 25,000)",
      maxAmount: "Maximum:",
      lastWithdrawal: "Last withdrawal:",
      confirmButton: "Confirm",
      minAmountError: "Minimum 25,000",
      balanceLabel: "Your PDollar balance:",
      insufficientBalance: "You have less than 25,000 PDollar",
      successMessage: "Your withdrawal request has been accepted and will be processed within 24 hours. Funds are withdrawn to the same wallet address from which the last purchase was made.",
      walletAddress: "Wallet address",
      statusSuccess: "Success"
    },
    
    adminModal: {
      title: "Admin Panel",
      telegramId: "Telegram ID",
      walletAddress: "Wallet Address",
      amountTon: "Amount TON",
      status: "Status",
      approved: "APPROVED",
      pending: "PENDING",
      noData: "No data to display",
      totalRecords: "Total records:"
    },
    
    orderModal: {
      title: "TON Payment",
      amountToPay: "Amount to pay:",
      amountToCredit: "Amount to credit:",
      payWithWallet: "Pay with wallet",
      processingNote: "*7% referral fee is deducted from the top-up amount."
    },
    
    home: {
      soundToggleOn: "Turn off sound",
      soundToggleOff: "Turn on sound",
      notificationOkay: "OK",
      randomNotificationOkay: "OK",
      incomeCollection: "Collecting income...",
      incomeError: "❌ Error collecting income",
      incomeWarning: "⚠️ You're losing up to 5% income by not using additional staff",
      staffLossWarning: "staffLossWarning",
      
      roof: "Roof",
      basement: "Basement",
      floor: "floor",
      openFloor: "OPEN",
      upgradeFloor: "Upgrade",
      
      accountant: "Accountant",
      hireAccountant: "Accountant. Auto-collects profit every 12 hours.",
      accountantDescription: "Accountant. Auto-collects profit every 12 hours.",
      accountantActive: "Accountant is already hired and working. You can extend the hire after the current period ends.",
      accountantTimeLeft: "Time left",
      manager: "Manager",
      managerDescription: "Increases PDollar/hour income",
      guard: "Guard",
      guardDescription: "Reduces PDollar income loss",
      hire: "Hire",
      upgradeToLevel: "Upgrade to level",
      
      floorProfit: "Floor Profitability:",
      floorBalance: "Floor Balance:",
      perHour: "/ hour",
      totalIncome: "Total income",
      
      floorUpgrade: "Floor upgrade",
      staffTitle: "STAFF:",
      incomeBonus: "Income bonus",
      
      lootboxTitle: "Lootbox",
      lootboxInfo: "About lootbox",
      lootboxCongratulations: "Congratulations!",
      lootboxBuy: "Buy",
      lootboxOpen: "Open Lootbox for 2000 pizza",
      lootboxClose: "Close",
      lootboxPrice: "Box price 2000 pizza",
      lootboxBalance: "Your balance:",
      lootboxWon: "You won!",
      lootboxPrizes: "Claim prizes",
      lootboxChances: "Win pcoin for growth!",
      lootboxDetails: "and get guaranteed pcoin!",
      lootboxOdds: "Contains pcoin with probability:",
      
      tutorialWelcome: "Welcome to PIZZERIA!\n\nHere you build your first restaurant business - a pizzeria!\nBuy floors, upgrade them, hire staff and collect income in PDollar!",
      tutorialFloors: "Basement floor is free and farms future memecoin PizzaSlice.\nFloors 1-8 are bought for PCoin and bring PDollar.",
      tutorialBalances: "Here you see your balances:\n\n— PCoin — for purchases;\n— PDollar — income from floors;\n— PD/hour income — your business power!",
      tutorialClaim: "Click 'Collect' every 12 hours to collect profit.\n\nDon't want to monitor manually?\nHire an accountant!",
      tutorialAccountant: "Accountant collects profit automatically every 12 hours.\nHire him for 7, 14 or 30 days for PCoin — and sleep peacefully!",
      tutorialBank: "In the bank you can buy PCoin and exchange PDollar for TON.\nMonitor the rate and increase your income!",
      tutorialFinish: "Done! You know everything to build a pizza empire.\nGood luck, boss!"
    },
    
    common: {
      ton: "TON",
      close: "Close",
      wallet: "Wallet",
      balance: "Balance",
      amount: "Amount",
      confirm: "Confirm",
      success: "Success",
      error: "Error",
      loading: "Loading...",
      copy: "Copy",
      hour: "hour",
      days: "d",
      hours: "h",
      minutes: "m",
      seconds: "s",
      level: "level",
      staff: "Staff",
      income: "Income"
    }
  },
  
  es: {
    friends: {
      title: "TU ENLACE",
      subtitle: "ESTADÍSTICAS DE SOCIOS",
      copyButton: "Copiar",
      description: "Recibe el 7% de las compras de PCoin de tus amigos y el 3% de las ganancias de PDollar de tus amigos",
      referralLink: "Tu enlace",
      loading: "Cargando...",
      statistics: {
        pcoin: "PCoin",
        pdollar: "PDollar",
        friends: "Amigos"
      }
    },
    
    bank: {
      pizza: "Pizza",
      pcoin: "PCoin",
      pdollar: "PDollar",
      buyPcoin: "Comprar PCoin",
      exchange: "INTERCAMBIO",
      buyButton: "Comprar",
      exchangeButton: "INTERCAMBIAR",
      createOrder: "Creando orden...",
      howMuchPcoin: "¿Cuánto PCoin quieres comprar?",
      exchangeRate: "Tasa:",
      tonRate: "1 TON = 1000 PCoin",
      pdollarRate: "1 PDollar = 0.00001 TON",
      minAmount: "Mínimo — 100 PCoin",
      insufficientFunds: "Fondos insuficientes",
      processing: "Procesando...",
      buyConfirm: "Cantidad a pagar",
      buySuccess: "Cantidad a acreditar",
      tonBalance: "Saldo TON"
    },
    
    exchangeModal: {
      title: "Solicitud de retiro",
      walletLabel: "Billetera para retiro:",
      amountLabel: "Monto de retiro (mín. 25,000)",
      maxAmount: "Máximo:",
      lastWithdrawal: "Último retiro:",
      confirmButton: "Confirmar",
      minAmountError: "Mínimo 25,000",
      balanceLabel: "Tu saldo PDollar:",
      insufficientBalance: "Tienes menos de 25,000 PDollar",
      successMessage: "Tu solicitud de retiro ha sido aceptada y será procesada dentro de 24 horas. Los fondos se retiran a la misma dirección de billetera desde la cual se realizó la última compra.",
      walletAddress: "Dirección de billetera",
      statusSuccess: "Éxito"
    },
    
    adminModal: {
      title: "Panel de administración",
      telegramId: "ID de Telegram",
      walletAddress: "Dirección de billetera",
      amountTon: "Cantidad TON",
      status: "Estado",
      approved: "APROBADO",
      pending: "PENDIENTE",
      noData: "No hay datos para mostrar",
      totalRecords: "Registros totales:"
    },
    
    orderModal: {
      title: "Pago con TON",
      amountToPay: "Cantidad a pagar:",
      amountToCredit: "Cantidad a acreditar:",
      payWithWallet: "Pagar con billetera",
      processingNote: "*Se deduce el 7% de comisión por referido del monto de recarga."
    },
    
    home: {
      soundToggleOn: "Apagar sonido",
      soundToggleOff: "Encender sonido",
      notificationOkay: "Entendido",
      randomNotificationOkay: "Entendido",
      incomeCollection: "Recogiendo ingresos...",
      incomeError: "❌ Error al recoger ingresos",
      incomeWarning: "⚠️ Estás perdiendo hasta el 5% de ingresos por no usar personal adicional",
      staffLossWarning: "staffLossWarning",
      
      roof: "Techo",
      basement: "Planta baja",
      floor: "piso",
      openFloor: "ABRIR",
      upgradeFloor: "Mejorar",
      
      accountant: "Contador",
      hireAccountant: "Contador. Recolecta ganancias automáticamente cada 12 horas.",
      accountantDescription: "Contador. Recolecta ganancias automáticamente cada 12 horas.",
      accountantActive: "El contador ya está contratado y trabajando. Puedes extender la contratación después de que finalice el período actual.",
      accountantTimeLeft: "Tiempo restante",
      manager: "Gerente",
      managerDescription: "Aumenta los ingresos de PDollar/hora",
      guard: "Guardia",
      guardDescription: "Reduce la pérdida de ingresos de PDollar",
      hire: "Contratar",
      upgradeToLevel: "Mejorar al nivel",
      
      floorProfit: "Rentabilidad del Piso:",
      floorBalance: "Saldo del Piso:",
      perHour: "/ hora",
      totalIncome: "Ingreso total",
      
      floorUpgrade: "Mejora de piso",
      staffTitle: "PERSONAL:",
      incomeBonus: "Bono de ingresos",
      
      lootboxTitle: "Lootbox",
      lootboxInfo: "Acerca del lootbox",
      lootboxCongratulations: "¡Felicidades!",
      lootboxBuy: "Comprar",
      lootboxOpen: "Abrir Lootbox por 2000 pizza",
      lootboxClose: "Cerrar",
      lootboxPrice: "Precio de caja 2000 pizza",
      lootboxBalance: "Tu saldo:",
      lootboxWon: "¡Ganaste!",
      lootboxPrizes: "Reclamar premios",
      lootboxChances: "¡Gana pcoin para crecer!",
      lootboxDetails: "¡y obtén pcoin garantizado!",
      lootboxOdds: "Contiene pcoin con probabilidad:",
      
      tutorialWelcome: "¡Bienvenido a PIZZERÍA!\n\n¡Aquí construyes tu primer negocio de restaurante - una pizzería!\n¡Compra pisos, mejóralos, contrata personal y recoge ingresos en PDollar!",
      tutorialFloors: "El sótano es gratis y cultiva el futuro memecoin PizzaSlice.\nLos pisos 1-8 se compran con PCoin y generan PDollar.",
      tutorialBalances: "Aquí ves tus saldos:\n\n— PCoin — para compras;\n— PDollar — ingresos de los pisos;\n— Ingresos PD/hora — ¡tu poder empresarial!",
      tutorialClaim: "Haz clic en 'Recoger' cada 12 horas para recoger ganancias.\n\n¿No quieres monitorear manualmente?\n¡Contrata un contador!",
      tutorialAccountant: "El contador recoge ganancias automáticamente cada 12 horas.\n¡Contrátalo por 7, 14 o 30 días por PCoin y duerme tranquilo!",
      tutorialBank: "En el banco puedes comprar PCoin y cambiar PDollar por TON.\n¡Monitorea la tasa y aumenta tus ingresos!",
      tutorialFinish: "¡Listo! Sabes todo para construir un imperio de pizza.\n¡Buena suerte, jefe!"
    },
    
    common: {
      ton: "TON",
      close: "Cerrar",
      wallet: "Billetera",
      balance: "Saldo",
      amount: "Cantidad",
      confirm: "Confirmar",
      success: "Éxito",
      error: "Error",
      loading: "Cargando...",
      copy: "Copiar",
      hour: "hora",
      days: "d",
      hours: "h",
      minutes: "m",
      seconds: "s",
      level: "nivel",
      staff: "Personal",
      income: "Ingreso"
    }
  }
};

export default translations;