// Lightweight local auth — users live in localStorage.
// MVP only; intentionally simple. Not for production.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Admin" | "Collector";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string; // plain-text; local only
  role: Role;
}

const USERS_KEY = "ajo-users-v1";
const SESSION_KEY = "ajo-session-v1";

function loadUsers(): AppUser[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    const seed: AppUser[] = [
      { id: crypto.randomUUID(), name: "Admin", email: "admin@ajo.app", password: "admin123", role: "Admin" },
      { id: crypto.randomUUID(), name: "Collector", email: "collector@ajo.app", password: "collect123", role: "Collector" },
    ];
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw) as AppUser[];
}

function saveUsers(users: AppUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

interface AuthCtx {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  users: AppUser[];
  addUser: (u: Omit<AppUser, "id">) => void;
  removeUser: (id: string) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const all = loadUsers();
    setUsers(all);
    const sid = window.localStorage.getItem(SESSION_KEY);
    if (sid) {
      const found = all.find((u) => u.id === sid);
      if (found) setUser(found);
    }
    setReady(true);
  }, []);

  const login = (email: string, password: string) => {
    const all = loadUsers();
    const match = all.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!match) return { ok: false, error: "Invalid email or password" };
    window.localStorage.setItem(SESSION_KEY, match.id);
    setUser(match);
    return { ok: true };
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const addUser = (u: Omit<AppUser, "id">) => {
    const all = loadUsers();
    const next = [...all, { ...u, id: crypto.randomUUID() }];
    saveUsers(next);
    setUsers(next);
  };

  const removeUser = (id: string) => {
    const all = loadUsers().filter((u) => u.id !== id);
    saveUsers(all);
    setUsers(all);
  };

  return (
    <Ctx.Provider value={{ user, ready, login, logout, users, addUser, removeUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
