import { AuthPage } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Sign in | NORA",
  description: "Sign in to the NORA IT incident guidance workspace.",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
