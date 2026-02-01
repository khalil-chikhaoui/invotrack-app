import { useTranslation } from "react-i18next";
import { enUS, fr, de } from "date-fns/locale";
import { Locale } from "date-fns";

/**
 * Hook to get the current date-fns locale object based on the active i18next language.
 * Defaults to enUS.
 */
export const useDateLocale = (): Locale => {
  const { i18n } = useTranslation();

  switch (i18n.language) {
    case "fr":
      return fr;
    case "de":
      return de;
    case "en":
    default:
      return enUS;
  }
};