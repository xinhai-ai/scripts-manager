import { NextRequest, NextResponse } from 'next/server';
import { generateLoaderScript } from '@/lib/script-loader';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // 检测是否是 PowerShell 或命令行工具访问
  const isPowerShell = userAgent.includes('PowerShell') ||
                       userAgent.includes('curl') ||
                       userAgent.includes('Wget') ||
                       userAgent.includes('WindowsPowerShell');

  // 如果是浏览器访问，重定向到登录页
  if (!isPowerShell) {
    // 构建正确的重定向 URL（考虑反向代理）
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  // PowerShell 访问：返回脚本内容
  return generateLoaderScript(request);
}
