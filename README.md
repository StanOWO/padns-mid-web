# Stan Wang 個人網站

> EE5188 網路攻防實務 — 期中個人網站

## 功能清單

| 功能 | 說明 | 分數 |
|------|------|------|
| 個人頭貼 | 首頁 Hero 區域顯示個人形象照 | 10 |
| 自我介紹 | 首頁包含中文自我介紹、學經歷、技能 | 10 |
| 訪客註冊/登入 | 帳號密碼儲存於 Vercel Postgres，密碼 bcrypt 加密 | 40 |
| 頭貼上傳 | 支援 JPG/PNG，base64 儲存，含 magic bytes 驗證 | 20 |
| 留言板 | 登入後可留言，左側顯示頭貼，可刪除自己的留言 | 20 |
| AI 文字改寫 | 串接 **Google Gemini API** 改寫文字（加分項目） | +20 |

## 安全防護措施

### 1. SQL Injection 防護
- 使用 `@vercel/postgres` 的 `sql` tagged template literal
- 所有資料庫查詢皆為 **parameterized query**，參數不會被當作 SQL 語法執行
- 範例：`sql\`SELECT * FROM users WHERE username = ${username}\`` — `username` 會被當作參數而非 SQL 語法

### 2. XSS (Cross-Site Scripting) 防護（四層防禦）
- **輸入層**：所有使用者輸入經過 `stripTags()` 去除 HTML 標籤、`javascript:` 協定、event handlers (`onclick=` 等)、null bytes
- **儲存層**：帳號只允許 `[a-zA-Z0-9_-]`，留言長度限制 500 字元
- **輸出層**：API 回傳前經 `sanitize()` 轉義 `< > " ' / \`` 等特殊字元
- **渲染層**：React 預設對所有 JSX 表達式進行 HTML 轉義，且全站未使用 `dangerouslySetInnerHTML`
- **CSP**：Middleware 設定 `Content-Security-Policy` header，限制 script/style/img/connect 來源
- **AI 輸出**：Gemini API 回傳的文字也經過 `stripTags()` 處理，防止 prompt injection 導致 XSS

### 3. CSRF (Cross-Site Request Forgery) 防護
- 所有 POST/DELETE API 檢查 `Origin` / `Referer` header 是否與 `Host` 一致
- Cookie 設定 `SameSite=Lax` — 瀏覽器不會在跨站請求中自動附帶 cookie
- Cookie 設定 `HttpOnly=true` — 前端 JavaScript 無法讀取 token
- 生產環境設定 `Secure=true` — 僅允許 HTTPS 傳輸 cookie

### 4. 認證安全
- 密碼使用 **bcrypt (cost factor 12)** 雜湊儲存，不可逆
- JWT Token 存在 HttpOnly Cookie 中，前端 JavaScript 無法讀取
- 登入失敗不洩漏帳號是否存在（統一回「帳號或密碼錯誤」）
- 帳號不存在時仍執行 `bcrypt.hash('dummy')` 防止 **timing attack**
- 生產環境若未設定 `JWT_SECRET` 會印出警告

### 5. 檔案上傳安全
- 僅接受 `data:image/jpeg` 和 `data:image/png` 開頭的 data URL
- 驗證檔案 **magic bytes**（JPEG: `FF D8 FF`、PNG: `89 50 4E 47`）防止偽造副檔名的 webshell
- 大小限制 2MB（base64 編碼後約 3MB 字串長度）

### 6. HTTP 安全標頭（Middleware 全局設定）
- `Content-Security-Policy` — 限制各類資源來源
- `X-Frame-Options: DENY` — 防止 Clickjacking
- `X-Content-Type-Options: nosniff` — 防止 MIME sniffing
- `X-XSS-Protection: 1; mode=block` — 啟用瀏覽器 XSS 過濾
- `Referrer-Policy: strict-origin-when-cross-origin` — 限制 Referer 資訊洩漏
- `Permissions-Policy` — 禁用 camera/microphone/geolocation
- `poweredByHeader: false` — 移除 `X-Powered-By` header 減少資訊洩漏

### 7. Rate Limiting
- 所有 API 路由皆設定 per-IP rate limit
- 註冊：5 次/分鐘、登入：10 次/分鐘、留言：20 次/分鐘、上傳：5 次/分鐘、AI：10 次/分鐘

## 部署步驟

### 1. 建立 GitHub Repo
```bash
cd stan-website
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stan-website.git
git push -u origin main
```

### 2. 部署到 Vercel
1. 到 [vercel.com](https://vercel.com) 登入 GitHub
2. 點 **Import Project** → 選擇 `stan-website` repo
3. Framework Preset 選 **Next.js**
4. 點 **Deploy**

### 3. 建立 Postgres 資料庫
1. 在 Vercel Dashboard → **Storage** → **Create Database** → **Postgres**
2. 選擇區域（建議 Singapore）
3. 建立後在 **Projects** 頁面點 **Connect Project** 連結你的專案
4. 資料庫連線字串會自動加入環境變數

### 4. 設定環境變數
1. 在 Vercel Dashboard → 你的專案 → **Settings** → **Environment Variables**
2. 新增 `JWT_SECRET`：設定為一段隨機字串（必要）
3. （選用）新增 `GEMINI_API_KEY`：到 [Google AI Studio](https://aistudio.google.com/apikey) 免費取得，以啟用 AI 改寫功能

### 5. 重新部署
新增環境變數後需重新部署：**Deployments** → 最新一筆 → **Redeploy**

資料庫表會在第一次 API 呼叫時自動建立（`initDB()`）。

## 技術棧
- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: Vercel Postgres (Neon)
- **Auth**: bcryptjs + jose (JWT) + HttpOnly Cookie
- **AI**: Google Gemini 2.0 Flash（選用，免費額度）

## 開發
```bash
npm install
cp .env.example .env.local
# 填入 Postgres 連線字串 (可用 vercel env pull)
npm run dev
```
