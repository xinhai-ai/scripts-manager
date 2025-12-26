#!/bin/sh

echo "=========================================="
echo "Starting Scripts Manager"
echo "=========================================="
echo ""

# 确保数据目录有正确的权限
echo "Setting up data directory permissions..."
mkdir -p /app/data /app/public/uploads
chmod -R 755 /app/data /app/public/uploads

# 检查 Prisma 版本
echo ""
echo "Checking Prisma version..."
npx prisma --version

# 检查数据库是否存在
DATABASE_PATH="/app/data/dev.db"
if [ ! -f "$DATABASE_PATH" ]; then
    echo ""
    echo "Database does not exist. Initializing database..."
    npx prisma db push --skip-generate
else
    echo ""
    echo "Database exists. Running migrations..."
    npx prisma migrate deploy
fi

# 启动应用
echo ""
echo "Starting application..."
node server.js
