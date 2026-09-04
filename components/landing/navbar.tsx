"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = ["Features", "About"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors ${scrolled ? "border-b border-[var(--line)] bg-[#0a0f0e]/85 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.04em]" aria-label="Custora home">
          <span className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--accent)]/40 bg-[var(--accent-light)] text-[var(--accent)]"><span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--accent)]" /></span>
          Custora
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--muted)] md:flex" aria-label="Main navigation">
          {links.map((link) => <a key={link} href={link === "Features" ? "#features" : "#about"} className="transition-colors hover:text-[var(--ink)]">{link}</a>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
          <Button asChild size="sm"><Link href="/login">Get started <ArrowUpRight size={14} /></Link></Button>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open && <div className="border-t border-[var(--line)] bg-[var(--paper)] px-5 py-4 md:hidden"><nav className="flex flex-col gap-1" aria-label="Mobile navigation">{links.map((link) => <a key={link} href={link === "Features" ? "#features" : "#about"} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-[var(--wash)]">{link}</a>)}<Link href="/login" className="mt-2 border-t border-[var(--line)] px-3 py-4 text-sm font-semibold">Log in <ArrowUpRight className="ml-1 inline" size={14} /></Link></nav></div>}
    </header>
  );
}