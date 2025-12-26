import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { t, Language } from '@/lib/i18n';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang: langParam } = await params;
    const lang = (langParam === 'zh' ? 'zh' : 'en') as Language;

    const scripts = await prisma.script.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: {
          select: {
            name: true,
            order: true,
          },
        },
      },
    });

    if (scripts.length === 0) {
      return new NextResponse(
        `Write-Host "${t(lang, 'psNoScriptsAvailable')}" -ForegroundColor Yellow`,
        {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }

    // 在内存中排序：先按分类顺序，再按脚本名称
    const sortedScripts = scripts.sort((a, b) => {
      const aOrder = a.category?.order ?? 999999;
      const bOrder = b.category?.order ?? 999999;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return a.name.localeCompare(b.name);
    });

    const origin = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${origin}`;

    // 分离未分类和有分类的脚本
    const uncategorizedScripts = sortedScripts.filter(script => !script.category);
    const categorizedScripts = sortedScripts.filter(script => script.category);

    // 按分类分组（只分组有分类的脚本）
    const groupedScripts = categorizedScripts.reduce((acc, script) => {
      const categoryName = script.category!.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(script);
      return acc;
    }, {} as Record<string, typeof scripts>);

    const categories = Object.keys(groupedScripts);

    // 生成未分类脚本的执行函数
    let uncategorizedFunctions = '';
    uncategorizedScripts.forEach((script, index) => {
      uncategorizedFunctions += `\nfunction Execute-UncategorizedScript${index + 1} {\n`;
      uncategorizedFunctions += `    Write-Host ""\n`;
      uncategorizedFunctions += `    Write-Host "${t(lang, 'psExecuting', { name: script.name })}" -ForegroundColor Yellow\n`;
      uncategorizedFunctions += `    Write-Host ""\n`;
      uncategorizedFunctions += `    try {\n`;
      uncategorizedFunctions += `        \$scriptContent = Invoke-RestMethod -Uri "${baseUrl}/api/run/${script.id}"\n`;
      uncategorizedFunctions += `        Invoke-Expression \$scriptContent\n`;
      uncategorizedFunctions += `    } catch {\n`;
      uncategorizedFunctions += `        Write-Host "${t(lang, 'psErrorExecuting', { error: '' })}\$_" -ForegroundColor Red\n`;
      uncategorizedFunctions += `    }\n`;
      uncategorizedFunctions += `    Write-Host ""\n`;
      uncategorizedFunctions += `    Write-Host "${t(lang, 'psPressAnyKey')}"\n`;
      uncategorizedFunctions += `    \$null = \$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n`;
      uncategorizedFunctions += `    Show-MainMenu\n`;
      uncategorizedFunctions += `}\n`;
    });

    // 生成主菜单显示内容
    let mainMenuDisplay = '';
    let menuIndex = 1;

    // 添加未分类脚本到主菜单
    uncategorizedScripts.forEach((script) => {
      mainMenuDisplay += `    Write-Host "[${menuIndex}] ${script.name}" -ForegroundColor Green\n`;
      if (script.description) {
        mainMenuDisplay += `    Write-Host "    ${script.description}" -ForegroundColor Gray\n`;
      }
      menuIndex++;
    });

    // 如果有未分类脚本和分类，添加分隔符
    if (uncategorizedScripts.length > 0 && categories.length > 0) {
      mainMenuDisplay += `    Write-Host ""\n`;
    }

    // 添加分类到主菜单
    const categoryStartIndex = menuIndex;
    categories.forEach((category) => {
      const count = groupedScripts[category].length;
      const scriptText = count === 1 ? t(lang, 'scriptsCount', { count }) : t(lang, 'scriptsCountPlural', { count });
      mainMenuDisplay += `    Write-Host "[${menuIndex}] ${category} (${scriptText})" -ForegroundColor Cyan\n`;
      menuIndex++;
    });

    // 生成每个分类的脚本菜单函数
    let categoryFunctions = '';
    categories.forEach((category, catIndex) => {
      const categoryScripts = groupedScripts[category];

      categoryFunctions += `\nfunction Show-Category${catIndex + 1} {\n`;
      categoryFunctions += `    Clear-Host\n`;
      categoryFunctions += `    Write-Host "========================================" -ForegroundColor Cyan\n`;
      categoryFunctions += `    Write-Host "     ${category}" -ForegroundColor Cyan\n`;
      categoryFunctions += `    Write-Host "========================================" -ForegroundColor Cyan\n`;
      categoryFunctions += `    Write-Host ""\n\n`;

      categoryScripts.forEach((script, scriptIndex) => {
        categoryFunctions += `    Write-Host "[${scriptIndex + 1}] ${script.name}" -ForegroundColor Green\n`;
        if (script.description) {
          categoryFunctions += `    Write-Host "    ${script.description}" -ForegroundColor Gray\n`;
        }
      });

      categoryFunctions += `    Write-Host ""\n`;
      categoryFunctions += `    Write-Host "[0] ${t(lang, 'psBackToCategories')}" -ForegroundColor Yellow\n`;
      categoryFunctions += `    Write-Host ""\n\n`;
      categoryFunctions += `    \$choice = Read-Host "${t(lang, 'psSelectScript')}"\n\n`;
      categoryFunctions += `    switch (\$choice) {\n`;

      categoryScripts.forEach((script, scriptIndex) => {
        categoryFunctions += `        "${scriptIndex + 1}" {\n`;
        categoryFunctions += `            Write-Host ""\n`;
        categoryFunctions += `            Write-Host "${t(lang, 'psExecuting', { name: script.name })}" -ForegroundColor Yellow\n`;
        categoryFunctions += `            Write-Host ""\n`;
        categoryFunctions += `            try {\n`;
        categoryFunctions += `                \$scriptContent = Invoke-RestMethod -Uri "${baseUrl}/api/run/${script.id}"\n`;
        categoryFunctions += `                Invoke-Expression \$scriptContent\n`;
        categoryFunctions += `            } catch {\n`;
        categoryFunctions += `                Write-Host "${t(lang, 'psErrorExecuting', { error: '' })}\$_" -ForegroundColor Red\n`;
        categoryFunctions += `            }\n`;
        categoryFunctions += `            Write-Host ""\n`;
        categoryFunctions += `            Write-Host "${t(lang, 'psPressAnyKey')}"\n`;
        categoryFunctions += `            \$null = \$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n`;
        categoryFunctions += `            Show-Category${catIndex + 1}\n`;
        categoryFunctions += `        }\n`;
      });

      categoryFunctions += `        "0" {\n`;
      categoryFunctions += `            Show-MainMenu\n`;
      categoryFunctions += `        }\n`;
      categoryFunctions += `        default {\n`;
      categoryFunctions += `            Write-Host "${t(lang, 'psInvalidSelection')}" -ForegroundColor Red\n`;
      categoryFunctions += `            Start-Sleep -Seconds 1\n`;
      categoryFunctions += `            Show-Category${catIndex + 1}\n`;
      categoryFunctions += `        }\n`;
      categoryFunctions += `    }\n`;
      categoryFunctions += `}\n`;
    });

    // 生成主菜单函数
    let mainMenuFunction = `\nfunction Show-MainMenu {\n`;
    mainMenuFunction += `    Clear-Host\n`;
    mainMenuFunction += `    Write-Host "========================================" -ForegroundColor Cyan\n`;
    mainMenuFunction += `    Write-Host "     ${t(lang, 'psScriptsManager')}" -ForegroundColor Cyan\n`;
    mainMenuFunction += `    Write-Host "========================================" -ForegroundColor Cyan\n`;
    mainMenuFunction += `    Write-Host ""\n\n`;
    mainMenuFunction += mainMenuDisplay;
    mainMenuFunction += `    Write-Host ""\n`;
    mainMenuFunction += `    Write-Host "[0] ${t(lang, 'psExit')}" -ForegroundColor Red\n`;
    mainMenuFunction += `    Write-Host ""\n\n`;
    mainMenuFunction += `    \$choice = Read-Host "${t(lang, 'psSelectScript')}"\n\n`;
    mainMenuFunction += `    switch (\$choice) {\n`;

    // 添加未分类脚本的 switch cases
    uncategorizedScripts.forEach((script, index) => {
      mainMenuFunction += `        "${index + 1}" {\n`;
      mainMenuFunction += `            Execute-UncategorizedScript${index + 1}\n`;
      mainMenuFunction += `        }\n`;
    });

    // 添加分类的 switch cases
    categories.forEach((category, index) => {
      mainMenuFunction += `        "${categoryStartIndex + index}" {\n`;
      mainMenuFunction += `            Show-Category${index + 1}\n`;
      mainMenuFunction += `        }\n`;
    });

    mainMenuFunction += `        "0" {\n`;
    mainMenuFunction += `            Write-Host "${t(lang, 'psGoodbye')}" -ForegroundColor Yellow\n`;
    mainMenuFunction += `            return\n`;
    mainMenuFunction += `        }\n`;
    mainMenuFunction += `        default {\n`;
    mainMenuFunction += `            Write-Host "${t(lang, 'psInvalidSelection')}" -ForegroundColor Red\n`;
    mainMenuFunction += `            Start-Sleep -Seconds 1\n`;
    mainMenuFunction += `            Show-MainMenu\n`;
    mainMenuFunction += `        }\n`;
    mainMenuFunction += `    }\n`;
    mainMenuFunction += `}\n`;

    // 生成完整脚本
    const menuScript = `# PowerShell Scripts Manager
${uncategorizedFunctions}
${categoryFunctions}
${mainMenuFunction}

# Start the menu
Show-MainMenu
`;

    return new NextResponse(menuScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating menu:', error);
    return new NextResponse(
      'Write-Host "Error loading scripts" -ForegroundColor Red',
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
