import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ajo.app");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
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
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your collector or admin credentials.</CardDescription>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">Demo accounts</div>
              <div>Admin — admin@ajo.app / admin123</div>
              <div>Collector — collector@ajo.app / collect123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
