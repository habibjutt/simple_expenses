"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          defaultValue={defaultSearch}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
        />
      </div>

      <Select defaultValue={defaultRole || "all"} onValueChange={(v) => update("role", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={defaultBanned || "all"} onValueChange={(v) => update("banned", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="false">Active</SelectItem>
          <SelectItem value="true">Banned</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
