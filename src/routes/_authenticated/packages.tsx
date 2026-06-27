import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useDB,
  addAjoPackage,
  deleteAjoPackage,
  type AjoPackage,
  type Frequency,
} from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, FolderKanban, Users, Wallet, Target, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/packages")({
  component: PackagesPage,
});

interface FormState {
  name: string;
  contributionAmount: string;
  targetAmount: string;
  frequency: Frequency;
  durationDays: string;
  description: string;
}

const emptyForm = (): FormState => ({
  name: "",
  contributionAmount: "",
  targetAmount: "",
  frequency: "Daily",
  durationDays: "",
  description: "",
});

function PackagesPage() {
  const db = useDB();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [form, setForm] = useState<FormState>(emptyForm());

  const packagesWithStats = useMemo(() => {
    return (db.ajoPackages || []).map((pkg) => {
      // Find customers enrolled in this package
      const enrolledCustomers = db.customers.filter((c) => c.ajoPackageId === pkg.id);
      const customerIds = new Set(enrolledCustomers.map((c) => c.id));

      // Calculate total savings in this package (IN - OUT transactions)
      const txns = db.transactions.filter((t) => t.customerId && customerIds.has(t.customerId));
      const totalIn = txns.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
      const totalOut = txns.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
      const currentSavings = totalIn - totalOut;

      // Circle target = targetAmount * enrolled customer count
      const targetPerCustomer = pkg.targetAmount || 0;
      const totalCircleTarget = targetPerCustomer * enrolledCustomers.length;
      const progressPercent =
        totalCircleTarget > 0 ? Math.min(100, Math.round((currentSavings / totalCircleTarget) * 100)) : 0;

      return {
        ...pkg,
        enrolledCount: enrolledCustomers.length,
        currentSavings,
        totalCircleTarget,
        progressPercent,
      };
    });
  }, [db.ajoPackages, db.customers, db.transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packagesWithStats;
    return packagesWithStats.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [packagesWithStats, search]);

  // Overall metrics
  const activeCircles = packagesWithStats.filter((p) => p.status === "Active").length;
  const totalGroupSavings = packagesWithStats.reduce((s, p) => s + p.currentSavings, 0);
  const totalParticipants = db.customers.filter((c) => c.ajoPackageId).length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contribution = Number(form.contributionAmount);
    const target = form.targetAmount ? Number(form.targetAmount) : undefined;
    const duration = form.durationDays ? Number(form.durationDays) : undefined;

    if (!form.name.trim()) return toast.error("Package name is required");
    if (!Number.isFinite(contribution) || contribution <= 0)
      return toast.error("Enter a valid contribution amount");
    if (target !== undefined && (!Number.isFinite(target) || target <= 0))
      return toast.error("Enter a valid target amount");
    if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0))
      return toast.error("Enter valid duration days");

    try {
      await addAjoPackage({
        name: form.name.trim(),
        contributionAmount: contribution,
        targetAmount: target,
        frequency: form.frequency,
        durationDays: duration,
        description: form.description.trim(),
        status: "Active",
      });
      toast.success("Ajo Package created successfully");
      setForm(emptyForm());
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create Ajo Package");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete the "${name}" package? Customers in this package will be unlinked, but their savings history remains.`,
      )
    ) {
      try {
        await deleteAjoPackage(id);
        toast.success("Ajo Package deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete package");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Active Ajo Circles</div>
                <div className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{activeCircles}</div>
                <div className="text-xs text-muted-foreground mt-1">Structured savings programs</div>
              </div>
              <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <FolderKanban className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Combined savings</div>
                <div className="mt-2 font-display text-2xl font-bold tabular-nums text-success">
                  {formatNaira(totalGroupSavings)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total saved across all groups</div>
              </div>
              <div className="size-9 rounded-lg bg-success/10 text-success grid place-items-center">
                <Wallet className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Enrolled Customers</div>
                <div className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{totalParticipants}</div>
                <div className="text-xs text-muted-foreground mt-1">Active participants across Ajo packages</div>
              </div>
              <div className="size-9 rounded-lg bg-accent/15 text-accent-foreground grid place-items-center">
                <Users className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Creation Bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search package name, frequency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Create Ajo Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Ajo Package</DialogTitle>
                <DialogDescription>Define a savings plan package for customers to subscribe to.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. 1k Daily Pack, 100k Challenge"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="contribution">Contribution Amount (₦)</Label>
                    <Input
                      id="contribution"
                      type="number"
                      placeholder="e.g. 1000"
                      value={form.contributionAmount}
                      onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="target">Target Amount (₦) - Optional</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="e.g. 100000"
                      value={form.targetAmount}
                      onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="frequency">Saving Frequency</Label>
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
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duration">Duration (Days) - Optional</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g. 7 or 30"
                      value={form.durationDays}
                      onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description / Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the plan, guidelines, or withdrawal details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Package</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Package Grid List */}
      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-sm text-muted-foreground space-y-3">
            <FolderKanban className="size-12 mx-auto text-muted-foreground/50 stroke-1" />
            <p>No Ajo Packages found.</p>
            {isAdmin && (
              <Button size="sm" onClick={() => setOpen(true)} variant="outline">
                Create one now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <Card key={pkg.id} className="border-border/60 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden bg-card/65 backdrop-blur">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div>
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{pkg.description || "No description provided."}</CardDescription>
                  </div>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      aria-label="Delete Package"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pb-4 space-y-4">
                  {/* Freq Badge */}
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-semibold text-[10px] tracking-wide uppercase">
                      {pkg.frequency}
                    </Badge>
                    <Badge variant="outline" className="font-bold text-[10px] tracking-wide bg-primary/5 text-primary border-primary/20">
                      ₦{pkg.contributionAmount.toLocaleString()}/cycle
                    </Badge>
                    {pkg.durationDays && (
                      <Badge variant="outline" className="font-semibold text-[10px] tracking-wide bg-accent/10 border-accent/15 text-accent-foreground">
                        {pkg.durationDays} Days
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar if target exists */}
                  {pkg.targetAmount ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Circle Target Progress</span>
                        <span className="text-foreground font-bold">{pkg.progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-300"
                          style={{ width: `${pkg.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5 font-mono">
                        <span>{formatNaira(pkg.currentSavings)}</span>
                        <span>of {formatNaira(pkg.totalCircleTarget)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-muted/30 p-2.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total Combined Savings:</span>
                      <span className="font-bold text-success font-mono">{formatNaira(pkg.currentSavings)}</span>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Card Footer */}
              <div className="border-t px-6 py-3 bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5 font-medium">
                  <Users className="size-3.5" />
                  {pkg.enrolledCount} {pkg.enrolledCount === 1 ? "participant" : "participants"}
                </span>
                <Button size="sm" variant="ghost" asChild className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5">
                  <Link to="/packages/$id" params={{ id: pkg.id }}>
                    View Details <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
