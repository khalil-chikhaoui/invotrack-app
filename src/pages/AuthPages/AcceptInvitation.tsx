import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import AcceptInvitationForm from "../../components/auth/AcceptInvitationForm";

export default function AcceptInvitation() {
  const { t } = useTranslation("auth");

  return (
    <>
      <PageMeta
        title={t("accept_invitation.meta.title")}
        description={t("accept_invitation.meta.description")}
      />
      <AuthLayout>
        <AcceptInvitationForm />
      </AuthLayout>
    </>
  );
}