import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${origin}`;

    // 生成语言检测和加载脚本
    const loaderScript = `# PowerShell Scripts Manager - Language Detector

# Detect system language
\$systemLang = (Get-Culture).Name

# Determine which language to use
\$lang = "en"
if (\$systemLang -match "^zh") {
    \$lang = "zh"
}

# Load the menu in detected language
Write-Host "Loading scripts manager (\$lang)..." -ForegroundColor Cyan
try {
    \$menuScript = Invoke-RestMethod -Uri "${baseUrl}/s/menu/\$lang"
    Invoke-Expression \$menuScript
} catch {
    Write-Host "Error loading scripts manager: \$_" -ForegroundColor Red
}
`;

    return new NextResponse(loaderScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating loader:', error);
    return new NextResponse(
      'Write-Host "Error loading scripts" -ForegroundColor Red',
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}

