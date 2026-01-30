import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { t } = useTranslation("auth");

  return (
    <>
      <PageMeta
        title={t("signin.meta.title")}
        description={t("signin.meta.description")}
      />
      <AuthLayout showLanguageSelector={true}>
        <SignInForm />
      </AuthLayout>
    </>
  );
}