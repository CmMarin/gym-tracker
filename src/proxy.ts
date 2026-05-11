import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiting map
// Note: In serverless environments, this is scoped per isolate/instance.
// For true distributed rate limiting, consider Redis (Upstash) in a production setup.
const ipMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_API = 100; // max requests per minute
const RATE_LIMIT_AUTH = 10; // stricter max requests per minute for auth endpoints
const TIME_WINDOW = 60 * 1000; // 1 minute window

export default function proxy(request: NextRequest) {
  // Only apply rate limits to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Determine client IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    
    // Choose rate limit based on route sensitivity
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth/');
    const maxRequests = isAuthRoute ? RATE_LIMIT_AUTH : RATE_LIMIT_API;

    const now = Date.now();
    let rateData = ipMap.get(ip);

    if (!rateData || now - rateData.lastReset > TIME_WINDOW) {
      // Initialize or reset Window
      rateData = { count: 1, lastReset: now };
    } else {
      // Increment counter
      rateData.count++;
      if (rateData.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests" }), 
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    ipMap.set(ip, rateData);
    
    // Periodically clean up the Map to prevent memory leaks in long-running processes
    // (A random 1/1000 chance on request to clear old entries)
    if (Math.random() < 0.001) {
      for (const [key, val] of ipMap.entries()) {
        if (now - val.lastReset > TIME_WINDOW) {
          ipMap.delete(key);
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware only to API routes
  matcher: '/api/:path*',
};
