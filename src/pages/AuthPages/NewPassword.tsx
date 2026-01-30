import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import NewPasswordForm from "../../components/auth/NewPasswordForm";

export default function NewPassword() {
  return (
    <>
      <PageMeta
        title="Set New Password | invotrack Management"
        description="Securely update your invotrack organization account password"
      />
      <AuthLayout>
        <NewPasswordForm />
      </AuthLayout>
    </>
  );
}
