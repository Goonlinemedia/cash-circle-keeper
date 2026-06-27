import { createFileRoute, Link } from "@tanstack/react-router";
import { useDB, cashBalance, totalIn, totalOut, customerById } from "@/lib/store";
import { formatNaira, isSameDay, todayISO } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const db = useDB();
  const today = todayISO();
  const txnsToday = db.transactions.filter((t) => isSameDay(t.date, today));
  const collectionsToday = totalIn(txnsToday);
  const withdrawalsToday = totalOut(txnsToday);
  const balance = cashBalance(db.transactions);

  const totalCustomers = db.customers.length;
  const activeCustomers = db.customers.filter((c) => c.status === "Active");
  const paidTodayIds = new Set(
    txnsToday.filter((t) => t.type === "IN" && t.customerId).map((t) => t.customerId!),
  );
  const paidToday = activeCustomers.filter((c) => paidTodayIds.has(c.id)).length;
  const pending = Math.max(0, activeCustomers.length - paidToday);

  const recent = db.transactions.slice(0, 8);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero balance */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative">
          <div className="text-sm/none text-primary-foreground/70 uppercase tracking-wider">
            Cash balance
          </div>
          <div className="font-display text-4xl md:text-5xl font-bold mt-2">
            {formatNaira(balance)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/collections">
                <ArrowDownToLine className="size-4" /> Record collection
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/withdrawals">
                <ArrowUpFromLine className="size-4" /> Record withdrawal
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Today's Collections"
          value={formatNaira(collectionsToday)}
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
        <KpiCard
          label="Today's Withdrawals"
          value={formatNaira(withdrawalsToday)}
          icon={<ArrowUpFromLine className="size-4" />}
          tone="destructive"
        />
        <KpiCard
          label="Total Customers"
          value={String(totalCustomers)}
          sub={`${activeCustomers.length} active`}
          icon={<Users className="size-4" />}
        />
        <KpiCard
          label="Paid Today"
          value={`${paidToday}/${activeCustomers.length}`}
          sub={`${pending} pending`}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent transactions</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/transactions">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((t) => {
                const customer = customerById(db, t.customerId);
                const label =
                  t.type === "IN"
                    ? (customer?.name ?? "Cash in")
                    : (t.withdrawalType ?? "Withdrawal");
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <div
                      className={`size-9 rounded-full grid place-items-center shrink-0 ${t.type === "IN" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                    >
                      {t.type === "IN" ? (
                        <ArrowDownToLine className="size-4" />
                      ) : (
                        <ArrowUpFromLine className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.type === "IN"
                          ? `${t.paymentMethod ?? "Cash"}${t.reference ? ` · ${t.reference}` : ""}`
                          : (t.description ?? t.withdrawalType ?? "—")}
                      </div>
                    </div>
                    <div
                      className={`font-semibold tabular-nums ${t.type === "IN" ? "text-success" : "text-destructive"}`}
                    >
                      {t.type === "IN" ? "+" : "-"} {formatNaira(t.amount)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Pending today */}
      <Card>
        <CardHeader>
          <CardTitle>Pending today</CardTitle>
        </CardHeader>
        <CardContent>
          {activeCustomers.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No active customers yet.{" "}
              <Link to="/customers" className="text-primary underline">
                Add one
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {activeCustomers
                .filter((c) => !paidTodayIds.has(c.id))
                .slice(0, 8)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNaira(c.contributionAmount)} · {c.frequency}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-accent/50 text-accent-foreground bg-accent/15"
                    >
                      Pending
                    </Badge>
                  </div>
                ))}
              {pending === 0 && (
                <div className="sm:col-span-2 text-sm text-success font-medium py-2">
                  Every active customer has paid today. 🎉
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "success" | "destructive";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  const iconBg =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "destructive"
        ? "bg-destructive/15 text-destructive"
        : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${toneCls}`}>
              {value}
            </div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
          </div>
          <div className={`size-9 rounded-lg grid place-items-center ${iconBg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
