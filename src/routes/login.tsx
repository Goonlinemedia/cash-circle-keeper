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
  const { user, ready, login, loginAsCustomer } = useAuth();
  const navigate = useNavigate();
  
  // Staff login states
  const [email, setEmail] = useState("collector@ajo.app");
  const [password, setPassword] = useState("collect123");
  
  // Customer login states
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");

  const [activeTab, setActiveTab] = useState("staff");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await login(email, password);
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Login failed");
      return;
    }
    navigate({ to: "/dashboard" });
  };

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

        <Tabs defaultValue="staff" value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/80 p-1 rounded-xl">
            <TabsTrigger value="staff" className="rounded-lg py-2 font-medium">Staff Portal</TabsTrigger>
            <TabsTrigger value="customer" className="rounded-lg py-2 font-medium">Customer Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle>Collector Sign in</CardTitle>
                <CardDescription>Use your staff collector credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onStaffSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
                
                <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                  <div className="font-medium text-foreground">Demo Collector account</div>
                  <div>Collector — collector@ajo.app / collect123</div>
                </div>

                <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                  Are you an Administrator?{" "}
                  <Link to="/admin" className="text-primary hover:underline font-semibold">
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer">
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Portal</CardTitle>
                <CardDescription>Enter your first name and phone number to view your ledger.</CardDescription>
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
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Accessing Ledger..." : "Access Ledger"}
                  </Button>
                </form>
                <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1.5">
                  <div className="font-medium text-foreground">Important Note</div>
                  <div>To log in as a customer, you must first be added as a customer by a Staff member. Please use the exact first name and phone number on your profile.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
