'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);
const AVATAR_STORAGE_KEY = 'user_avatar_override';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me?_t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) { setUser(null); return; }
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.user) {
        // Check if sessionStorage has a newer avatar (bypass DB replica lag)
        try {
          const stored = sessionStorage.getItem(AVATAR_STORAGE_KEY);
          if (stored) {
            const { avatar, userId, timestamp } = JSON.parse(stored);
            // Use stored avatar if same user and less than 5 minutes old
            if (userId === data.user.id && Date.now() - timestamp < 5 * 60 * 1000) {
              data.user.avatar = avatar;
            } else {
              sessionStorage.removeItem(AVATAR_STORAGE_KEY);
            }
          }
        } catch {}
      }

      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const updateAvatar = (avatarDataUrl) => {
    setUser(prev => {
      if (!prev) return prev;
      // Save to sessionStorage to survive refresh (bypasses DB replica lag)
      try {
        sessionStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify({
          avatar: avatarDataUrl,
          userId: prev.id,
          timestamp: Date.now(),
        }));
      } catch {}
      return { ...prev, avatar: avatarDataUrl };
    });
  };

  const logout = async () => {
    try { sessionStorage.removeItem(AVATAR_STORAGE_KEY); } catch {}
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
