import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/router";

type User = {
  name: string;
  email: string;
  role: "owner" | "manager" | "support";
  storeName?: string;
  image?: string;
  uid?: string;
  [key: string]: any;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ma7al-user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          typeof parsed.name === "string" &&
          typeof parsed.role === "string" &&
          typeof parsed.email === "string"
        ) {
          setUser(parsed);
        }
      }
    } catch {
      console.warn("⚠️ فشل تحميل بيانات المستخدم من التخزين المحلي");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ma7al-user");
    router.push("/login"); // ✅ توجيه المستخدم لصفحة تسجيل الدخول
  }, [router]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ma7al-user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  return useContext(UserContext);
}
