import { auth } from "@/auth";
import { getSupabaseReports } from "@/lib/supabase/workspace";
import { ReportsPage, type Period } from "@/components/reports/reports-page";

export default async function ReportsRoute({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  if (!session) {
    return (
      <main className="dashboard-page workspace-error">
        <div>
          <h1>Unauthorized</h1>
          <p>Please sign in to view workspace reports.</p>
        </div>
      </main>
    );
  }

  try {
    const { period } = await searchParams;
    const selected: Period =
      period === "week" || period === "quarter" || period === "year"
        ? (period as Period)
        : "month";
    const reportData = await getSupabaseReports(selected);
    return <ReportsPage report={reportData} period={selected} />;
  } catch {
    return (
      <main className="dashboard-page workspace-error">
        <div>
          <h1>Something went wrong</h1>
          <p>We couldn&apos;t load workspace reports.</p>
        </div>
      </main>
    );
  }
}