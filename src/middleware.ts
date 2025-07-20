import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-Decoded-Token', JSON.stringify(decodedToken));
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}

export const config = {
  matcher: ['/api/items/:path*', '/api/users/:path*', '/api/admin/:path*'],
};
