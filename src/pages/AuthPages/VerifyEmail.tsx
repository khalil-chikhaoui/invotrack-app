import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyEmailForm from "../../components/auth/VerifyEmailForm";

export default function VerifyEmail() {
  const { t } = useTranslation("auth");

  return (
    <>
      <PageMeta
        title={t("verify_email.meta.title")}
        description={t("verify_email.meta.description")}
      />
      <AuthLayout>
        <VerifyEmailForm />
      </AuthLayout>
    </>
  );
}