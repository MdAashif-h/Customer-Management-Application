import { ArrowUpRight, ChevronDown, MoreHorizontal, Search, Users } from "lucide-react";

const customers = [
  { initials: "JC", name: "Jordan Chen", email: "jordan.chen@kinfolk.co", status: "Active", color: "#e6f2ed" },
  { initials: "AM", name: "Amara Mitchell", email: "amara@northstar.io", status: "Active", color: "#f5e9df" },
  { initials: "RK", name: "Rafael Kim", email: "rafael.kim@orbit.com", status: "Pending", color: "#e8eaf5" },
];

export function DashboardPreview() {
  return <section id="preview" className="mx-auto max-w-6xl px-5 lg:px-8" aria-label="Custora product preview">
    <div className="animate-rise-delay surface-hover overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex min-h-[510px]">
        <aside className="hidden w-52 shrink-0 border-r border-[var(--line)] bg-[#0d1412] p-4 sm:block">
          <div className="mb-10 flex items-center gap-2 text-sm font-bold"><span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--accent-light)] text-[var(--accent)]"><span className="h-2 w-2 rounded-sm bg-[var(--accent)]" /></span>Custora</div>
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa7a3]">Workspace</p>
          <div className="rounded-md bg-[var(--accent-light)] px-3 py-2.5 text-xs font-semibold text-[var(--accent)]"><Users className="mr-2 inline" size={14} />Customers</div>
          <div className="mt-1 px-3 py-2.5 text-xs font-medium text-[var(--muted)]">Activity</div>
          <div className="px-3 py-2.5 text-xs font-medium text-[var(--muted)]">Reports</div>
          <p className="mb-3 mt-9 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa7a3]">Manage</p>
          <div className="px-3 py-2.5 text-xs font-medium text-[var(--muted)]">Team members</div>
          <div className="px-3 py-2.5 text-xs font-medium text-[var(--muted)]">Settings</div>
          <div className="mt-28 flex items-center gap-2 border-t border-[var(--line)] px-2 pt-4 text-xs font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-light)] text-[10px] text-[var(--accent)]">JD</span>Jamie Davis</div>
        </aside>
        <div className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-medium text-[var(--muted)]">Monday, September 08, 2026</p><h2 className="text-xl font-bold tracking-[-0.03em] sm:text-2xl">Good morning, Jamie</h2></div><button className="hidden h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold sm:flex">This month <ChevronDown size={13} /></button></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[ ["Total customers", "2,846", "+12.5%"], ["Active customers", "2,431", "+8.2%"], ["New customers", "184", "+16.4%"] ].map(([label, value, trend]) => <div key={label} className="surface-hover rounded-xl border border-[var(--line)] bg-[#131c19] p-4"><p className="text-xs font-medium text-[var(--muted)]">{label}</p><div className="mt-2 flex items-end justify-between"><strong className="text-2xl tracking-[-0.04em]">{value}</strong><span className="mb-1 text-[11px] font-bold text-[var(--accent)]">{trend}</span></div></div>)}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-[var(--line)] p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">Customer growth</p><span className="text-[11px] text-[var(--muted)]">Last 6 months</span></div><div className="flex h-32 items-end gap-3 border-b border-l border-[var(--line)] px-3 pb-0 pt-4">{[38, 48, 43, 67, 62, 87].map((height, index) => <div key={index} className="flex flex-1 items-end gap-1"><div className="w-full rounded-t-sm bg-[#b9dacc]" style={{ height: `${height}%` }} /><div className="w-full rounded-t-sm bg-[var(--accent)]" style={{ height: `${Math.max(height - 13, 10)}%` }} /></div>)}</div><div className="mt-2 flex justify-between pl-3 text-[10px] text-[#9aa7a3]"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div>
            <div className="rounded-xl border border-[var(--line)] p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">Recent activity</p><MoreHorizontal size={16} className="text-[var(--muted)]" /></div>{["Added new customer", "Updated customer profile", "Exported customer list"].map((item, index) => <div key={item} className="flex items-center gap-3 border-t border-[var(--line)] py-3"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${index === 1 ? "bg-[#f5e9df]" : "bg-[var(--accent-light)]"}`}><ArrowUpRight size={13} /></span><div><p className="text-xs font-semibold">{item}</p><p className="mt-0.5 text-[10px] text-[var(--muted)]">{index + 2} hours ago</p></div></div>)}</div>
          </div>
          <div className="mt-5 rounded-xl border border-[var(--line)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] p-4"><p className="text-sm font-bold">Recent customers</p><div className="flex h-8 min-w-[150px] items-center gap-2 rounded-md border border-[var(--line)] px-2.5 text-xs text-[var(--muted)]"><Search size={14} />Search</div></div><div className="divide-y divide-[var(--line)]">{customers.map((customer) => <div key={customer.email} className="flex items-center justify-between gap-3 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: customer.color }}>{customer.initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{customer.name}</p><p className="truncate text-[10px] text-[var(--muted)]">{customer.email}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${customer.status === "Active" ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[#f6efe5] text-[#a16d31]"}`}>{customer.status}</span></div>)}</div></div>
        </div>
      </div>
    </div>
  </section>;
}