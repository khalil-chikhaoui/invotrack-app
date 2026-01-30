import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "de"],
    
    // 1. Define your default namespace (loaded on every page)
    defaultNS: "common",
    
    // 2. List available namespaces
    ns: ["common", "auth"],

    interpolation: {
      escapeValue: false, 
    },
    
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
    },
    
    backend: {
      // 3. Load path for your namespaces
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;