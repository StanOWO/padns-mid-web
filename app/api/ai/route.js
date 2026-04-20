import { csrfCheck, rateLimit, stripTags, jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60_000)) {
    return jsonResponse({ error: '請求過於頻繁' }, 429);
  }

  try {
    const body = await request.json();
    let prompt = body.prompt;

    if (typeof prompt !== 'string') {
      return jsonResponse({ error: '請輸入文字' }, 400);
    }

    prompt = stripTags(prompt).trim();
    if (!prompt || prompt.length > 300) {
      return jsonResponse({ error: '文字需 1-300 字元' }, 400);
    }

    // ---------- Google Gemini API ----------
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'AI 功能尚未啟用' }, 500);
    }

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `你是一個文字改寫助手。請將以下文字改寫為更流暢、更優美的版本。
規則：
1. 保持原意不變，只改善表達方式
2. 用繁體中文回覆
3. 只回覆改寫後的文字，不需要其他說明或前綴

要改寫的文字：
${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        return jsonResponse({ result: stripTags(text).trim() });
      }
      // Blocked by safety filter
      const blockReason = data?.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY') {
        return jsonResponse({ error: '內容被安全過濾器攔截，請修改輸入文字' }, 400);
      }
      return jsonResponse({ error: 'AI 未產生回應，請重試' }, 500);
    } else {
      // Return the actual error to help debug
      const errBody = await geminiRes.text().catch(() => 'unknown');
      console.error('Gemini API error:', geminiRes.status, errBody);
      return jsonResponse({
        error: `Gemini API 錯誤 (${geminiRes.status})，請確認 API Key 是否正確`,
      }, 500);
    }
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('AI error:', err);
    return jsonResponse({ error: 'AI 服務暫時無法使用: ' + err.message }, 500);
  }
}
