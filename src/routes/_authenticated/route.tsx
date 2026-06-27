import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready) {
      if (!user) {
        navigate({ to: "/login", replace: true });
      } else if (user.role === "Customer" && pathname !== "/dashboard") {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [ready, user, navigate, pathname]);

  if (!ready || !user) return null;

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/customers": "Customers",
    "/collections": "Record Collection",
    "/withdrawals": "Record Withdrawal",
    "/transactions": "Transactions",
    "/reports": "Reports",
    "/settings": "Settings",
  };
  const title =
    Object.entries(titleMap).find(([k]) => pathname.startsWith(k))?.[1] ?? "Debbby Ajo Manager";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card/50 backdrop-blur px-4 sticky top-0 z-10">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
            <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
