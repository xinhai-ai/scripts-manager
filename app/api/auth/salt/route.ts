import { NextResponse } from 'next/server';
import { getSalt } from '@/lib/salt';

export async function GET() {
  // 获取自动生成并持久化的 salt
  const salt = getSalt();

  return NextResponse.json({ salt });
}
