import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyEmailForm from "../../components/auth/VerifyEmailForm";

export default function VerifyEmail() {
  return (
    <>
      <PageMeta
        title="Verify Email | Invotrack"
        description="Verify your email address to continue"
      />
      <AuthLayout>
        <VerifyEmailForm />
      </AuthLayout>
    </>
  );
}