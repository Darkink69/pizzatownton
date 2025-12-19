import { observer } from "mobx-react-lite";
import store from "../store/store";

const LanguageSwitcher = observer(() => {
  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
        {store.availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => store.setLanguage(lang.code)}
            className={`px-3 py-1 rounded-md transition-all ${
              store.language === lang.code
                ? "bg-amber-500 text-white font-bold"
                : "text-gray-700 hover:bg-amber-100"
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Показываем текущий язык как флажок на маленьких экранах */}
      <div className="md:hidden bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="text-sm font-bold text-amber-800">
          {store.language.toUpperCase()}
        </div>
      </div>
    </div>
  );
});

export default LanguageSwitcher;
