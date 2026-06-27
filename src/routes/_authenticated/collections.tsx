import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDB, addTransaction, type PaymentMethod } from "@/lib/store";
import { formatNaira, todayISO } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownToLine, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/collections")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const db = useDB();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeCustomers = db.customers.filter((c) => c.status === "Active");

  const [customerId, setCustomerId] = useState<string>(activeCustomers[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [reference, setReference] = useState("");

  const selected = activeCustomers.find((c) => c.id === customerId);

  // Prefill amount when customer selected
  const onCustomerChange = (id: string) => {
    setCustomerId(id);
    const c = activeCustomers.find((x) => x.id === id);
    if (c && !amount) setAmount(String(c.contributionAmount));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast.error("Pick a customer");
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Enter a valid amount");
    addTransaction({
      type: "IN",
      customerId,
      amount: amt,
      paymentMethod: method,
      reference: reference.trim() || undefined,
      date: new Date(date).toISOString(),
      createdBy: user?.name ?? "unknown",
    });
    toast.success(`Recorded ${formatNaira(amt)} from ${selected?.name ?? "customer"}`);
    setAmount("");
    setReference("");
  };

  if (activeCustomers.length === 0) {
    return (
      <Card className="max-w-md">
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-muted-foreground">
            Add an active customer before recording collections.
          </p>
          <Button onClick={() => navigate({ to: "/customers" })}>Add customer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="size-5 text-success" /> Record collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Customer
              </Label>
              <Select value={customerId} onValueChange={onCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick customer" />
                </SelectTrigger>
                <SelectContent>
                  {activeCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {formatNaira(c.contributionAmount)} {c.frequency.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Amount (₦)
                </Label>
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
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment date
                </Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Payment method
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <MethodButton
                  active={method === "Cash"}
                  onClick={() => setMethod("Cash")}
                  icon={<Banknote className="size-4" />}
                  label="Cash"
                />
                <MethodButton
                  active={method === "Transfer"}
                  onClick={() => setMethod("Transfer")}
                  icon={<Smartphone className="size-4" />}
                  label="Transfer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Reference (optional)
              </Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transfer ref, receipt no..."
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Save payment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle className="text-base">Quick view</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selected ? (
            <div className="space-y-2">
              <div className="font-medium">{selected.name}</div>
              <div className="text-sm text-muted-foreground">{selected.phone}</div>
              <div className="text-sm">
                Plan:{" "}
                <span className="font-medium">
                  {formatNaira(selected.contributionAmount)} · {selected.frequency}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No customer selected.</div>
          )}
          {amount && Number(amount) > 0 && (
            <div className="rounded-md bg-success/10 text-success px-3 py-2 text-sm font-medium">
              Cash balance will increase by {formatNaira(Number(amount))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background text-foreground hover:bg-muted"
      }`}
    >
      {icon} {label}
    </button>
  );
}
