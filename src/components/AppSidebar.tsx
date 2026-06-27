import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  BarChart3,
  Settings,
  Coins,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Collections", url: "/collections", icon: ArrowDownToLine },
  { title: "Withdrawals", url: "/withdrawals", icon: ArrowUpFromLine },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="size-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center shrink-0">
            <Coins className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-display font-bold text-base leading-tight truncate">
              Ajo Manager
            </div>
            <div className="text-[11px] text-sidebar-foreground/70 truncate">Thrift collection</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="size-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground grid place-items-center text-xs font-semibold shrink-0">
            {user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-[11px] text-sidebar-foreground/70 truncate">{user?.role}</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-sidebar-foreground/80 hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
