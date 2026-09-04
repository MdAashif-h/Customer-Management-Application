import { auth } from "@/auth";
import { SettingsPage } from "@/components/settings/settings-page";
export default async function SettingsRoute() { const session = await auth(); if (!session) return null; return <SettingsPage user={{ name: session.user.name ?? null, email: session.user.email ?? null, role: session.user.role }} />; }