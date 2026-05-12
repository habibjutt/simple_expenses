"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setUserRole,
  banUser,
  unbanUser,
  adminDeleteUser,
  adminBulkDeleteUsers,
} from "@/app/api/admin-action";
import {
  Shield,
  ShieldOff,
  Trash2,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  subscriptionStatus: string | null;
  createdAt: Date;
  trialEndsAt: Date | null;
  _count: {
    bankAccounts: number;
    creditCards: number;
  };
};

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <Badge
      variant="outline"
      className="text-[#a5b4ff] border-[#4f6ef7]/40 bg-[#4f6ef7]/10 text-[11px]"
    >
      admin
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground text-[11px]">
      user
    </Badge>
  );
}

function StatusBadge({ user }: { user: User }) {
  if (user.banned) {
    return (
      <Badge
        variant="outline"
        className="text-red-400 border-red-500/30 bg-red-500/10 text-[11px]"
      >
        banned
      </Badge>
    );
  }
  if (!user.subscriptionStatus) {
    return <span className="text-xs text-muted-foreground">free</span>;
  }
  const isActive = user.subscriptionStatus === "active";
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "text-green-400 border-green-500/30 bg-green-500/10 text-[11px]"
          : "text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px]"
      }
    >
      {user.subscriptionStatus}
    </Badge>
  );
}

export function UsersTable({ users }: { users: User[] }) {
  const [, startTransition] = useTransition();
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  const allSelected = users.length > 0 && selected.size === users.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSetRole = (userId: string, role: "user" | "admin") => {
    startTransition(async () => {
      await setUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
      router.refresh();
    });
  };

  const handleBan = (userId: string) => {
    if (!banReason.trim()) return;
    startTransition(async () => {
      await banUser(userId, banReason);
      setBanTarget(null);
      setBanReason("");
      toast.success("User banned");
      router.refresh();
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      await unbanUser(userId);
      toast.success("User unbanned");
      router.refresh();
    });
  };

  const handleDelete = (userId: string) => {
    if (
      !confirm(
        "Permanently delete this user and all their data? This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      await adminDeleteUser(userId);
      toast.success("User deleted");
      router.refresh();
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    if (
      !confirm(
        `Permanently delete ${ids.length} user${ids.length !== 1 ? "s" : ""} and all their data? This cannot be undone.`,
      )
    )
      return;
    startTransition(async () => {
      await adminBulkDeleteUsers(ids);
      setSelected(new Set());
      toast.success(`${ids.length} user${ids.length !== 1 ? "s" : ""} deleted`);
      router.refresh();
    });
  };

  return (
    <>
      {/* Ban modal */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl p-6 border bg-card">
            <h3 className="font-semibold mb-3">Ban User</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Provide a reason for the ban:
            </p>
            <input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason..."
              className="w-full rounded-lg px-3 py-2 text-sm border mb-4 bg-background outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setBanTarget(null);
                  setBanReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!banReason.trim()}
                onClick={() => handleBan(banTarget)}
              >
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selected.size} user{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-3.5" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        {/* Mobile card list */}
        <div className="md:hidden divide-y">
          {users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 flex items-start gap-3">
                <Checkbox
                  checked={selected.has(u.id)}
                  onCheckedChange={() => toggleOne(u.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{u.name || "—"}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-xs mt-0.5 text-muted-foreground truncate">
                    {u.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge user={u} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-US")}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {u._count.bankAccounts} acct{u._count.bankAccounts !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {u._count.creditCards} card{u._count.creditCards !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Trial:</span>
                    {(() => {
                      const trialEnd = u.trialEndsAt
                        ? new Date(u.trialEndsAt)
                        : new Date(new Date(u.createdAt).getTime() + 14 * 86_400_000);
                      const expired = trialEnd < new Date();
                      return (
                        <span className={`text-xs font-medium ${expired ? "text-red-500" : "text-emerald-600"}`}>
                          {trialEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {expired ? " (expired)" : ""}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <ActionMenu
                  u={u}
                  onSetRole={handleSetRole}
                  onBan={setBanTarget}
                  onUnban={handleUnban}
                  onDelete={handleDelete}
                />
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.dataset.indeterminate = someSelected ? "true" : "false";
                    }}
                    data-indeterminate={someSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className={someSelected ? "opacity-70" : ""}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead>Cards</TableHead>
                <TableHead>Trial Expires</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    data-state={selected.has(u.id) ? "selected" : undefined}
                    className={selected.has(u.id) ? "bg-muted/40" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(u.id)}
                        onCheckedChange={() => toggleOne(u.id)}
                        aria-label={`Select ${u.name ?? u.email}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[180px]">
                          {u.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {u.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge user={u} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u._count.bankAccounts}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u._count.creditCards}
                    </TableCell>
                    <TableCell className="text-xs">
                      {(() => {
                        const trialEnd = u.trialEndsAt
                          ? new Date(u.trialEndsAt)
                          : new Date(new Date(u.createdAt).getTime() + 14 * 86_400_000);
                        const expired = trialEnd < new Date();
                        return (
                          <span className={expired ? "text-red-500" : "text-emerald-600 font-medium"}>
                            {trialEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {expired ? " (expired)" : ""}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        u={u}
                        onSetRole={handleSetRole}
                        onBan={setBanTarget}
                        onUnban={handleUnban}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function ActionMenu({
  u,
  onSetRole,
  onBan,
  onUnban,
  onDelete,
}: {
  u: User;
  onSetRole: (id: string, role: "user" | "admin") => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {u.role !== "admin" ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => onSetRole(u.id, "admin")}
          >
            <Shield className="size-4 text-[#4f6ef7]" /> Make Admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => onSetRole(u.id, "user")}
          >
            <UserCheck className="size-4" /> Remove Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {u.banned ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => onUnban(u.id)}
          >
            <ShieldOff className="size-4 text-green-500" /> Unban User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-amber-500 focus:text-amber-500"
            onClick={() => onBan(u.id)}
          >
            <ShieldOff className="size-4" /> Ban User
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          onClick={() => onDelete(u.id)}
        >
          <Trash2 className="size-4" /> Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
