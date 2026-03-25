"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconChartBar,
  IconFlag,
  IconClipboardList,
  IconShield,
  type Icon,
} from "@tabler/icons-react";

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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-[#4f6ef7] to-[#6c47ff]">
                  <IconShield className="size-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold">Admin Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AdminNavMain
          items={navItems.map((item) => ({
            ...item,
            icon: iconMap[item.iconKey],
          }))}
        />
      </SidebarContent>

      <SidebarFooter>
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
