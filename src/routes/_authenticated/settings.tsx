import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { resetDB } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, users, addUser, removeUser } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Collector");

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return toast.error("Fill in all fields");
    }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return toast.error("Email already exists");
    }
    const res = await addUser({ name: name.trim(), email: email.trim(), password, role });
    if (res.ok) {
      toast.success("User added");
      setName("");
      setEmail("");
      setPassword("");
      setRole("Collector");
    } else {
      toast.error(res.error || "Could not add user");
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>Signed-in user details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{user?.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Role:</span>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              {user?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>
            {isAdmin ? "Add or remove staff accounts." : "Only admins can manage staff."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <div className="size-8 rounded-full bg-muted grid place-items-center text-xs font-semibold">
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    u.role === "Admin"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-secondary/30 bg-secondary/10 text-secondary"
                  }
                >
                  {u.role}
                </Badge>
                {isAdmin && u.id !== user?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      if (confirm(`Remove ${u.name}?`)) {
                        const res = await removeUser(u.id);
                        if (res.ok) {
                          toast.success("User removed");
                        } else {
                          toast.error(res.error || "Could not remove user");
                        }
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {isAdmin && (
            <form onSubmit={onAdd} className="grid sm:grid-cols-2 gap-3 pt-4 border-t">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Name
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Role
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Collector">Collector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Add user</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Erase all customers and transactions and reload demo data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Reset ALL business data? This cannot be undone.")) {
                  resetDB();
                  toast.success("Data reset");
                }
              }}
            >
              Reset data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
