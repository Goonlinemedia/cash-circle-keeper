import { createFileRoute, Navigate, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { useDB, addCustomer, type Frequency } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user, ready, loginAsCustomer } = useAuth();
  const navigate = useNavigate();
  const db = useDB();

  // Mode state
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Customer login states
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");

  // Customer sign-up states
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    phone: "",
    address: "",
    ajoPackageId: "",
    contributionAmount: "",
    frequency: "Daily" as Frequency,
  });

  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await loginAsCustomer(firstName, phone);
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Login failed");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const onSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const contribution = Number(signUpForm.contributionAmount);

    if (!signUpForm.name.trim()) {
      toast.error("Full name is required");
      setLoading(false);
      return;
    }
    if (!signUpForm.phone.trim()) {
      toast.error("Phone number is required");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(contribution) || contribution <= 0) {
      toast.error("Enter a valid contribution amount");
      setLoading(false);
      return;
    }

    try {
      await addCustomer({
        name: signUpForm.name.trim(),
        phone: signUpForm.phone.trim(),
        address: signUpForm.address.trim(),
        contributionAmount: contribution,
        frequency: signUpForm.frequency,
        startDate: new Date().toISOString().slice(0, 10),
        status: "Active",
        isApproved: false, // Pending approval
        ajoPackageId: signUpForm.ajoPackageId || undefined,
      });

      toast.success("Signup request submitted! Please wait for admin approval.");
      setIsSignUp(false);
      setSignUpForm({
        name: "",
        phone: "",
        address: "",
        ajoPackageId: "",
        contributionAmount: "",
        frequency: "Daily",
      });
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit signup request");
      setLoading(false);
    }
  };

  const onPackageChange = (val: string) => {
    const pkgId = val === "none" ? "" : val;
    const pkg = db.ajoPackages?.find((p) => p.id === pkgId);
    if (pkg) {
      setSignUpForm((prev) => ({
        ...prev,
        ajoPackageId: pkgId,
        contributionAmount: String(pkg.contributionAmount),
        frequency: pkg.frequency,
      }));
    } else {
      setSignUpForm((prev) => ({
        ...prev,
        ajoPackageId: "",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 naira-grid-bg">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <Coins className="size-6" />
          </div>
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-primary leading-none">
              Debbby Ajo Manager
            </div>
            <div className="text-xs text-muted-foreground mt-1">Thrift collection, simplified</div>
          </div>
        </div>

        {isSignUp ? (
          <Card className="border-border/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
            <CardHeader>
              <CardTitle>Sign Up Request</CardTitle>
              <CardDescription>Fill in your details to request access to the thrift platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSignUpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={signUpForm.phone}
                    onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-address">Address</Label>
                  <Input
                    id="signup-address"
                    type="text"
                    placeholder="e.g. 12 Park Ave, Lagos"
                    value={signUpForm.address}
                    onChange={(e) => setSignUpForm({ ...signUpForm, address: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-package">Choose Ajo Package (Savings Plan)</Label>
                  <Select
                    value={signUpForm.ajoPackageId || "none"}
                    onValueChange={onPackageChange}
                  >
                    <SelectTrigger id="signup-package">
                      <SelectValue placeholder="No package / Custom Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No package / Custom Plan</SelectItem>
                      {(db.ajoPackages || []).map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} (₦{pkg.contributionAmount.toLocaleString()} · {pkg.frequency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-amount">Amount (₦)</Label>
                    <Input
                      id="signup-amount"
                      type="number"
                      value={signUpForm.contributionAmount}
                      onChange={(e) => setSignUpForm({ ...signUpForm, contributionAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-freq">Frequency</Label>
                    <Select
                      value={signUpForm.frequency}
                      onValueChange={(v) => setSignUpForm({ ...signUpForm, frequency: v as Frequency })}
                    >
                      <SelectTrigger id="signup-freq">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Signup Request"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <button
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  className="text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
            <CardHeader>
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>Enter your first name and phone number to view your savings ledger.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCustomerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="e.g. Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Accessing Ledger..." : "Access Ledger"}
                </Button>
              </form>
              
              <div className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1.5">
                <div className="font-medium text-foreground">Important Note</div>
                <div>To log in as a customer, you must first be registered as a contributor by an Admin. Please use the exact first name and phone number on your profile.</div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <button
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  className="text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer text-left"
                >
                  New customer? Sign Up
                </button>
                <Link to="/admin" className="text-primary hover:underline font-semibold">
                  Sign in as Admin
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
