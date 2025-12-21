import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './GlobeIcon';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'ru', name: 'language_switcher.russian' },
  { code: 'en', name: 'language_switcher.english' },
  { code: 'es', name: 'language_switcher.spanish' }
];

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      <button 
        className={styles.languageSwitcher}
        onClick={() => setIsOpen(true)}
        aria-label={t('language_switcher.change_language')}
      >
        <GlobeIcon />
        <span className={styles.code}>{currentLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div 
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.handle} />
            
            <div className={styles.header}>
              <h3 className={styles.title}>{t('language_switcher.select_language')}</h3>
            </div>

            <div className={styles.options}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.option} ${
                    lang.code === i18n.language ? styles.active : ''
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className={styles.langCode}>{lang.code.toUpperCase()}</span>
                  <span className={styles.langName}>{t(lang.name)}</span>
                  {lang.code === i18n.language && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.cancelWrapper}>
              <button 
                className={styles.cancel}
                onClick={() => setIsOpen(false)}
              >
                {t('language_switcher.cancel')}
              </button>
            </div>  
          </div>
        </div>
      )}
    </>
  );
};
