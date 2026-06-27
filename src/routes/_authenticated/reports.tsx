import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useDB, cashBalance, totalIn, totalOut } from "@/lib/store";
import { formatNaira, isSameDay, isThisWeek, todayISO } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const db = useDB();
  const today = todayISO();

  const txnsToday = db.transactions.filter((t) => isSameDay(t.date, today));
  const txnsWeek = db.transactions.filter((t) => isThisWeek(t.date));

  const collectionsToday = totalIn(txnsToday);
  const withdrawalsToday = totalOut(txnsToday);
  const collectionsWeek = totalIn(txnsWeek);
  const withdrawalsWeek = totalOut(txnsWeek);
  const balance = cashBalance(db.transactions);

  // Outstanding: expected from active daily customers today minus what they paid
  const paidByCustomerToday = useMemo(() => {
    const map = new Map<string, number>();
    txnsToday
      .filter((t) => t.type === "IN" && t.customerId)
      .forEach((t) => map.set(t.customerId!, (map.get(t.customerId!) ?? 0) + t.amount));
    return map;
  }, [txnsToday]);

  const outstanding = db.customers
    .filter((c) => c.status === "Active" && c.frequency === "Daily")
    .reduce((sum, c) => sum + Math.max(0, c.contributionAmount - (paidByCustomerToday.get(c.id) ?? 0)), 0);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard label="Today's collections" value={formatNaira(collectionsToday)} tone="success" />
        <ReportCard label="Today's withdrawals" value={formatNaira(withdrawalsToday)} tone="destructive" />
        <ReportCard label="Cash balance" value={formatNaira(balance)} />
        <ReportCard label="Outstanding today" value={formatNaira(outstanding)} tone="accent" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>This week</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Collections" value={formatNaira(collectionsWeek)} tone="success" />
            <Row label="Withdrawals" value={formatNaira(withdrawalsWeek)} tone="destructive" />
            <Row label="Net" value={formatNaira(collectionsWeek - withdrawalsWeek)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>All time</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Collections" value={formatNaira(totalIn(db.transactions))} tone="success" />
            <Row label="Withdrawals" value={formatNaira(totalOut(db.transactions))} tone="destructive" />
            <Row label="Balance" value={formatNaira(balance)} />
            <Row label="Customers" value={String(db.customers.length)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4 text-xs text-muted-foreground">
          PDF and Excel exports are planned for the next version.
        </CardContent>
      </Card>
    </div>
  );
}

function ReportCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive" | "accent";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "accent"
          ? "text-accent-foreground"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`font-semibold tabular-nums ${cls}`}>{value}</div>
    </div>
  );
}
