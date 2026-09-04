import Link from "next/link";

export function Footer() {
  return <footer className="border-t border-[var(--line)] px-5 py-8"><div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="font-extrabold tracking-[-0.04em]">Custora</Link><nav className="flex gap-5 text-xs font-medium text-[var(--muted)]" aria-label="Footer navigation"><a href="#features">Features</a><a href="#about">About</a><Link href="/login">Login</Link></nav></div><div className="mx-auto mt-7 max-w-6xl text-xs text-[#9aa7a3]">© 2026 Custora. All rights reserved.</div></footer>;
}