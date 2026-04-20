'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function BoardPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);     // base64 preview
  const [previewFile, setPreviewFile] = useState(null); // raw base64 to upload
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) setUser(data.user);
    }).catch(() => {});
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {} finally { setLoading(false); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) { setContent(''); loadMessages(); }
    } catch {} finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這則留言嗎？')) return;
    try {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadMessages();
    } catch {}
  };

  // Step 1: Select file → show preview
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('僅支援 JPG 和 PNG 格式');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('檔案大小不能超過 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setPreviewFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Confirm upload
  const handleConfirmUpload = async () => {
    if (!previewFile) return;
    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: previewFile }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, avatar: data.avatar }));
        setPreview(null);
        setPreviewFile(null);
        // Reset file input
        if (fileRef.current) fileRef.current.value = '';
        // Reload messages to show updated avatar
        loadMessages();
        alert('頭貼更新成功！');
      } else {
        const data = await res.json();
        alert(data.error || '上傳失敗');
      }
    } catch {
      alert('上傳失敗，請稍後再試');
    } finally { setUploading(false); }
  };

  // Cancel preview
  const handleCancelPreview = () => {
    setPreview(null);
    setPreviewFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAI = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setAiResponse('❌ ' + data.error);
      } else {
        setAiResponse(data.result || '無法取得回應');
      }
    } catch {
      setAiResponse('❌ AI 服務暫時無法使用');
    } finally { setAiLoading(false); }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-16 min-h-screen bg-surface-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-ink-0 mb-8">留言板 Message Board</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post form */}
            {user ? (
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-brand-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-ink-0">{user.username}</span>
                </div>
                <form onSubmit={handlePost}>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    className="input-field min-h-[80px] resize-none mb-3"
                    placeholder="寫下你的留言..." maxLength={500} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-3">{content.length}/500</span>
                    <button type="submit" disabled={sending || !content.trim()}
                      className="btn-primary !py-2 !px-5 text-sm disabled:opacity-50">
                      {sending ? '發送中...' : '發送留言'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-ink-2 mb-3">登入後即可留言</p>
                <div className="flex justify-center gap-3">
                  <Link href="/login" className="btn-secondary !py-2 text-sm">登入</Link>
                  <Link href="/register" className="btn-primary !py-2 text-sm">註冊</Link>
                </div>
              </div>
            )}

            {/* Messages list */}
            {loading ? (
              <div className="text-center py-10 text-ink-2">載入中...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-ink-2">還沒有留言，來當第一個吧！</div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="card p-5">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {msg.avatar ? (
                          <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-surface-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">
                            {msg.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-0 text-sm">{msg.username}</span>
                            <span className="text-xs text-ink-3">{formatTime(msg.created_at)}</span>
                          </div>
                          {user && user.id === msg.user_id && (
                            <button onClick={() => handleDelete(msg.id)}
                              className="text-xs text-ink-3 hover:text-red-500 transition">
                              刪除
                            </button>
                          )}
                        </div>
                        <p className="text-ink-1 text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar upload */}
            {user && (
              <div className="card p-5">
                <h3 className="font-display font-bold text-ink-0 mb-3">上傳頭貼</h3>
                <p className="text-xs text-ink-2 mb-3">支援 JPG / PNG，最大 2MB</p>

                {/* Current avatar or preview */}
                <div className="flex items-center gap-3 mb-4">
                  {preview ? (
                    <img src={preview} alt="預覽" className="w-16 h-16 rounded-full object-cover border-2 border-green-400" />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-brand-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-2xl">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  {preview && (
                    <span className="text-xs text-green-600 font-medium">新圖片預覽</span>
                  )}
                </div>

                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleFileSelect}
                  className="hidden" />

                {!preview ? (
                  <button onClick={() => fileRef.current?.click()}
                    className="btn-secondary w-full !py-2 text-sm">
                    選擇圖片
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleConfirmUpload} disabled={uploading}
                      className="btn-primary flex-1 !py-2 text-sm disabled:opacity-50">
                      {uploading ? '上傳中...' : '確認上傳'}
                    </button>
                    <button onClick={handleCancelPreview}
                      className="btn-secondary !py-2 !px-3 text-sm">
                      取消
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Feature */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-ink-0 mb-1">🤖 AI 文字改寫</h3>
              <p className="text-xs text-ink-2 mb-3">輸入文字，AI 幫你改寫潤飾 (Powered by Gemini)</p>
              <form onSubmit={handleAI}>
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  className="input-field min-h-[60px] resize-none mb-3 text-sm"
                  placeholder="輸入要改寫的文字..." maxLength={300} />
                <button type="submit" disabled={aiLoading || !aiPrompt.trim()}
                  className="btn-primary w-full !py-2 text-sm disabled:opacity-50">
                  {aiLoading ? '生成中...' : 'AI 改寫'}
                </button>
              </form>
              {aiResponse && (
                <div className={`mt-3 p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  aiResponse.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-ink-1'
                }`}>
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
