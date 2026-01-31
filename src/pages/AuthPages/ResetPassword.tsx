import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  const { t } = useTranslation("auth");

  return (
    <>
      <PageMeta
        title={t("reset_password.meta.title")}
        description={t("reset_password.meta.description")}
      />
      {/* Kept language selector enabled as requested previously */}
      <AuthLayout showLanguageSelector={true}>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}