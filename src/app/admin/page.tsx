"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { adminService, AdminMetrics, AdminUserAccount } from "@/services/adminService";
import { authService, UserAccountStatus, UserRole } from "@/services/authService";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserAccountStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Verify admin role securely from database
      const hasAdmin = await authService.isAdmin();
      if (!mounted) return;

      if (!hasAdmin) {
        setIsAuthorized(false);
        router.push("/dashboard?error=unauthorized_admin_access");
        return;
      }

      setIsAuthorized(true);

      // 2. Load account-level metrics and user accounts
      try {
        const [liveMetrics, liveUsers] = await Promise.all([
          adminService.getMetrics(),
          adminService.getUsersList(),
        ]);
        if (mounted) {
          setMetrics(liveMetrics);
          setUsers(liveUsers);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[AdminDashboard] Failed to load data:", err);
        if (mounted) setIsLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleStatusChange = async (userId: string, newStatus: UserAccountStatus) => {
    setActionFeedback(null);
    const res = await adminService.updateUserStatus(userId, newStatus);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      setActionFeedback(`User status updated to ${newStatus}.`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionFeedback(null);
    const res = await adminService.updateUserRole(userId, newRole);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setActionFeedback(`User role changed to ${newRole}.`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isAuthorized === false) {
    return (
      <PageContainer>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
            <Icon name="lock" size={32} />
          </div>
          <h2 className="text-xl font-bold font-headline text-on-surface">Access Denied</h2>
          <p className="text-sm text-on-surface-variant text-center max-w-sm">
            You must have administrative privileges to view account management metrics.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary-container/20 text-primary">
                <Icon name="shield" size={20} />
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                Admin Console
              </h1>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              SYSTEM LEVEL ACCOUNT MANAGEMENT & METRICS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Admin Session
            </span>
          </div>
        </div>

        {/* Privacy & Security Guarantee Banner */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-primary-container/30 shadow-lg relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary-container/20 text-primary shrink-0 mt-0.5">
              <Icon name="privacy_tip" size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-on-surface">
                Zero-Knowledge User Data Protection
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                In strict compliance with the multi-user architecture and PostgreSQL Row-Level Security,
                this admin console displays <strong>only account-level metadata</strong> (signup dates,
                active status, and account activity). Private user tasks, notes, documents, and calendar
                entries remain encrypted and isolated to each individual owner.
              </p>
            </div>
          </div>
        </div>

        {/* Action Feedback Toast */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in-50">
            <Icon name="check_circle" size={16} className="text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Account-Level Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Total Users
              </span>
              <Icon name="groups" size={18} className="text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {isLoading ? "—" : metrics?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-on-surface-variant">Registered TaskFlow accounts</p>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                New Users
              </span>
              <Icon name="person_add" size={18} className="text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {isLoading ? "—" : metrics?.newUsers ?? 0}
            </div>
            <p className="text-xs text-cyan-400 font-medium">Joined past 7 days</p>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Active Users
              </span>
              <Icon name="bolt" size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {isLoading ? "—" : metrics?.activeUsers ?? 0}
            </div>
            <p className="text-xs text-emerald-400 font-medium">Active in last 30 days</p>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Inactive Users
              </span>
              <Icon name="hourglass_empty" size={18} className="text-outline" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {isLoading ? "—" : metrics?.inactiveUsers ?? 0}
            </div>
            <p className="text-xs text-outline">Dormant or paused</p>
          </div>
        </section>

        {/* Registered Users Table Card */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-xl overflow-hidden space-y-4">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-headline text-on-surface">
                Registered Accounts ({filteredUsers.length})
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                ACCOUNT STATUS & ACTIVITY AUDIT
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {/* Search Bar */}
              <div className="relative flex items-center min-w-[220px]">
                <span className="absolute left-3 text-outline">
                  <Icon name="search" size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full bg-surface-container text-xs text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-1.5 rounded-lg border border-outline-variant/15 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | UserAccountStatus)}
                className="bg-surface-container text-xs text-on-surface px-3 py-1.5 rounded-lg border border-outline-variant/15 focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container text-outline font-mono uppercase tracking-wider border-b border-outline-variant/15">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Account Status</th>
                  <th className="py-3 px-5">Signup Date</th>
                  <th className="py-3 px-5">Last Active</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-outline">
                      No accounts found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            src={user.avatarUrl}
                            name={user.name}
                            alt={user.name}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-on-surface block truncate max-w-[140px]">
                              {user.name}
                            </span>
                            <span className="text-[11px] font-mono text-outline block truncate max-w-[140px]">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-5 font-mono text-on-surface-variant">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-5">
                        {user.role === "admin" ? (
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 font-mono text-[11px] font-semibold">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/20 font-mono text-[11px]">
                            User
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5">
                        {user.status === "active" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-medium flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        )}
                        {user.status === "inactive" && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-outline border border-outline-variant/20 font-mono text-[11px] flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            Inactive
                          </span>
                        )}
                        {user.status === "suspended" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono text-[11px] font-medium flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Signup Date */}
                      <td className="py-3.5 px-5 font-mono text-on-surface-variant">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-5 font-mono text-on-surface-variant">
                        {user.lastActiveAt
                          ? new Date(user.lastActiveAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) +
                            " " +
                            new Date(user.lastActiveAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(user.id, "inactive")}
                              className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                              title="Set status to Inactive"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Set status to Active"
                            >
                              Activate
                            </button>
                          )}

                          {user.role === "admin" ? (
                            <button
                              type="button"
                              onClick={() => handleRoleChange(user.id, "user")}
                              className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                              title="Demote to standard User"
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRoleChange(user.id, "admin")}
                              className="px-2 py-1 rounded bg-primary-container/20 hover:bg-primary-container/30 text-primary transition-colors"
                              title="Promote to Admin"
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
