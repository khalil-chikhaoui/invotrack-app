import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import NewPasswordForm from "../../components/auth/NewPasswordForm";

export default function NewPassword() {
  const { t } = useTranslation("auth");

  return (
    <>
      <PageMeta
        title={t("new_password.meta.title")}
        description={t("new_password.meta.description")}
      />
      <AuthLayout>
        <NewPasswordForm />
      </AuthLayout>
    </>
  );
}
