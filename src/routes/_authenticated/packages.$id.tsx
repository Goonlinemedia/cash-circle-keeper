import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useDB } from "@/lib/store";
import { formatNaira, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users, Wallet, Target, ArrowDownToLine, ArrowUpFromLine, Calendar, Phone, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/packages/$id")({
  component: PackageDetailsPage,
});

function PackageDetailsPage() {
  const { id } = Route.useParams();
  const db = useDB();
  const navigate = useNavigate();

  // Find the package
  const pkg = useMemo(() => {
    return (db.ajoPackages || []).find((p) => p.id === id);
  }, [db.ajoPackages, id]);

  // Find enrolled customers
  const enrolledCustomers = useMemo(() => {
    return db.customers.filter((c) => c.ajoPackageId === id);
  }, [db.customers, id]);

  const customerIds = useMemo(() => new Set(enrolledCustomers.map((c) => c.id)), [enrolledCustomers]);

  // Get transactions for participants in this package
  const packageTxns = useMemo(() => {
    return db.transactions.filter((t) => t.customerId && customerIds.has(t.customerId));
  }, [db.transactions, customerIds]);

  // Calculate statistics
  const totalIn = useMemo(() => {
    return packageTxns.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  }, [packageTxns]);

  const totalOut = useMemo(() => {
    return packageTxns.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
  }, [packageTxns]);

  const currentSavings = totalIn - totalOut;

  // Circle target progress
  const targetPerCustomer = pkg?.targetAmount || 0;
  const totalCircleTarget = targetPerCustomer * enrolledCustomers.length;
  const circleProgressPercent =
    totalCircleTarget > 0 ? Math.min(100, Math.round((currentSavings / totalCircleTarget) * 100)) : 0;

  // Calculate metrics for each participant
  const participantsData = useMemo(() => {
    return enrolledCustomers.map((cust) => {
      const custTxns = db.transactions.filter((t) => t.customerId === cust.id);
      const custIn = custTxns.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
      const custOut = custTxns.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
      const savings = custIn - custOut;
      const progress = targetPerCustomer > 0 ? Math.min(100, Math.round((savings / targetPerCustomer) * 100)) : 0;

      return {
        ...cust,
        savings,
        progress,
      };
    });
  }, [enrolledCustomers, db.transactions, targetPerCustomer]);

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-muted-foreground">Ajo Package not found.</p>
            <Button onClick={() => navigate({ to: "/packages" })} variant="outline">
              Back to packages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <Link
        to="/packages"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Ajo packages
      </Link>

      {/* Package Header Card */}
      <Card className="border-border/60 relative overflow-hidden bg-card/50 backdrop-blur">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold">{pkg.name}</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                {pkg.description || "No description provided for this circle."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-semibold text-xs tracking-wider uppercase">
                {pkg.frequency}
              </Badge>
              <Badge variant="outline" className="font-bold text-xs tracking-wider bg-primary/5 text-primary border-primary/20">
                ₦{pkg.contributionAmount.toLocaleString()}/cycle
              </Badge>
              <Badge
                variant="outline"
                className={
                  pkg.status === "Active"
                    ? "border-success/40 bg-success/15 text-success font-medium"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                }
              >
                {pkg.status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6 pt-6 border-t">
            <div>
              <span className="text-xs text-muted-foreground block uppercase tracking-wider">Target savings per user</span>
              <span className="font-display text-lg font-bold text-foreground mt-1 block">
                {pkg.targetAmount ? formatNaira(pkg.targetAmount) : "Flexible"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block uppercase tracking-wider">Frequency cycle</span>
              <span className="font-display text-lg font-bold text-foreground mt-1 block">{pkg.frequency}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block uppercase tracking-wider">Target Duration</span>
              <span className="font-display text-lg font-bold text-foreground mt-1 block">
                {pkg.durationDays ? `${pkg.durationDays} Days` : "Ongoing"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block uppercase tracking-wider">Date Created</span>
              <span className="font-display text-lg font-bold text-foreground mt-1 block">{formatDate(pkg.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circle Target Progress */}
      {pkg.targetAmount && (
        <Card className="border-border/60">
          <CardContent className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-foreground">Circle Cumulative Progress</h3>
                <p className="text-xs text-muted-foreground">Total saved against target for all participants</p>
              </div>
              <span className="text-2xl font-bold text-success font-mono">{circleProgressPercent}%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${circleProgressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Wallet className="size-3.5" />
                Current savings: <strong>{formatNaira(currentSavings)}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Target className="size-3.5" />
                Cumulative target: <strong>{formatNaira(totalCircleTarget)}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Active savings balance</div>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-success">
                  {formatNaira(currentSavings)}
                </div>
              </div>
              <div className="size-8 rounded-lg bg-success/10 text-success grid place-items-center">
                <Wallet className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Collections (IN)</div>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-foreground">
                  {formatNaira(totalIn)}
                </div>
              </div>
              <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <ArrowDownToLine className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Withdrawals (OUT)</div>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-foreground">
                  {formatNaira(totalOut)}
                </div>
              </div>
              <div className="size-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
                <ArrowUpFromLine className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold">Circle Participants</CardTitle>
            <CardDescription>Customers currently enrolled in this savings circle.</CardDescription>
          </div>
          <Badge variant="secondary" className="font-semibold text-xs py-1 px-2.5">
            {enrolledCustomers.length} Users
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Total Contributed</TableHead>
                {pkg.targetAmount && <TableHead>Target Progress</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ledger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={pkg.targetAmount ? 7 : 6}
                    className="text-center text-sm text-muted-foreground py-12"
                  >
                    No customers enrolled in this package yet. Go to the customers list to enroll users.
                  </TableCell>
                </TableRow>
              ) : (
                participantsData.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-foreground">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">{c.phone}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(c.startDate)}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-success tabular-nums">
                      {formatNaira(c.savings)}
                    </TableCell>
                    {pkg.targetAmount && (
                      <TableCell className="w-56">
                        <div className="space-y-1 max-w-[200px]">
                          <div className="flex justify-between text-[10px] font-medium font-mono text-muted-foreground">
                            <span>{formatNaira(c.savings)}</span>
                            <span>{c.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          c.status === "Active"
                            ? "border-success/40 bg-success/10 text-success text-[10px] py-0 px-2 font-medium"
                            : "border-muted-foreground/30 bg-muted text-muted-foreground text-[10px] py-0 px-2 font-medium"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="icon" variant="ghost" className="size-8">
                        <Link to="/customers/$id" params={{ id: c.id }} title="View Ledger">
                          <Eye className="size-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
