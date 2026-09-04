"use client";

import Link from "next/link";
import { Activity, BarChart3, ChevronDown, LayoutDashboard, Settings, UserRoundCog, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const items = [["Dashboard", LayoutDashboard, "/dashboard"], ["Customers", UsersRound, "/customers"], ["Activity", Activity, "/activity"], ["Reports", BarChart3, "/reports"], ["Team members", UserRoundCog, "/team-members"], ["Settings", Settings, "/settings"]] as const;

export function DashboardSidebar({ mobileOpen, onClose, activeLabel = "Dashboard" }: { mobileOpen: boolean; onClose: () => void; activeLabel?: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "Loading...", email: "", role: "" });
  useEffect(() => { fetch("/api/me").then((response) => response.ok ? response.json() : null).then((data) => { if (data?.user) setProfile(data.user); }).catch(() => undefined); }, []);
  const userInitials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <><aside className={`dashboard-sidebar ${mobileOpen ? "is-open" : ""}`}><div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-base font-extrabold tracking-[-.04em]" onClick={onClose}><span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[var(--accent-light)] text-[var(--accent)]"><span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--accent)]" /></span>Custora</Link><button className="dashboard-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div><nav className="mt-12" aria-label="Dashboard navigation"><p className="dash-label">Workspace</p>{items.slice(0, 4).map(([label, Icon, href]) => <Link key={label} href={href} className={`dash-nav ${label === activeLabel ? "active" : ""}`} onClick={onClose}><Icon size={17} />{label}</Link>)}<p className="dash-label mt-9">Manage</p>{items.slice(4).map(([label, Icon, href]) => <Link key={label} href={href} className={`dash-nav ${label === activeLabel ? "active" : ""}`} onClick={onClose}><Icon size={17} />{label}</Link>)}</nav><div className="relative mt-auto"><button className="dash-profile" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="dash-avatar">{userInitials}</span><span className="min-w-0 text-left"><strong>{profile.name}</strong><small>{profile.role}</small></span><ChevronDown size={15} className={`ml-auto transition-transform ${profileOpen ? "rotate-180" : ""}`} /></button>{profileOpen && <div className="dash-menu"><Link href="/profile">Profile</Link><Link href="/settings">Settings</Link><button onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button></div>}</div></aside>{mobileOpen && <button className="dashboard-backdrop" onClick={onClose} aria-label="Close navigation" />}</>;
}