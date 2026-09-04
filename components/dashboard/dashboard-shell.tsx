"use client";

import Link from "next/link";
import { CalendarDays, ChevronDown, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { CustomerGrowthChart } from "@/components/dashboard/customer-growth-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import type { DashboardAnalytics } from "@/lib/supabase/workspace";

type Period = "week" | "month" | "quarter" | "year";

export function DashboardShell({
  analytics,
  userName = "there",
  period = "month",
}: {
  analytics: DashboardAnalytics;
  userName?: string;
  period?: Period;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(
    () =>
      analytics.recentCustomers.filter((customer) =>
        `${customer.name} ${customer.company}`.toLowerCase().includes(query.toLowerCase())
      ),
    [analytics.recentCustomers, query]
  );

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const periodLabels: Record<Period, string> = {
    week: "This week",
    month: "This month",
    quarter: "Last 3 months",
    year: "This year",
  };

  const metrics = [
    {
      label: "Total customers",
      value: analytics.totalCustomers.toLocaleString(),
      change: `+${analytics.newCustomersThisMonth} this month`,
    },
    {
      label: "Active customers",
      value: analytics.activeCustomers.toLocaleString(),
      change: `${analytics.activeRate}% active rate`,
    },
    {
      label: "Inactive customers",
      value: analytics.inactiveCustomers.toLocaleString(),
      change: `${analytics.totalCustomers > 0 ? 100 - analytics.activeRate : 0}% inactive`,
    },
    {
      label: "Recent activities",
      value: analytics.recentActivities.length.toLocaleString(),
      change: "Latest updates",
    },
  ];

  return (
    <div className="dashboard-page">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeLabel="Dashboard"
      />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="dashboard-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <div>
            <p>{todayFormatted}</p>
            <h1>
              Good {timeOfDay}, {userName}
            </h1>
          </div>
          <div className="relative">
            <button
              className="period-button"
              onClick={() => setPeriodOpen(!periodOpen)}
              aria-expanded={periodOpen}
            >
              <CalendarDays size={15} />
              {periodLabels[period] || "This month"}
              <ChevronDown size={14} />
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
                    href={`/dashboard?period=${value}`}
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
          <section className="metric-grid" aria-label="Customer metrics">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>
          <section className="dashboard-grid">
            <CustomerGrowthChart
              growth={analytics.growthData}
              months={analytics.growthMonths}
            />
            <RecentActivity activities={analytics.recentActivities} />
          </section>
          <section className="dash-card customers-card">
            <div className="dash-card-header">
              <div>
                <h2>Recent customers</h2>
                <p>Keep an eye on your latest relationships</p>
              </div>
              <label className="dashboard-search">
                <Search size={15} />
                <span className="sr-only">Search customers</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                />
              </label>
            </div>
            <div className="customer-table">
              <div className="customer-table-head">
                <span>Customer</span>
                <span>Company</span>
                <span>Status</span>
                <span>Added</span>
              </div>
              {filteredCustomers.map((customer) => (
                <Link
                  href={`/customers`}
                  className="customer-row"
                  key={customer.id}
                >
                  <span className="customer-name">
                    <span className="dash-avatar">{customer.initials}</span>
                    <strong>{customer.name}</strong>
                  </span>
                  <span>{customer.company}</span>
                  <span>
                    <em className={`status ${customer.status.toLowerCase()}`}>
                      {customer.status === "active" ? "Active" : "Inactive"}
                    </em>
                  </span>
                  <span>{customer.date}</span>
                </Link>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="empty-search">No customers found.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}