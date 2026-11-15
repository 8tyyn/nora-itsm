"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/services/AuthService";

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(167,139,250,0.24),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(103,232,249,0.14),transparent_32%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative z-10 flex items-center gap-2">
            <span className="font-display text-2xl tracking-tight">NORA</span>
            <span className="font-mono text-xs text-white/40">TM</span>
          </div>
          <div className="relative z-10 max-w-xl pb-8">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.24em] text-white/45">NORA workspace</p>
            <h1 className="font-display text-5xl leading-[0.96] tracking-tight xl:text-7xl">
              The right answer for every IT incident.
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-white/55">
              Search your ServiceNow knowledge, understand the next step, and route incidents with confidence — all in one place.
            </p>
          </div>
          <p className="relative z-10 font-mono text-xs text-white/35">Grounded in your knowledge base. Built for your service desk.</p>
        </section>

        <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to NORA
            </Link>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="h-4 w-4" />
              Secure workspace
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-16">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <p className="text-center text-xs text-white/30">NORA helps IT teams act on trusted internal knowledge.</p>
        </section>
      </div>
    </main>
  );
}

export function AuthInput({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-white/70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35 focus:bg-white/[0.08]"
      />
    </label>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return <button type="submit" className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-white/85">{children}</button>;
}

export function AuthHeading({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="mb-8">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-white/40">{isLogin ? "Welcome back" : "Get started"}</p>
      <h2 className="font-display text-4xl tracking-tight">{isLogin ? "Sign in to NORA" : "Create your NORA account"}</h2>
      <p className="mt-3 text-sm leading-6 text-white/50">{isLogin ? "Continue helping your IT team resolve incidents with confidence." : "Join your team&apos;s intelligent ServiceNow guidance workspace."}</p>
    </div>
  );
}

export function AuthSwitch({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return <p className="mt-8 text-center text-sm text-white/45">{isLogin ? "New to NORA?" : "Already have an account?"} <Link href={isLogin ? "/signup" : "/login"} className="text-white underline underline-offset-4 hover:text-white/70">{isLogin ? "Create an account" : "Sign in"}</Link></p>;
}

export function Divider() {
  return <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/25"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>;
}

export function SsoButton() {
  return <button type="button" className="h-12 w-full rounded-full border border-white/15 bg-transparent px-5 text-sm text-white transition hover:border-white/35 hover:bg-white/[0.05]">Continue with your company account</button>;
}

export function AuthLegal() {
  return <p className="mt-6 text-center text-[11px] leading-5 text-white/30">By continuing, you agree to NORA&apos;s internal use policy and workspace terms.</p>;
}

export function AuthForm({ children, onSubmit }: { children: React.ReactNode; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="space-y-4">{children}</form>;
}

export function PasswordHint() {
  return <p className="-mt-1 text-xs text-white/30">Use at least 8 characters.</p>;
}

export function AuthFooterLink() {
  return <Link href="/" className="mt-6 block text-center text-xs text-white/35 hover:text-white/60">Need help? Return to the NORA homepage.</Link>;
}

export function AuthBrandMark() {
  return <div className="mb-8 font-display text-2xl tracking-tight lg:hidden">NORA<span className="ml-1 font-mono text-xs text-white/40">TM</span></div>;
}

export function AuthModeNote({ mode }: { mode: "login" | "signup" }) {
  return <p className="mt-6 text-center text-xs text-white/30">{mode === "login" ? "Access your team&apos;s knowledge and incident guidance." : "Built for IT service teams using ServiceNow."}</p>;
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"user" | "employee">("user");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const account = await login(email, password);
        router.push(account.role === "client" ? "/request-assistant" : "/chat");
      } else {
        await register(name, email, password, accountType);
        router.push("/login?pending=1");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete authentication");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <AuthBrandMark />
      <AuthHeading mode={mode} />
      <AuthForm onSubmit={handleSubmit}>
        {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {!isLogin && <AuthInput label="Full name" placeholder="Alex Morgan" value={name} onChange={setName} />}
        {!isLogin && <label className="block space-y-2"><span className="text-sm text-white/70">Account type</span><select value={accountType} onChange={(event) => setAccountType(event.target.value as "user" | "employee")} className="h-12 w-full rounded-xl border border-white/10 bg-[#171717] px-4 text-sm text-white outline-none focus:border-white/35"><option value="user">User</option><option value="employee">Employee</option></select><span className="block text-xs text-white/30">Your account will be reviewed by an administrator before access is enabled.</span></label>}
        <AuthInput label="Work email" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
        <AuthInput label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
        {!isLogin && <PasswordHint />}
        {isLogin && <div className="-mt-1 flex justify-end"><button type="button" className="text-xs text-white/45 hover:text-white">Forgot password?</button></div>}
        <div className="pt-2"><AuthSubmit>{isSubmitting ? "Please wait..." : isLogin ? "Sign in to NORA" : "Create account"}</AuthSubmit></div>
      </AuthForm>
      <Divider />
      <SsoButton />
      <AuthSwitch mode={mode} />
      <AuthLegal />
      <AuthFooterLink />
    </AuthShell>
  );
}
