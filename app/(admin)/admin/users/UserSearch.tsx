"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

export default function UserSearch({
  defaultSearch,
  defaultRole,
  defaultBanned,
}: {
  defaultSearch: string;
  defaultRole: string;
  defaultBanned: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams({
        search: defaultSearch,
        role: defaultRole,
        banned: defaultBanned,
        page: "1",
      });
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, defaultSearch, defaultRole, defaultBanned]
  );

  const inputStyle = {
    background: "#0f1e38",
    borderColor: "#1a2d4a",
    color: "#e2e8f0",
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
        <input
          defaultValue={defaultSearch}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
          style={inputStyle}
        />
      </div>
      <select
        defaultValue={defaultRole}
        onChange={(e) => update("role", e.target.value)}
        className="px-3 py-2 rounded-lg border text-sm outline-none"
        style={inputStyle}
      >
        <option value="">All roles</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <select
        defaultValue={defaultBanned}
        onChange={(e) => update("banned", e.target.value)}
        className="px-3 py-2 rounded-lg border text-sm outline-none"
        style={inputStyle}
      >
        <option value="">All statuses</option>
        <option value="false">Active</option>
        <option value="true">Banned</option>
      </select>
    </div>
  );
}
