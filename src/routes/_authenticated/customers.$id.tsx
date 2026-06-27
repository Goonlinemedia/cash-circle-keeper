import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useDB, customerById, totalIn } from "@/lib/store";
import { formatNaira, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers/$id")({
  component: CustomerLedger,
});

function CustomerLedger() {
  const { id } = Route.useParams();
  const db = useDB();
  const navigate = useNavigate();
  const customer = customerById(db, id);

  const payments = useMemo(
    () =>
      db.transactions
        .filter((t) => t.type === "IN" && t.customerId === id)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [db.transactions, id],
  );

  if (!customer) {
    return (
      <div className="max-w-xl">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-muted-foreground">Customer not found.</p>
            <Button onClick={() => navigate({ to: "/customers" })} variant="outline">
              Back to customers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runningTotal = totalIn(payments);

  return (
    <div className="space-y-4 max-w-4xl">
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to customers
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
                {customer.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-display text-2xl font-bold">{customer.name}</div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1"><Phone className="size-3.5" />{customer.phone}</span>
                  {customer.address && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{customer.address}</span>}
                  <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />Started {formatDate(customer.startDate)}</span>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                customer.status === "Active"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground"
              }
            >
              {customer.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-6">
            <Stat label="Contribution" value={formatNaira(customer.contributionAmount)} sub={customer.frequency} />
            <Stat label="Total paid" value={formatNaira(runningTotal)} sub={`${payments.length} payments`} />
            <Stat
              label="Last payment"
              value={payments.length ? formatDate(payments[payments.length - 1].date) : "—"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {payments.map((t, i) => {
                const running = payments.slice(0, i + 1).reduce((s, p) => s + p.amount, 0);
                return (
                  <li key={t.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3">
                    <div>
                      <div className="font-medium">{formatDate(t.date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.paymentMethod ?? "Cash"}{t.reference ? ` · ${t.reference}` : ""}
                      </div>
                    </div>
                    <div className="text-success font-semibold tabular-nums">+ {formatNaira(t.amount)}</div>
                    <div className="text-sm text-muted-foreground tabular-nums w-32 text-right">
                      Running: {formatNaira(running)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card/50 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
