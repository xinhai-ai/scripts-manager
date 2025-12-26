import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateScriptWrapper(script: {
  content: string;
  requireAdmin: boolean;
  bypassExecutionPolicy: boolean;
}) {
  let finalScript = '';

  // 添加执行策略绕过
  if (script.bypassExecutionPolicy) {
    finalScript += `# Bypass Execution Policy
Set-ExecutionPolicy Bypass -Scope Process -Force

`;
  }

  // 添加管理员权限检查和提权
  if (script.requireAdmin) {
    finalScript += `# Check Admin Rights
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Administrator Rights Required" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "This script requires administrator privileges." -ForegroundColor Yellow
    Write-Host "Please run your PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    return
}

Write-Host "Running with administrator privileges" -ForegroundColor Green
Write-Host ""

`;
  }

  // 添加辅助函数
  finalScript += `# Helper Functions
function Download-File {
    param(
        [string]\$Url,
        [string]\$OutputPath
    )
    try {
        Write-Host "Downloading from \$Url..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri \$Url -OutFile \$OutputPath -UseBasicParsing
        Write-Host "Downloaded to \$OutputPath" -ForegroundColor Green
    } catch {
        Write-Host "Download failed: \$_" -ForegroundColor Red
    }
}

`;

  // 添加用户脚本
  finalScript += `# User Script
${script.content}
`;

  return finalScript;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const script = await prisma.script.findUnique({
      where: { id },
    });

    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    await prisma.scriptUsage.create({
      data: {
        scriptId: id,
        ip,
      },
    });

    const finalScript = generateScriptWrapper(script);

    return new NextResponse(finalScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
