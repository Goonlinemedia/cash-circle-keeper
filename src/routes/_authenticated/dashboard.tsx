import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "Customer") {
    return <CustomerDashboard />;
  }

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

function CustomerDashboard() {
  const { user } = useAuth();
  const db = useDB();

  // Find customer profile details
  const customer = db.customers.find((c) => c.id === user?.id);

  // Filter transactions for this customer
  const transactions = useMemo(() => {
    return db.transactions
      .filter((t) => t.customerId === user?.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [db.transactions, user?.id]);

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-muted-foreground">Unable to load customer profile details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics
  const contributions = transactions.filter((t) => t.type === "IN");
  const withdrawals = transactions.filter((t) => t.type === "OUT");

  const totalContributed = contributions.reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = withdrawals.reduce((s, t) => s + t.amount, 0);
  const currentBalance = totalContributed - totalWithdrawn;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 md:p-8 relative overflow-hidden shadow-lg border border-primary/20">
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative space-y-2">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 font-medium">
            Customer Portal
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Welcome back, {customer.name}!
          </h2>
          <p className="text-sm text-primary-foreground/80 max-w-md">
            Track your thrift savings, contributions, and withdrawals in real-time.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden border-border/40 shadow-sm bg-gradient-to-br from-card to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Balance
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-success tabular-nums">
                  {formatNaira(currentBalance)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Available thrift savings</p>
              </div>
              <div className="size-10 rounded-xl bg-success/15 text-success grid place-items-center">
                <Wallet className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Saved
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground tabular-nums">
                  {formatNaira(totalContributed)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {contributions.length} collections recorded
                </p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <ArrowDownToLine className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Withdrawn
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground tabular-nums">
                  {formatNaira(totalWithdrawn)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {withdrawals.length} withdrawals recorded
                </p>
              </div>
              <div className="size-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center">
                <ArrowUpFromLine className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-border/60 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Your Account Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span className="text-muted-foreground">Target Contribution</span>
                <span className="font-bold text-foreground">
                  {formatNaira(customer.contributionAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span className="text-muted-foreground">Saving Frequency</span>
                <Badge variant="secondary" className="font-medium text-xs">
                  {customer.frequency}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={
                    customer.status === "Active"
                      ? "border-success/40 bg-success/15 text-success font-medium animate-pulse"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground"
                  }
                >
                  {customer.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Join Date</span>
                <span className="font-medium text-foreground">
                  {new Date(customer.startDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground px-1">
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              {customer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ledger Card */}
        <Card className="md:col-span-2 border-border/60 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Your Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-10 text-center">
                No transactions recorded yet.
              </div>
            ) : (
              <ul className="divide-y max-h-[400px] overflow-y-auto pr-2">
                {transactions.map((t) => {
                  const isContribution = t.type === "IN";
                  return (
                    <li key={t.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-9 rounded-full grid place-items-center shrink-0 ${isContribution ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                        >
                          {isContribution ? (
                            <ArrowDownToLine className="size-4" />
                          ) : (
                            <ArrowUpFromLine className="size-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {isContribution ? "Savings Contribution" : "Thrift Withdrawal"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(t.date).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                            {t.paymentMethod && ` · ${t.paymentMethod}`}
                            {t.reference && ` · Ref: ${t.reference}`}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold tabular-nums text-sm ${isContribution ? "text-success" : "text-destructive"}`}
                      >
                        {isContribution ? "+" : "-"} {formatNaira(t.amount)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
