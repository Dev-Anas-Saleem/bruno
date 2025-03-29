"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string; // MongoDB identifier
  username: string;
  role: 'admin' | 'empleado';
  equipoId?: string;
  isConnected: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registrarEmpleado: (username: string, password: string) => Promise<boolean>;
  empleadosRegistrados: User[];
  empleadosConectados: User[];
  eliminarEmpleado: (id: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  registrarEmpleado: async () => false,
  empleadosRegistrados: [],
  empleadosConectados: [],
  eliminarEmpleado: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load all users from the API and update employee states.
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      if (!res.ok) {
        throw new Error(`Error fetching users: ${res.statusText}`);
      }
      const { users } = await res.json();
      const employees = users.filter((u: User) => u.role === 'empleado');
      setEmpleadosRegistrados(employees);
      setEmpleadosConectados(employees.filter((u: User) => u.isConnected));
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setDataLoaded(true);
    }
  }, []);

  // Periodically update data and when the window is focused or visible.
  useEffect(() => {
    loadData();
    const syncInterval = setInterval(loadData, 5000);
    const handleFocus = () => loadData();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadData();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Hard-coded admin credentials.
      if (username === 'Ariel' && password === 'ariel123') {
        const adminUser: User = {
          _id: 'admin',
          username: 'Ariel',
          role: 'admin',
          isConnected: true,
          createdAt: new Date().toISOString()
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        await loadData();
        return true;
      }
      // Call API for login
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      if (!res.ok) return false;
      const { user: userData } = await res.json();
      setUser(userData);
      setIsAuthenticated(true);
      await loadData();
      return true;
    } catch (error) {
      console.error('Error in login:', error);
      return false;
    }
  }, [loadData]);

  const logout = useCallback(async () => {
    try {
      if (user) {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', userId: user._id })
        });
        if (!res.ok) {
          console.error('Logout failed on server');
        }
        setUser(null);
        setIsAuthenticated(false);
        await loadData();
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error in logout:', error);
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  }, [user, loadData, router]);

  const registrarEmpleado = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', role: 'empleado', username, password })
      });
      if (!res.ok) return false;
      await loadData();
      return true;
    } catch (error) {
      console.error('Error in registrarEmpleado:', error);
      return false;
    }
  }, [loadData]);

  const eliminarEmpleado = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: id })
      });
      if (!res.ok) {
        console.error(`Failed to delete employee with id ${id}`);
        return;
      }
      await loadData();
      if (user && user._id === id) {
        await logout();
      }
    } catch (error) {
      console.error('Error in eliminarEmpleado:', error);
    }
  }, [user, loadData, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        registrarEmpleado,
        empleadosRegistrados,
        empleadosConectados,
        eliminarEmpleado
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
