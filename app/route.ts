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
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // PowerShell 访问：返回脚本内容
  return generateLoaderScript(request);
}
