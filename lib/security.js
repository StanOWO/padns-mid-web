// ============================================================
// Security utilities: XSS sanitization, CSRF check, rate limit
// ============================================================

// --- XSS: strip all HTML tags and dangerous characters ---
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');
}

// Strip tags entirely (for stored content)
// Handles edge cases: unclosed tags, nested tags, null bytes
export function stripTags(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '')                  // Remove null bytes
    .replace(/<[^>]*>?/g, '')            // Remove tags (including unclosed)
    .replace(/javascript\s*:/gi, '')     // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')          // Remove event handlers (onclick=, onerror=, etc.)
    .replace(/data\s*:[^,]*base64/gi, 'blocked'); // Block data: base64 in text
}

// --- CSRF: verify Origin / Referer header ---
export function csrfCheck(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Allow requests without Origin in dev (e.g. curl, Postman)
  if (!origin && !referer) {
    // In production, block requests with no origin
    if (process.env.NODE_ENV === 'production') return false;
    return true;
  }

  // Check that the origin matches our host
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) return true;
    } catch {
      return false;
    }
  }

  return false;
}

// --- Rate limiting (in-memory, per IP, resets on cold start) ---
const rateLimitMap = new Map();

export function rateLimit(ip, maxRequests = 30, windowMs = 60_000) {
  const now = Date.now();
  const key = ip || 'unknown';
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(key, { start: now, count: 1 });
    return true;
  }

  entry.count++;
  if (entry.count > maxRequests) return false;
  return true;
}

// --- Validate username / password ---
export function validateUsername(u) {
  if (typeof u !== 'string') return false;
  if (u.length < 2 || u.length > 30) return false;
  // Only allow alphanumeric, underscore, dash
  return /^[a-zA-Z0-9_-]+$/.test(u);
}

export function validatePassword(p) {
  if (typeof p !== 'string') return false;
  return p.length >= 4 && p.length <= 128;
}

// --- Validate file type for avatar ---
export function validateAvatarDataURL(dataUrl) {
  if (typeof dataUrl !== 'string') return false;
  // Must start with data:image/jpeg or data:image/png
  if (!dataUrl.startsWith('data:image/jpeg;base64,') &&
      !dataUrl.startsWith('data:image/png;base64,')) {
    return false;
  }
  // Max ~2MB in base64 (~2.7MB string)
  if (dataUrl.length > 3_000_000) return false;
  return true;
}

// --- Security response headers ---
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Type': 'application/json',
  };
}

// --- Helper to build a secure JSON response ---
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
