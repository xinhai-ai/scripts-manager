#!/bin/sh

echo "=========================================="
echo "Starting Scripts Manager"
echo "=========================================="
echo ""

# 检查 Prisma 版本
echo "Checking Prisma version..."
node node_modules/prisma/build/index.js --version

# 运行数据库迁移
echo ""
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

# 启动应用
echo ""
echo "Starting application..."
node server.js
