"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

type FormErrors = { email?: string; password?: string };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  function validate() {
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (!password) nextErrors.password = "Please enter your password.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setAuthError("");
    setIsLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    if (result?.error) {
      setAuthError("Invalid email or password.");
      setIsLoading(false);
      return;
    }
    window.location.assign(result?.url ?? "/dashboard");
  }

  return <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
    <div><label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={`auth-input ${errors.email ? "auth-input-error" : ""}`} />{errors.email && <p id="email-error" role="alert" className="mt-2 text-xs text-[#f28c8c]">{errors.email}</p>}</div>
    <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold">Password</label><button type="button" className="text-xs font-semibold text-[var(--accent)] transition-colors hover:text-[#8ce2c3]" onClick={() => undefined}>Forgot password?</button></div><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={`auth-input pr-12 ${errors.password ? "auth-input-error" : ""}`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--ink)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <p id="password-error" role="alert" className="mt-2 text-xs text-[#f28c8c]">{errors.password}</p>}</div>
    {authError && <p role="alert" className="text-xs text-[#f28c8c]">{authError}</p>}<Button type="submit" disabled={isLoading} className="mt-2 w-full">{isLoading ? <><LoaderCircle size={16} className="animate-spin" /> Signing in...</> : <>Sign in <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1" /></>}</Button>
    <p className="pt-2 text-center text-sm text-[var(--muted)]">Don&apos;t have access? <span className="text-[var(--ink)]">Contact your administrator.</span></p>
    <Link href="/" className="mx-auto mt-2 block w-fit text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent)]">Return to homepage</Link>
  </form>;
}