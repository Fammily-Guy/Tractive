import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Lock } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { createSession, getSession, verifyLogin } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`admin-login:${ip}`, 8, 15 * 60_000)) redirect("/admin/login?error=limit");
  const user = verifyLogin(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""), String(formData.get("code") ?? ""));
  if (!user) redirect("/admin/login?error=1");
  await createSession(user);
  redirect("/admin");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { error } = await searchParams;
  const devHint = !process.env.ADMIN_USERS && process.env.NODE_ENV !== "production";
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="card w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3"><LogoMark /><h1 className="text-xl font-extrabold">Staff sign in</h1></div>
        {error && <p className="rounded-lg bg-danger-light p-3 font-semibold text-danger" role="alert">{error === "limit" ? "Too many attempts. Try again in 15 minutes." : "Email, password or code is not correct."}</p>}
        <div><label className="label" htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="username" required /></div>
        <div><label className="label" htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <div><label className="label" htmlFor="code">2FA code</label><input className="input" id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" /></div>
        <button className="btn-primary w-full" type="submit"><Lock className="h-5 w-5" aria-hidden="true" />Sign in</button>
        {devHint && <p className="rounded-lg bg-gold-light p-3 text-sm">Development mode: <strong>admin@example.com</strong> / <strong>change-me</strong> (no 2FA). Set ADMIN_USERS before deploying.</p>}
      </form>
    </main>
  );
}
