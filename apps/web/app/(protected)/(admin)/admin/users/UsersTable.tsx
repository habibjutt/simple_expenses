"use client";

import { useState, useTransition } from "react";
import {
  setUserRole,
  banUser,
  unbanUser,
  adminDeleteUser,
} from "@/app/api/admin-action";
import {
  Shield,
  ShieldOff,
  Trash2,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";
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
    if (
      !confirm(
        "Permanently delete this user and all their data? This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      await adminDeleteUser(userId);
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
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
