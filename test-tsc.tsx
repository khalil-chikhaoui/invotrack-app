import { useTranslation } from "react-i18next";
const Test = () => {
  const { t } = useTranslation();
  const errorCode = "123";
  t(`create.errors.${errorCode}`, "fallback");
  return null;
}
