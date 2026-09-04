import { TrendingUp } from "lucide-react";

export function MetricCard({ label, value, change }: { label: string; value: string; change: string }) { return <div className="dash-card metric-card"><div className="metric-icon"><TrendingUp size={16} /></div><p>{label}</p><div><strong>{value}</strong><span>{change}</span></div></div>; }