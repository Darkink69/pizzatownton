// translations.ts
export type Language = "ru" | "en" | "es";

export interface Translations {
  title: string;
  subtitle: string;
  partnerTitle: string;
  copyButton: string;
  description: string;
  referralLink: string;
  loading: string;
  statistics: {
    pcoin: string;
    pdollar: string;
    friends: string;
  };
}

const translations: Record<Language, Translations> = {
  ru: {
    title: "ВАША ССЫЛКА",
    subtitle: "ПАРТНЕРСКАЯ СТАТИСТИКА",
    copyButton: "Копировать",
    description:
      "Получайте 7% от покупок PCoin ваших друзей и 3% от прибыли PDollar ваших друзей",
    referralLink: "Ваша ссылка",
    loading: "Загрузка...",
    statistics: {
      pcoin: "PCoin",
      pdollar: "PDollar",
      friends: "Друзья",
    },
    partnerTitle: "",
  },
  en: {
    title: "YOUR LINK",
    subtitle: "PARTNER STATISTICS",
    copyButton: "Copy",
    description:
      "Get 7% from your friends' PCoin purchases and 3% from your friends' PDollar profit",
    referralLink: "Your link",
    loading: "Loading...",
    statistics: {
      pcoin: "PCoin",
      pdollar: "PDollar",
      friends: "Friends",
    },
    partnerTitle: "",
  },
  es: {
    title: "TU ENLACE",
    subtitle: "ESTADÍSTICAS DE SOCIOS",
    copyButton: "Copiar",
    description:
      "Recibe el 7% de las compras de PCoin de tus amigos y el 3% de las ganancias de PDollar de tus amigos",
    referralLink: "Tu enlace",
    loading: "Cargando...",
    statistics: {
      pcoin: "PCoin",
      pdollar: "PDollar",
      friends: "Amigos",
    },
    partnerTitle: "",
  },
};

export default translations;
