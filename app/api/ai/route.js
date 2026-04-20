import { csrfCheck, rateLimit, stripTags, jsonResponse } from '@/lib/security';

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

    // Sanitize input — strip HTML tags, event handlers, etc.
    prompt = stripTags(prompt).trim();
    if (!prompt || prompt.length > 300) {
      return jsonResponse({ error: '文字需 1-300 字元' }, 400);
    }

    // ---------- Google Gemini API ----------
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const geminiUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: [
                      '你是一個文字改寫助手。請將以下文字改寫為更流暢、更優美的版本。',
                      '規則：',
                      '1. 保持原意不變，只改善表達方式',
                      '2. 用繁體中文回覆',
                      '3. 只回覆改寫後的文字，不需要其他說明或前綴',
                      '',
                      '要改寫的文字：',
                      prompt,
                    ].join('\n'),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
            // Safety settings to prevent abuse
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Sanitize AI output before returning to client
          return jsonResponse({ result: stripTags(text).trim() });
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('Gemini API error:', res.status, errData);
        }
      } catch (e) {
        console.error('Gemini fetch error:', e);
      }
    }

    // Fallback: simple text transformation if no API key
    const result = fallbackRewrite(prompt);
    return jsonResponse({ result });
  } catch (err) {
    console.error('AI error:', err);
    return jsonResponse({ error: 'AI 服務暫時無法使用' }, 500);
  }
}

// Simple fallback rewrite (no external API needed)
function fallbackRewrite(text) {
  const replacements = [
    [/我覺得/g, '我認為'],
    [/很好/g, '相當出色'],
    [/不錯/g, '值得肯定'],
    [/喜歡/g, '欣賞'],
    [/做/g, '進行'],
    [/想/g, '期望'],
    [/可以/g, '能夠'],
    [/但是/g, '然而'],
    [/所以/g, '因此'],
    [/因為/g, '由於'],
    [/很多/g, '眾多'],
    [/一些/g, '若干'],
    [/非常/g, '極為'],
    [/really/gi, 'truly'],
    [/good/gi, 'excellent'],
    [/bad/gi, 'suboptimal'],
    [/very/gi, 'remarkably'],
    [/think/gi, 'believe'],
    [/like/gi, 'appreciate'],
    [/want/gi, 'aspire'],
    [/big/gi, 'substantial'],
    [/small/gi, 'modest'],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return `✨ 改寫結果：\n${result}\n\n（提示：設定 GEMINI_API_KEY 環境變數可啟用 Google Gemini AI 深度改寫功能）`;
}
