import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    appUrl,
  });
}
