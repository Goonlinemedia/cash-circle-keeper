import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export type Role = "Admin" | "Collector";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

interface AuthCtx {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  users: AppUser[];
  addUser: (u: Omit<AppUser, "id">) => Promise<{ ok: boolean; error?: string }>;
  removeUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const Ctx = createContext<AuthCtx | null>(null);

async function fetchProfile(uid: string, email: string): Promise<AppUser> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", uid)
      .single();

    if (error || !data) {
      return {
        id: uid,
        name: email.split("@")[0],
        email,
        role: "Collector",
      };
    }

    return {
      id: uid,
      name: data.name,
      email,
      role: data.role as Role,
    };
  } catch {
    return {
      id: uid,
      name: email.split("@")[0],
      email,
      role: "Collector",
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [ready, setReady] = useState(false);

  const fetchUsersList = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });

      if (data) {
        setUsers(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role as Role,
          })),
        );
      }
    } catch (e) {
      console.error("Error fetching users profiles list:", e);
    }
  };

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email!);
        setUser(profile);
        await fetchUsersList();
      }
      setReady(true);
    });

    // 2. Listen to session updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email!);
        setUser(profile);
        await fetchUsersList();
      } else {
        setUser(null);
        setUsers([]);
      }
      setReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "An error occurred" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addUser = async (u: Omit<AppUser, "id">) => {
    try {
      // Create user authentication record in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password || "collect123", // default temp password
        options: {
          data: {
            name: u.name,
            role: u.role,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      // If sign-up is successful, standard trigger inserts profile row.
      // Refresh the profiles list
      await fetchUsersList();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Could not add user" };
    }
  };

  const removeUser = async (id: string) => {
    try {
      // In client-only Supabase, we can delete the profile row.
      // (Full auth user deletion requires administrative permissions via admin client).
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        return { ok: false, error: error.message };
      }
      await fetchUsersList();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Could not delete user" };
    }
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
