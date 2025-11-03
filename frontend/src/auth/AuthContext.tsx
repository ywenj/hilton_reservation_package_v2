import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthState, AuthUser, UserRole } from "../types/auth";
import { introspectToken } from "../api/auth";

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token) {
            try {
              const infoResult = await introspectToken(parsed.token);
              if ((infoResult as any).active) {
                const info = infoResult as {
                  active: boolean;
                  sub: string;
                  role: UserRole;
                  username?: string;
                };
                setUser({
                  id: info.sub,
                  role: info.role,
                  name: info.username,
                });
                setToken(parsed.token);
              } else {
                localStorage.removeItem("auth");
              }
            } catch {
              localStorage.removeItem("auth");
            }
          }
        } catch {}
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (t: string, u: AuthUser) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("auth", JSON.stringify({ token: t, user: u }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
