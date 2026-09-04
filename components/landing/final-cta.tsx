import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return <section className="px-5 pb-20 lg:pb-28"><div className="cta-panel mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-2xl border border-[var(--line)] px-7 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-12"><div><h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Ready to simplify customer management?</h2><p className="mt-2 text-sm leading-6 text-[#a8b8b2]">Start managing your customer data in one focused workspace.</p></div><Button asChild className="shrink-0 bg-[var(--accent)] text-[#07110e]"><Link href="/login">Get started <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1" /></Link></Button></div></section>;
}