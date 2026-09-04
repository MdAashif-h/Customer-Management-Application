import { LockKeyhole, Search, ShieldCheck, UserRoundCog } from "lucide-react";

const features = [
  { icon: UserRoundCog, title: "Customer management", text: "Create, update, search and organize customer records from one place." },
  { icon: Search, title: "Fast search", text: "Find customer information instantly with powerful search and filtering." },
  { icon: ShieldCheck, title: "Role-based access", text: "Give users the right level of access based on their role." },
  { icon: LockKeyhole, title: "Simple & secure", text: "Keep customer information organized with a clean and controlled workspace." },
];

export function Features() {
  return <section id="features" className="border-y border-[var(--line)] bg-[#0c1211] px-5 py-20 lg:py-28"><div className="mx-auto max-w-6xl"><div className="max-w-md"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Built for focus</p><h2 className="text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl">Everything in its right place.</h2></div><div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="surface-hover rounded-xl border border-[var(--line)] p-5"><Icon size={22} strokeWidth={1.7} className="text-[var(--accent)] transition-transform hover:scale-110" /><h3 className="mt-5 text-base font-bold capitalize">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></article>)}</div></div></section>;
}