import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDB, customerById, deleteTransaction, type TxnType } from "@/lib/store";
import { formatNaira, formatDate, isSameDay, isThisWeek, todayISO } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type DateFilter = "all" | "today" | "week";
type TypeFilter = "all" | TxnType;

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const db = useDB();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return db.transactions.filter((t) => {
      if (dateFilter === "today" && !isSameDay(t.date, todayISO())) return false;
      if (dateFilter === "week" && !isThisWeek(t.date)) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (customerFilter !== "all" && t.customerId !== customerFilter) return false;
      return true;
    });
  }, [db.transactions, dateFilter, typeFilter, customerFilter]);

  const totalIn = filtered.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 max-w-7xl">
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-3 items-center">
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="IN">Money in</SelectItem>
              <SelectItem value="OUT">Money out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {db.customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">In:</span>{" "}
              <span className="font-semibold text-success tabular-nums">
                {formatNaira(totalIn)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Out:</span>{" "}
              <span className="font-semibold text-destructive tabular-nums">
                {formatNaira(totalOut)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Net:</span>{" "}
              <span className="font-semibold tabular-nums">{formatNaira(totalIn - totalOut)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer / Reason</TableHead>
                <TableHead>Method / Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No transactions match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const customer = customerById(db, t.customerId);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(t.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.type === "IN"
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-destructive/40 bg-destructive/10 text-destructive"
                          }
                        >
                          {t.type === "IN" ? "In" : "Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.type === "IN"
                          ? (customer?.name ?? "—")
                          : (t.withdrawalType ?? "Withdrawal")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.type === "IN"
                          ? `${t.paymentMethod ?? "Cash"}${t.reference ? ` · ${t.reference}` : ""}`
                          : (t.description ?? "—")}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold tabular-nums ${t.type === "IN" ? "text-success" : "text-destructive"}`}
                      >
                        {t.type === "IN" ? "+" : "-"} {formatNaira(t.amount)}
                      </TableCell>
                      <TableCell className="w-10">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this transaction? Cash balance will adjust.")) {
                              deleteTransaction(t.id);
                              toast.success("Transaction deleted");
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
