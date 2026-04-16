import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AuthCtx = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("auth_token");
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        return { error: new Error("Server error: Check if you are running 'vercel dev'") };
      }

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        return { error: null };
      }
      return { error: new Error(data.error || "Login failed") };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
