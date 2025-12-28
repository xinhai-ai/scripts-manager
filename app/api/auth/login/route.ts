import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { getSalt } from '@/lib/salt';
import crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * 使用 PBKDF2 算法对密码进行加盐哈希（服务器端）
 */
async function hashPassword(
  password: string,
  salt: string,
  iterations: number = 100000
): Promise<string> {
  const derivedKey = await pbkdf2(password, salt, iterations, 32, 'sha256');
  return derivedKey.toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passwordHash } = body;

    // 获取自动生成并持久化的 salt
    const salt = getSalt();

    // 对环境变量中的明文密码进行加盐哈希
    const expectedHash = await hashPassword(process.env.ADMIN_PASSWORD || '', salt);

    // 比较客户端发送的哈希值和服务器计算的哈希值
    if (passwordHash === expectedHash) {
      const token = await createToken();

      const response = NextResponse.json({
        success: true,
        token,
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
