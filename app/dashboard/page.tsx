import { auth } from "@/auth";
import { getSupabaseAnalytics } from "@/lib/supabase/workspace";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const period =
    params.period === "week" || params.period === "quarter" || params.period === "year"
      ? params.period
      : "month";

  try {
    const analytics = await getSupabaseAnalytics(period);
    const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "there";

    return (
      <DashboardShell
        analytics={analytics}
        userName={firstName}
        period={period}
      />
    );
  } catch (err) {
    return (
      <main className="dashboard-page workspace-error">
        <div>
          <h1>Something went wrong</h1>
          <p>We couldn&apos;t load your workspace dashboard metrics.</p>
        </div>
      </main>
    );
  }
}