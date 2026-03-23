import { listAdminUsers } from "@/app/api/admin-action";
import { Users } from "lucide-react";
import { UsersTable } from "./UsersTable";
import UserSearch from "./UserSearch";

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
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#4f6ef7" }}>
            User Management
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          {total} total user{total !== 1 ? "s" : ""}
        </p>
      </div>

      <UserSearch defaultSearch={search} defaultRole={role} defaultBanned={banned} />

      <UsersTable users={users} />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#64748b" }}>
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}&search=${search}&role=${role}&banned=${banned}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{ borderColor: "#1a2d4a", color: "#94a3b8", background: "#0f1e38" }}
              >
                Previous
              </a>
            )}
            {page < pages && (
              <a
                href={`?page=${page + 1}&search=${search}&role=${role}&banned=${banned}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{ borderColor: "#1a2d4a", color: "#94a3b8", background: "#0f1e38" }}
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
