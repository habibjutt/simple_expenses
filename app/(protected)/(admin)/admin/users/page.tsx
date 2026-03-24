import { listAdminUsers } from "@/app/api/admin-action";
import { Users } from "lucide-react";
import { UsersTable } from "./UsersTable";
import UserSearch from "./UserSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; banned?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";
  const role = params.role ?? "";
  const banned = params.banned ?? "";

  const { users, total, pages } = await listAdminUsers({ page, search, role, banned });

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="size-4 text-[#4f6ef7]" />
            <span className="text-xs font-medium uppercase tracking-widest text-[#4f6ef7]">
              User Management
            </span>
          </div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total user{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <UserSearch defaultSearch={search} defaultRole={role} defaultBanned={banned} />

      <UsersTable users={users} />

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page - 1}&search=${search}&role=${role}&banned=${banned}`}>
                  Previous
                </Link>
              </Button>
            )}
            {page < pages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page + 1}&search=${search}&role=${role}&banned=${banned}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
