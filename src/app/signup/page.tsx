import { AuthPage } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Create account | NORA",
  description: "Create your NORA IT incident guidance workspace account.",
};

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
