import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundEffects } from "@/components/landing/background-effects";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <main className="login-page px-5 py-8 sm:py-12"><BackgroundEffects /><div className="login-shell"><Link href="/" className="login-brand animate-rise" aria-label="Custora home"><span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[var(--accent)]/40 bg-[var(--accent-light)] text-[var(--accent)]"><span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--accent)]" /></span>Custora</Link><div className="login-card surface-hover animate-rise-delay"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]"><span className="h-3 w-3 rounded-[3px] bg-[var(--accent)]" /></div><h1 className="mt-6 text-center text-2xl font-bold tracking-[-0.045em] sm:text-3xl">Welcome back</h1><p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-[var(--muted)]">Sign in to continue to your Custora workspace.</p><LoginForm /></div><Link href="/" className="login-back animate-rise-delay"><ArrowLeft size={14} /> Back to homepage</Link></div></main>;
}