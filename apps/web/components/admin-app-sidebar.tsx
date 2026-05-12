"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconChartBar,
  IconFlag,
  IconClipboardList,
  IconMail,
  type Icon,
} from "@tabler/icons-react";
import { LayoutDashboard } from "lucide-react";

import { AdminNavMain } from "@/components/admin-nav-main";
import { AdminNavUser } from "@/components/admin-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const iconMap: Record<string, Icon> = {
  dashboard: IconDashboard,
  users: IconUsers,
  subscriptions: IconCreditCard,
  metrics: IconChartBar,
  flags: IconFlag,
  logs: IconClipboardList,
  enquiries: IconMail,
};

const navItems: Array<{
  title: string;
  url: string;
  iconKey: keyof typeof iconMap;
  exact?: boolean;
  items?: Array<{ title: string; url: string }>;
}> = [
  { title: "Overview", url: "/admin", iconKey: "dashboard", exact: true },
  { title: "Users", url: "/admin/users", iconKey: "users" },
  {
    title: "Subscriptions",
    url: "/admin/subscriptions",
    iconKey: "subscriptions",
  },
  { title: "Metrics", url: "/admin/metrics", iconKey: "metrics" },
  { title: "Feature Flags", url: "/admin/flags", iconKey: "flags" },
  { title: "Audit Logs", url: "/admin/logs", iconKey: "logs" },
  { title: "Enquiries", url: "/admin/enquiries", iconKey: "enquiries" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminAppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 data-[slot=sidebar-menu-button]:!p-0 hover:bg-transparent active:bg-transparent"
            >
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gray-900">
                  <LayoutDashboard className="size-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-semibold text-sidebar-foreground">Fixpenses</span>
                  <span className="text-[11px] text-sidebar-foreground/50 font-medium tracking-wide uppercase">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <AdminNavMain
          items={navItems.map((item) => ({
            ...item,
            icon: iconMap[item.iconKey],
          }))}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <AdminNavUser
          user={{
            name: user?.name ?? "Admin",
            email: user?.email ?? "",
            avatar: user?.image ?? "",
            initials: user?.name ? getInitials(user.name) : "AD",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
