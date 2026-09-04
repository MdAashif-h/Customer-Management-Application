"use client";

import { Check, ChevronDown, Search, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { changeUserRoleAction } from "@/app/actions/users";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
  createdAt: string;
};

export function TeamMembersPage({
  members = [],
  canManage,
}: {
  members: Member[];
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [selected, setSelected] = useState<Member | null>(null);
  const [nextRole, setNextRole] = useState<Member["role"]>("USER");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const visible = members.filter(
    (item) =>
      `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()) &&
      (role === "all" || item.role === role)
  );

  async function changeRole() {
    if (!selected) return;
    setSaving(true);
    setErrorMsg("");
    try {
      await changeUserRoleAction(selected.id, nextRole);
      setSelected(null);
      window.location.reload();
    } catch (err: any) {
      if (err?.message === "SELF_ROLE") {
        setErrorMsg("You cannot change your own role.");
      } else {
        setErrorMsg("Failed to update role. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  function initials(name: string) {
    return (
      name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  }

  return (
    <div className="dashboard-page workspace-page">
      <DashboardSidebar
        mobileOpen={open}
        onClose={() => setOpen(false)}
        activeLabel="Team members"
      />
      <div className="dashboard-main">
        <header className="workspace-header">
          <button
            className="dashboard-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <UserRoundCog size={18} />
          </button>
          <div>
            <p>Manage / Team members</p>
            <h1>Team members</h1>
            <span>Manage the people who have access to your Custora workspace.</span>
          </div>
          {canManage && <button className="period-button">+ Invite member</button>}
        </header>
        <main>
          <div className="workspace-toolbar">
            <label className="workspace-search">
              <Search size={16} />
              <span className="sr-only">Search team members</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search team members..."
              />
            </label>
            <label className="workspace-select">
              <span className="sr-only">Filter by role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="all">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>

          <section className="customer-list-card">
            {visible.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="customer-person">
                            <span className="dash-avatar">
                              {initials(member.name)}
                            </span>
                            <strong>{member.name}</strong>
                          </div>
                        </td>
                        <td>{member.email}</td>
                        <td>
                          <span className="role-badge">{member.role}</span>
                        </td>
                        <td>{member.createdAt}</td>
                        <td>
                          {canManage && (
                            <button
                              className="role-change-button"
                              onClick={() => {
                                setSelected(member);
                                setNextRole(member.role);
                                setErrorMsg("");
                              }}
                            >
                              Change role
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="workspace-empty py-12 flex flex-col items-center justify-center text-center">
                <Users size={24} className="text-[var(--muted)] opacity-60 mb-3" />
                <h2>No team members found</h2>
                <p>
                  {query || role !== "all"
                    ? "Try adjusting your search query or role filter."
                    : "No team members are currently registered in this workspace."}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      {selected && (
        <div className="dialog-backdrop">
          <div
            className="delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-dialog-title"
          >
            <span className="delete-mark">
              <ShieldCheck size={17} />
            </span>
            <h2 id="role-dialog-title">Change user role?</h2>
            <p>
              Change <strong>{selected.name}</strong> from{" "}
              <strong>{selected.role}</strong> to:
            </p>
            <select
              className="role-dialog-select"
              value={nextRole}
              onChange={(event) =>
                setNextRole(event.target.value as Member["role"])
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
            </select>
            {errorMsg && (
              <p className="text-xs text-[#f28c8c] mt-2 text-center" role="alert">
                {errorMsg}
              </p>
            )}
            <div className="dialog-buttons">
              <button
                className="period-button"
                onClick={() => {
                  setSelected(null);
                  setErrorMsg("");
                }}
              >
                Cancel
              </button>
              <button
                className="role-change-button"
                disabled={saving}
                onClick={changeRole}
              >
                {saving ? (
                  "Changing..."
                ) : (
                  <>
                    <Check size={14} /> Confirm change
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}