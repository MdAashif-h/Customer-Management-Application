import { auth } from "@/auth";
import { getSupabaseActivity } from "@/lib/supabase/workspace";
import { ActivityPage } from "@/components/activity/activity-page";

export default async function ActivityRoute() {
  const session = await auth();
  if (!session) {
    return (
      <main className="dashboard-page workspace-error">
        <div>
          <h1>Unauthorized</h1>
          <p>Please sign in to view workspace activity.</p>
        </div>
      </main>
    );
  }

  try {
    const entries = await getSupabaseActivity();
    return <ActivityPage entries={entries} />;
  } catch {
    return (
      <main className="dashboard-page workspace-error">
        <div>
          <h1>Something went wrong</h1>
          <p>We couldn&apos;t load workspace activity.</p>
        </div>
      </main>
    );
  }
}