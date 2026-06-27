import { createFileRoute, Navigate, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user, ready, loginAsCustomer } = useAuth();
  const navigate = useNavigate();
  
  // Customer login states
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            
            <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1.5">
              <div className="font-medium text-foreground">Important Note</div>
              <div>To log in as a customer, you must first be registered as a contributor by a staff member. Please use the exact first name and phone number on your profile.</div>
            </div>

            <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
              Are you a staff member?{" "}
              <Link to="/staff" className="text-primary hover:underline font-semibold">
                Sign in to Staff Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
