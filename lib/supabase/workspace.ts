import { auth } from "@/auth";
import { hasPermission, type Permission, type Role } from "@/lib/permissions";
import { querySupabase, getSupabasePool } from "@/lib/supabase/admin";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string | null;
  job_title?: string | null;
  status: "ACTIVE" | "INACTIVE";
  location?: string | null;
  preferred_contact: "Email" | "Phone";
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  entity: string | null;
  actor: string;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type ReportData = {
  total: number;
  active: number;
  inactive: number;
  recent: number;
  companies: { company: string; count: number }[];
};

export type DashboardAnalytics = {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  activeRate: number;
  growthMonths: string[];
  growthData: number[];
  recentActivities: {
    id: string;
    text: string;
    timeAgo: string;
  }[];
  recentCustomers: {
    id: string;
    name: string;
    company: string;
    status: "active" | "inactive";
    date: string;
    initials: string;
  }[];
};

async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user?.email || !hasPermission(session.user.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function getSupabaseActivity(): Promise<ActivityEntry[]> {
  await requirePermission("customers.read");

  const rows = await querySupabase<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    customer_id: string | null;
    actor_user_id: string;
    created_at: string;
    actor_name: string | null;
    customer_name: string | null;
  }>(`
    SELECT 
      a.id, 
      a.action, 
      a.entity_type, 
      a.entity_id, 
      a.customer_id, 
      a.actor_user_id, 
      a.created_at,
      p.name AS actor_name,
      c.name AS customer_name
    FROM public.activities a
    LEFT JOIN public.profiles p ON a.actor_user_id = p.id
    LEFT JOIN public.customers c ON a.customer_id = c.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `);

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entity: row.customer_name ?? (row.entity_id ? `Record #${row.entity_id.slice(0, 8)}` : null),
    actor: row.actor_name ?? "Workspace member",
    createdAt: new Date(row.created_at).toLocaleString(),
  }));
}

export async function getSupabaseReports(
  period: "week" | "month" | "quarter" | "year" = "month"
): Promise<ReportData> {
  await requirePermission("customers.read");

  const start = new Date();
  if (period === "week") start.setDate(start.getDate() - 7);
  else if (period === "month") start.setDate(start.getDate() - 30);
  else if (period === "quarter") start.setMonth(start.getMonth() - 3);
  else if (period === "year") start.setFullYear(start.getFullYear() - 1);

  const [statsRows, companyRows] = await Promise.all([
    querySupabase<{
      total: number;
      active: number;
      inactive: number;
      recent: number;
    }>(
      `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
        COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS inactive,
        COUNT(*) FILTER (WHERE created_at >= $1)::int AS recent
      FROM public.customers
    `,
      [start.toISOString()]
    ),
    querySupabase<{
      company: string;
      count: number;
    }>(`
      SELECT 
        company, 
        COUNT(*)::int AS count
      FROM public.customers
      WHERE company IS NOT NULL AND trim(company) != ''
      GROUP BY company
      ORDER BY count DESC
      LIMIT 5
    `),
  ]);

  const stats = statsRows[0] ?? { total: 0, active: 0, inactive: 0, recent: 0 };
  return {
    total: stats.total ?? 0,
    active: stats.active ?? 0,
    inactive: stats.inactive ?? 0,
    recent: stats.recent ?? 0,
    companies: companyRows ?? [],
  };
}

export async function getSupabaseTeamMembers(): Promise<TeamMember[]> {
  await requirePermission("users.read");

  const rows = await querySupabase<{
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }>(`
    SELECT id, name, email, role, created_at
    FROM public.profiles
    ORDER BY created_at DESC
  `);

  return rows.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: (member.role as Role) || "USER",
    createdAt: new Date(member.created_at).toLocaleDateString(),
  }));
}

export async function changeSupabaseTeamRole(id: string, role: Role): Promise<TeamMember> {
  const session = await requirePermission("roles.manage");
  if (id === session.user.id) {
    throw new Error("SELF_ROLE");
  }
  if (!["ADMIN", "MANAGER", "USER"].includes(role)) {
    throw new Error("INVALID_ROLE");
  }

  const pool = getSupabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentRes = await client.query<{ id: string; role: string; name: string; email: string }>(
      "SELECT id, role, name, email FROM public.profiles WHERE id = $1",
      [id]
    );
    const current = currentRes.rows[0];
    if (!current) {
      throw new Error("TARGET_PROFILE_NOT_FOUND");
    }

    // Resolve actor profile
    let actorId: string | null = null;
    const actorRes = await client.query<{ id: string }>(
      "SELECT id FROM public.profiles WHERE lower(email) = lower($1) LIMIT 1",
      [session.user.email]
    );
    if (actorRes.rows[0]) {
      actorId = actorRes.rows[0].id;
    } else {
      // If actor profile does not exist, look up by id if uuid
      const byIdRes = await client.query<{ id: string }>(
        "SELECT id FROM public.profiles WHERE id::text = $1 LIMIT 1",
        [session.user.id]
      );
      if (byIdRes.rows[0]) {
        actorId = byIdRes.rows[0].id;
      } else {
        // Create an actor profile row for this session user if missing
        const newActor = await client.query<{ id: string }>(
          `INSERT INTO public.profiles (id, name, email, role) 
           VALUES (gen_random_uuid(), $1, $2, $3) 
           ON CONFLICT (lower(email)) DO UPDATE SET name = EXCLUDED.name 
           RETURNING id`,
          [session.user.name || "Administrator", session.user.email, session.user.role || "ADMIN"]
        );
        actorId = newActor.rows[0]?.id;
      }
    }

    const updateRes = await client.query<{
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    }>(
      `UPDATE public.profiles 
       SET role = $1, updated_at = timezone('utc', now()) 
       WHERE id = $2 
       RETURNING id, name, email, role, created_at`,
      [role, id]
    );
    const updated = updateRes.rows[0];
    if (!updated) {
      throw new Error("SUPABASE_ROLE_UPDATE_FAILED");
    }

    if (actorId) {
      await client.query(
        `INSERT INTO public.activities (actor_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'User role changed', 'user', $2, $3)`,
        [
          actorId,
          id,
          JSON.stringify({ oldRole: current.role, newRole: role, targetUser: current.name }),
        ]
      );
    }

    await client.query("COMMIT");

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as Role,
      createdAt: new Date(updated.created_at).toLocaleDateString(),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getSupabaseAnalytics(
  period: "week" | "month" | "quarter" | "year" = "month"
): Promise<DashboardAnalytics> {
  await requirePermission("customers.read");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [statsRows, recentActivityRows, recentCustomerRows, customerDates] = await Promise.all([
    querySupabase<{
      total: number;
      active: number;
      inactive: number;
      new_this_month: number;
    }>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
        COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS inactive,
        COUNT(*) FILTER (WHERE created_at >= $1)::int AS new_this_month
      FROM public.customers
    `, [startOfMonth.toISOString()]),

    querySupabase<{
      id: string;
      action: string;
      created_at: string;
      actor_name: string | null;
      customer_name: string | null;
    }>(`
      SELECT 
        a.id, 
        a.action, 
        a.created_at,
        p.name AS actor_name,
        c.name AS customer_name
      FROM public.activities a
      LEFT JOIN public.profiles p ON a.actor_user_id = p.id
      LEFT JOIN public.customers c ON a.customer_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `),

    querySupabase<{
      id: string;
      name: string;
      company: string;
      status: string;
      created_at: string;
    }>(`
      SELECT id, name, company, status, created_at
      FROM public.customers
      ORDER BY created_at DESC
      LIMIT 5
    `),

    querySupabase<{ created_at: string }>(`
      SELECT created_at FROM public.customers
      ORDER BY created_at ASC
    `),
  ]);

  const stats = statsRows[0] ?? { total: 0, active: 0, inactive: 0, new_this_month: 0 };
  const total = stats.total ?? 0;
  const active = stats.active ?? 0;
  const inactive = stats.inactive ?? 0;
  const newThisMonth = stats.new_this_month ?? 0;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  // Build 6-month growth curve from real customer creation dates
  const now = new Date();
  const months: string[] = [];
  const monthlyCounts: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("default", { month: "short" });
    months.push(monthLabel);

    const endOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    // cumulative or created count up to end of this month
    const countUpTo = customerDates.filter(
      (c) => new Date(c.created_at) <= endOfTargetMonth
    ).length;
    monthlyCounts.push(countUpTo);
  }

  function formatTimeAgo(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  const recentActivities = recentActivityRows.map((row) => {
    let text = row.action;
    if (row.customer_name) text = `${row.action}: ${row.customer_name}`;
    else if (row.actor_name) text = `${row.action} by ${row.actor_name}`;
    return {
      id: row.id,
      text,
      timeAgo: formatTimeAgo(row.created_at),
    };
  });

  const recentCustomers = recentCustomerRows.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    status: (c.status.toLowerCase() === "active" ? "active" : "inactive") as "active" | "inactive",
    date: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    initials: c.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
  }));

  return {
    totalCustomers: total,
    activeCustomers: active,
    inactiveCustomers: inactive,
    newCustomersThisMonth: newThisMonth,
    activeRate,
    growthMonths: months,
    growthData: monthlyCounts,
    recentActivities,
    recentCustomers,
  };
}
