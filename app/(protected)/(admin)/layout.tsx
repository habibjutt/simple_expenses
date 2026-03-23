import { requireAdmin } from "@/lib/permissions";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel — Simple Expenses",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex" style={{ background: "#070c1a" }}>
      <AdminSidebar userEmail={session.user.email} userName={session.user.name} />
      <main className="flex-1 min-w-0 flex flex-col pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
