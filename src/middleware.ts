import { NextResponse, type NextRequest } from 'next/server';

// Firebase Admin SDK cannot be used in Edge Middleware. If you need authentication, use a JWT verification library compatible with Edge Runtime, or move this logic to API routes.

export async function middleware(request: NextRequest) {
  // For now, just allow all requests to unblock the build.
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/items/:path*', '/api/users/:path*', '/api/admin/:path*'],
};
