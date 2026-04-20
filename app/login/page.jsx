'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '登入失敗'); return; }
      window.location.href = '/board';
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-surface-1 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-ink-0 mb-1 text-center">訪客登入</h1>
          <p className="text-ink-2 text-sm text-center mb-8">登入後可使用留言板功能</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-1 mb-1.5">帳號</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input-field" placeholder="輸入帳號" required autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-1 mb-1.5">密碼</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="輸入密碼" required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full !py-3 disabled:opacity-50">
              {loading ? '處理中...' : '登入'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-2">
            還沒有帳號？ <Link href="/register" className="text-brand-600 font-medium hover:underline">註冊</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
