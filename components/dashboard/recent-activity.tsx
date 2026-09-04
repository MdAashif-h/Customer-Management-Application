import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";

export function RecentActivity({
  activities = [],
}: {
  activities?: { id: string; text: string; timeAgo: string }[];
}) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2>Recent activity</h2>
        <Link
          href="/activity"
          className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          View all <ArrowUpRight size={13} />
        </Link>
      </div>
      {activities.length > 0 ? (
        <div className="activity-list">
          {activities.map((activity) => (
            <div className="activity-row" key={activity.id}>
              <span className="activity-icon">
                <ArrowUpRight size={14} />
              </span>
              <div>
                <strong>{activity.text}</strong>
                <small>{activity.timeAgo}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-2">
          <Activity size={20} className="text-[var(--muted)] opacity-50" />
          <p>No recent activity recorded yet.</p>
        </div>
      )}
    </div>
  );
}