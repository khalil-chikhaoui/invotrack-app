import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import AcceptInvitationForm from "../../components/auth/AcceptInvitationForm";

export default function AcceptInvitation() {
  return (
    <>
      <PageMeta
        title="Accept Invitation | invotrack"
        description="Join your organization on invotrack"
      />
      <AuthLayout>
        <AcceptInvitationForm />
      </AuthLayout>
    </>
  );
}
