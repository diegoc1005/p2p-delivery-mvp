"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: string; name: string; role: string; email: string };
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
const API = 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('nodo_token');
    const savedUser = localStorage.getItem('nodo_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('nodo_token', data.token);
    localStorage.setItem('nodo_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    redirect(data.user.role);
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('nodo_token', data.token);
    localStorage.setItem('nodo_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    redirect(role);
  };

  const logout = () => {
    localStorage.removeItem('nodo_token');
    localStorage.removeItem('nodo_user');
    setToken(null);
    setUser(null);
    router.push('/auth');
  };

  const redirect = (role: string) => {
    if (role === 'CUSTOMER') router.push('/customer');
    else if (role === 'COURIER') router.push('/courier');
    else if (role === 'RESTAURANT') router.push('/vendor');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
