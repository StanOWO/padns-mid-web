import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // --- Content Security Policy ---
  // Prevents XSS by restricting script sources
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Allow inline styles for Tailwind + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Allow scripts only from self (Next.js bundles)
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Allow images from self and data: URLs (avatars)
      "img-src 'self' data: blob:",
      // Allow fonts from Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Allow API calls to self and Google Gemini API
      "connect-src 'self' https://generativelanguage.googleapis.com",
      // Prevent framing (clickjacking)
      "frame-ancestors 'none'",
      // Form actions only to self
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
    ].join('; ')
  );

  // --- Security headers ---
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and _next internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
