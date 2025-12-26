import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/scripts') || pathname.startsWith('/api/stats') || pathname.startsWith('/api/upload') || pathname.startsWith('/api/categories')) {
    const token = getTokenFromRequest(request);

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  if (pathname.startsWith('/admin')) {
    const token = getTokenFromRequest(request);

    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/scripts/:path*', '/api/stats/:path*', '/api/upload/:path*', '/api/categories/:path*', '/admin/:path*'],
};
