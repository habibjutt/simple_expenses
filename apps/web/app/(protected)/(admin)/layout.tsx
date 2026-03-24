import { requireAdmin } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminAppSidebar } from "@/components/admin-app-sidebar";
import { AdminSiteHeader } from "@/components/admin-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "Admin Panel — Simple Expenses",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminAppSidebar variant="inset" user={session?.user} />
      <SidebarInset>
        <AdminSiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
