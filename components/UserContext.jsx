'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me?_t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const text = await res.text();
      const data = JSON.parse(text);
      setUser(data.user || null);
    } catch (err) {
      console.error('refreshUser failed:', err);
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const updateAvatar = (avatarDataUrl) => {
    setUser(prev => prev ? { ...prev, avatar: avatarDataUrl } : prev);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <UserContext.Provider value={{ user, loaded, setUser, refreshUser, updateAvatar, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
