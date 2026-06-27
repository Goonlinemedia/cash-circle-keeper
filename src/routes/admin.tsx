import { createFileRoute, Navigate, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLogin,
});

function AdminLogin() {
  const { user, ready, login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@ajo.app");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) return null;

  // If already logged in as Admin, redirect to dashboard
  if (user && user.role === "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Perform login
      const r = await login(email, password);
      if (!r.ok) {
        setError(r.error ?? "Login failed");
        setLoading(false);
        return;
      }

      // 2. Fetch profile directly to verify Admin role
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        await logout();
        setError("Unable to retrieve user session");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "Admin") {
        // Sign out if not admin
        await logout();
        setError("Access denied: This portal is for Administrators only.");
        setLoading(false);
        return;
      }

      // Successful verification
      setLoading(false);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      await logout();
      setError(err.message || "An error occurred during verification.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 naira-grid-bg">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-primary leading-none">
              Admin Portal
            </div>
            <div className="text-xs text-muted-foreground mt-1">Debbby Ajo Management System</div>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
          <CardHeader>
            <CardTitle>Admin Sign in</CardTitle>
            <CardDescription>Enter administrator email and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
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
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </form>

            <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground">Demo administrator account</div>
              <div>Admin — admin@ajo.app / admin123</div>
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Go to Customer Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
