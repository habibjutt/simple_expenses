"use client";

import { useState, useTransition } from "react";
import { setUserRole, banUser, unbanUser, adminDeleteUser } from "@/app/api/admin-action";
import { Shield, ShieldOff, Trash2, MoreHorizontal, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  subscriptionStatus: string | null;
  createdAt: Date;
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={
        role === "admin"
          ? { background: "rgba(79,110,247,0.15)", color: "#a5b4ff" }
          : { background: "rgba(100,116,139,0.15)", color: "#94a3b8" }
      }
    >
      {role}
    </span>
  );
}

function StatusBadge({ user }: { user: User }) {
  if (user.banned) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>
        banned
      </span>
    );
  }
  if (!user.subscriptionStatus) {
    return <span className="text-xs" style={{ color: "#64748b" }}>free</span>;
  }
  const color = user.subscriptionStatus === "active" ? "#22c55e" : "#f59e0b";
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${color}18`, color }}>
      {user.subscriptionStatus}
    </span>
  );
}

export function UsersTable({ users }: { users: User[] }) {
  const [, startTransition] = useTransition();
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const handleSetRole = (userId: string, role: "user" | "admin") => {
    startTransition(async () => {
      await setUserRole(userId, role);
    });
  };

  const handleBan = (userId: string) => {
    if (!banReason.trim()) return;
    startTransition(async () => {
      await banUser(userId, banReason);
      setBanTarget(null);
      setBanReason("");
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      await unbanUser(userId);
    });
  };

  const handleDelete = (userId: string) => {
    if (!confirm("Permanently delete this user and all their data? This cannot be undone.")) return;
    startTransition(async () => {
      await adminDeleteUser(userId);
    });
  };

  return (
    <>
      {/* Ban modal */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(7,12,26,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md mx-4 rounded-2xl p-6 border" style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}>
            <h3 className="text-white font-semibold mb-3">Ban User</h3>
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>Provide a reason for the ban:</p>
            <input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason..."
              className="w-full rounded-lg px-3 py-2 text-sm border mb-4 bg-transparent text-white outline-none"
              style={{ borderColor: "#1a2d4a" }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setBanTarget(null); setBanReason(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ borderColor: "#1a2d4a", color: "#94a3b8" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBan(banTarget)}
                disabled={!banReason.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "#ef4444", color: "white" }}
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        {/* Mobile card list */}
        <div className="md:hidden divide-y" style={{ borderColor: "#1a2d4a" }}>
          {users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>No users found.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white text-sm">{u.name || "—"}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>{u.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge user={u} />
                    <span className="text-xs" style={{ color: "#3d5a80" }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1.5 rounded-lg border transition-colors hover:text-white shrink-0"
                      style={{ borderColor: "#1a2d4a", color: "#64748b" }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {u.role !== "admin" ? (
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => handleSetRole(u.id, "admin")}>
                        <Shield className="w-4 h-4 text-[#4f6ef7]" />Make Admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => handleSetRole(u.id, "user")}>
                        <UserCheck className="w-4 h-4" />Remove Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {u.banned ? (
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => handleUnban(u.id)}>
                        <ShieldOff className="w-4 h-4 text-green-500" />Unban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-orange-400" onClick={() => setBanTarget(u.id)}>
                        <ShieldOff className="w-4 h-4" />Ban User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-red-500 focus:text-red-500" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="w-4 h-4" />Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1a2d4a" }}>
                {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#3d5a80" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#1a2d4a" }}>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white truncate max-w-[180px]">
                          {u.name || "—"}
                        </p>
                        <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: "#64748b" }}>
                          {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge user={u} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg border transition-colors hover:text-white"
                            style={{ borderColor: "#1a2d4a", color: "#64748b" }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {u.role !== "admin" ? (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2"
                              onClick={() => handleSetRole(u.id, "admin")}
                            >
                              <Shield className="w-4 h-4 text-[#4f6ef7]" />
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2"
                              onClick={() => handleSetRole(u.id, "user")}
                            >
                              <UserCheck className="w-4 h-4" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {u.banned ? (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2"
                              onClick={() => handleUnban(u.id)}
                            >
                              <ShieldOff className="w-4 h-4 text-green-500" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2 text-orange-400"
                              onClick={() => setBanTarget(u.id)}
                            >
                              <ShieldOff className="w-4 h-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-2 text-red-500 focus:text-red-500"
                            onClick={() => handleDelete(u.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
