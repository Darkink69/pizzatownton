// components/LanguageSwitcher.tsx
import { observer } from "mobx-react-lite";
import store from "../store/store";
import { useState } from "react";

const LanguageSwitcher = observer(() => {
  const [isOpen, setIsOpen] = useState(false);

  // Эмодзи флагов для языков
  const flagEmojis: Record<string, string> = {
    ru: "",
    en: "",
    es: "",
  };

  const languageNames: Record<string, string> = {
    ru: "Русский",
    en: "English",
    es: "Español",
  };

  const handleLanguageChange = (langCode: string) => {
    store.setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-6 left-4 z-50">
      {/* Основная кнопка с флагом */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-amber-500 text-white font-bold px-2 py-1 rounded-lg shadow-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
      >
        <span className="text-xl">{flagEmojis[store.language]}</span>
        <span className="text-lg">{store.language.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden min-w-[180px] border border-amber-200 z-[100]">
          {store.availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                store.language === lang.code
                  ? "bg-amber-500 text-white font-bold"
                  : "text-gray-700 hover:bg-amber-50"
              }`}
            >
              <span className="text-xl">{flagEmojis[lang.code]}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{languageNames[lang.code]}</div>
                <div
                  className={`text-xs ${
                    store.language === lang.code
                      ? "text-amber-100"
                      : "text-gray-500"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Оверлей для закрытия */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
});

export default LanguageSwitcher;
