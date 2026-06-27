import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useDB,
  addTransaction,
  cashBalance,
  type WithdrawalType,
} from "@/lib/store";
import { formatNaira, todayISO } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const WITHDRAWAL_TYPES: WithdrawalType[] = [
  "Customer Withdrawal",
  "Office Expense",
  "Bank Deposit",
  "Refund",
  "Other",
];

export const Route = createFileRoute("/_authenticated/withdrawals")({
  component: WithdrawalsPage,
});

function WithdrawalsPage() {
  const db = useDB();
  const { user } = useAuth();
  const balance = cashBalance(db.transactions);

  const [type, setType] = useState<WithdrawalType>("Customer Withdrawal");
  const [customerId, setCustomerId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [description, setDescription] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Enter a valid amount");
    if (type === "Customer Withdrawal" && !customerId) return toast.error("Pick a customer");
    if (amt > balance) {
      if (!confirm(`This withdrawal exceeds the cash balance of ${formatNaira(balance)}. Continue?`)) return;
    }
    addTransaction({
      type: "OUT",
      withdrawalType: type,
      customerId: type === "Customer Withdrawal" ? customerId : undefined,
      amount: amt,
      description: description.trim() || undefined,
      date: new Date(date).toISOString(),
      createdBy: user?.name ?? "unknown",
    });
    toast.success(`Withdrew ${formatNaira(amt)}`);
    setAmount("");
    setDescription("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="size-5 text-destructive" /> Record withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Withdrawal type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WithdrawalType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WITHDRAWAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "Customer Withdrawal" && (
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Pick customer" /></SelectTrigger>
                  <SelectContent>
                    {db.customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (₦)</Label>
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this withdrawal for?"
                rows={3}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" variant="destructive">
              Save withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader><CardTitle className="text-base">Cash position</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Current balance</div>
            <div className="font-display text-2xl font-bold mt-1 tabular-nums">{formatNaira(balance)}</div>
          </div>
          {amount && Number(amount) > 0 && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm font-medium">
              Balance will become {formatNaira(balance - Number(amount))}
            </div>
          )}
          {amount && Number(amount) > balance && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-3 py-2 text-xs flex gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>This exceeds your available cash. You can still save, but make sure that's intentional.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
