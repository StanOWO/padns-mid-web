'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/UserContext';

export default function Navbar() {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  console.log('[NAV] render → user:', user?.username, 'avatar:', !!(user?.avatar));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl font-bold text-brand-800 tracking-tight">
            Stan Wang
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-ink-1 hover:text-brand-700 transition font-medium text-sm">首頁</Link>
            <Link href="/board" className="text-ink-1 hover:text-brand-700 transition font-medium text-sm">留言板</Link>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-brand-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-ink-0">{user.username}</span>
                </div>
                <button onClick={logout} className="text-sm text-ink-2 hover:text-red-500 transition">登出</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary !py-1.5 !px-4 text-sm">登入</Link>
                <Link href="/register" className="btn-primary !py-1.5 !px-4 text-sm">註冊</Link>
              </div>
            )}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-ink-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-surface-2 pt-3 flex flex-col gap-3">
            <Link href="/" className="text-ink-1 font-medium" onClick={() => setMenuOpen(false)}>首頁</Link>
            <Link href="/board" className="text-ink-1 font-medium" onClick={() => setMenuOpen(false)}>留言板</Link>
            {user ? (
              <>
                <span className="text-sm text-ink-2">Hi, {user.username}</span>
                <button onClick={logout} className="text-left text-red-500 font-medium">登出</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>登入</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>註冊</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
