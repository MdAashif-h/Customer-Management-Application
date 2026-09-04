"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ChevronDown, TrendingUp, Building2 } from "lucide-react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export type Report = {
  total: number;
  active: number;
  inactive: number;
  recent: number;
  companies: { company: string; count: number }[];
};

export type Period = "week" | "month" | "quarter" | "year";

export function ReportsPage({
  report,
  period = "month",
}: {
  report: Report;
  period: Period;
}) {
  const [open, setOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);

  const total = report?.total ?? 0;
  const active = report?.active ?? 0;
  const inactive = report?.inactive ?? 0;
  const recent = report?.recent ?? 0;
  const companies = report?.companies ?? [];

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const periodLabels: Record<Period, string> = {
    week: "This week",
    month: "This month",
    quarter: "Last 3 months",
    year: "This year",
  };
  const periodLabel = periodLabels[period] || "This month";

  const metrics = [
    { label: "Total customers", value: total },
    { label: "Active customers", value: active },
    { label: "Inactive customers", value: inactive },
    { label: "New customers", value: recent },
  ];

  const maxCompanyCount = companies[0]?.count || 1;

  return (
    <div className="dashboard-page workspace-page">
      <DashboardSidebar
        mobileOpen={open}
        onClose={() => setOpen(false)}
        activeLabel="Reports"
      />
      <div className="dashboard-main">
        <header className="workspace-header">
          <button
            className="dashboard-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <BarChart3 size={18} />
          </button>
          <div>
            <p>Workspace / Reports</p>
            <h1>Reports</h1>
            <span>Understand customer growth and activity across your workspace.</span>
          </div>
          <div className="relative">
            <button
              className="period-button"
              onClick={() => setPeriodOpen(!periodOpen)}
              aria-expanded={periodOpen}
            >
              <CalendarDays size={15} /> {periodLabel} <ChevronDown size={14} />
            </button>
            {periodOpen && (
              <div className="dash-menu period-menu">
                {(
                  [
                    ["week", "This week"],
                    ["month", "This month"],
                    ["quarter", "Last 3 months"],
                    ["year", "This year"],
                  ] as const
                ).map(([value, label]) => (
                  <Link
                    key={value}
                    href={`/reports?period=${value}`}
                    onClick={() => setPeriodOpen(false)}
                    className={value === period ? "text-[var(--accent)]" : ""}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>
        <main>
          <section className="report-metrics">
            {metrics.map((metric) => (
              <div className="dash-card report-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value.toLocaleString()}</strong>
                <TrendingUp size={16} />
              </div>
            ))}
          </section>
          <div className="report-grid">
            <section className="dash-card report-chart">
              <div className="dash-card-header">
                <h2>Top company distribution</h2>
                <span>Top client accounts</span>
              </div>
              {companies.length > 0 ? (
                <div className="report-bars">
                  {companies.map((item) => (
                    <div key={item.company}>
                      <span
                        style={{
                          height: `${Math.max(
                            12,
                            Math.round((item.count / maxCompanyCount) * 100)
                          )}%`,
                        }}
                      />
                      <small title={item.company}>{item.company}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-2">
                  <Building2 size={24} className="opacity-40" />
                  <p>No company data available for this period.</p>
                </div>
              )}
            </section>
            <section className="dash-card status-breakdown">
              <div className="dash-card-header">
                <h2>Status breakdown</h2>
                <span>{total.toLocaleString()} total</span>
              </div>
              <div
                className="status-ring"
                style={{
                  background:
                    total > 0
                      ? `conic-gradient(var(--accent) ${activePercent}%, #33403b 0)`
                      : "#33403b",
                }}
              >
                <div>
                  <strong>{activePercent}%</strong>
                  <small>active</small>
                </div>
              </div>
              <div className="status-legend">
                <span>
                  <b className="active-dot" />
                  Active <strong>{active}</strong>
                </span>
                <span>
                  <b className="inactive-dot" />
                  Inactive <strong>{inactive}</strong>
                </span>
              </div>
            </section>
          </div>
          <section className="dash-card company-ranking">
            <div className="dash-card-header">
              <h2>Top companies</h2>
              <span>Customers by company</span>
            </div>
            {companies.length > 0 ? (
              companies.map((item, index) => (
                <div className="company-row" key={item.company}>
                  <span>{index + 1}</span>
                  <strong>{item.company}</strong>
                  <em>{item.count} customers</em>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[var(--muted)]">
                <p>No customer accounts recorded yet.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
