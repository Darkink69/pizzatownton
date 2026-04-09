import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

const SUPPORTED_LANGUAGES = ['ru', 'en', 'es'];

/** Функция для определения языка из системных настроек */
const getSystemLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0]; // 'en-US' -> 'en'
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'ru';
};

/** Функция для получения сохранённого языка или языка системы */
const getInitialLanguage = (): string => {
  const savedLang = localStorage.getItem('app_language');
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
    return savedLang;
  }
  return getSystemLanguage();
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.yaml',
      parse: (data: string) => yaml.load(data),
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_language',
    },
  });

/** Слушаем изменение языка от i18n и сохраняем в localStorage */
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app_language', lng);
  document.documentElement.lang = lng;
});

/** Слушаем изменение языка от компонента LanguageSwitcher */
window.addEventListener('languageChanged', ((e: CustomEvent) => {
  i18n.changeLanguage(e.detail);
}) as EventListener);

export default i18n;
