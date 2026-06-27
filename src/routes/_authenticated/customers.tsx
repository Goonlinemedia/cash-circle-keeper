import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useDB,
  addCustomer,
  updateCustomer,
  deactivateCustomer,
  activateCustomer,
  deleteCustomer,
  type Customer,
  type Frequency,
  type CustomerStatus,
} from "@/lib/store";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search, Eye, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

interface FormState {
  name: string;
  phone: string;
  address: string;
  contributionAmount: string;
  frequency: Frequency;
  startDate: string;
  status: CustomerStatus;
}

const emptyForm = (): FormState => ({
  name: "",
  phone: "",
  address: "",
  contributionAmount: "",
  frequency: "Daily",
  startDate: new Date().toISOString().slice(0, 10),
  status: "Active",
});

function CustomersPage() {
  const db = useDB();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return db.customers;
    return db.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [db.customers, search]);

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setOpen(true);
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="size-4" /> Add customer
            </Button>
          </DialogTrigger>
          <CustomerFormDialog initial={editing} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{c.phone}</TableCell>
                    <TableCell>
                      <div className="font-medium tabular-nums">
                        {formatNaira(c.contributionAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.frequency}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.startDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          c.status === "Active"
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-muted-foreground/30 bg-muted text-muted-foreground"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/customers/$id" params={{ id: c.id }}>
                              <Eye className="size-4" /> View history
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (c.status === "Active") {
                                deactivateCustomer(c.id);
                                toast.success(`${c.name} deactivated`);
                              } else {
                                activateCustomer(c.id);
                                toast.success(`${c.name} activated`);
                              }
                            }}
                          >
                            <Power className="size-4" />
                            {c.status === "Active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete ${c.name}? This does not remove their transactions.`,
                                )
                              ) {
                                deleteCustomer(c.id);
                                toast.success("Customer deleted");
                              }
                            }}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

function CustomerFormDialog({
  initial,
  onClose,
}: {
  initial: Customer | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          name: initial.name,
          phone: initial.phone,
          address: initial.address,
          contributionAmount: String(initial.contributionAmount),
          frequency: initial.frequency,
          startDate: initial.startDate,
          status: initial.status,
        }
      : emptyForm(),
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.contributionAmount);
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.phone.trim()) return toast.error("Phone is required");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Enter a valid amount");

    if (initial) {
      updateCustomer(initial.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        contributionAmount: amount,
        frequency: form.frequency,
        startDate: form.startDate,
        status: form.status,
      });
      toast.success("Customer updated");
    } else {
      addCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        contributionAmount: amount,
        frequency: form.frequency,
        startDate: form.startDate,
        status: form.status,
      });
      toast.success("Customer added");
    }
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit customer" : "Add customer"}</DialogTitle>
        <DialogDescription>
          {initial ? "Update this customer's details." : "Register a new contributor."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Phone number">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </Field>
        </div>
        <Field label="Address">
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contribution amount (₦)">
            <Input
              type="number"
              min={0}
              step={50}
              value={form.contributionAmount}
              onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })}
              required
            />
          </Field>
          <Field label="Frequency">
            <Select
              value={form.frequency}
              onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start date">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as CustomerStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Save changes" : "Add customer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
