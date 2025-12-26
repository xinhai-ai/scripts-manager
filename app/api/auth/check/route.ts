import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const isValid = await verifyToken(token);

  return NextResponse.json({ authenticated: isValid });
}
