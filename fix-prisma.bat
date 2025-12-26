@echo off
echo ========================================
echo Fixing Prisma Version to 6.x
echo ========================================
echo.

echo Cleaning node_modules and cache...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo.
echo Installing dependencies with Prisma 6.19.1...
call npm install

echo.
echo Generating Prisma Client...
call npx prisma generate

echo.
echo ========================================
echo Done! Prisma is now locked to 6.19.1
echo ========================================
echo.
echo You can now run:
echo   npm run dev
echo.
pause
