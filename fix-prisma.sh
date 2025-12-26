#!/bin/bash

echo "========================================"
echo "  Fixing Prisma Version to 6.x"
echo "========================================"
echo ""

echo "Cleaning node_modules and cache..."
rm -rf node_modules package-lock.json .next

echo ""
echo "Installing dependencies with Prisma 6.19.1..."
npm install

echo ""
echo "Generating Prisma Client..."
npx prisma generate

echo ""
echo "========================================"
echo "Done! Prisma is now locked to 6.19.1"
echo "========================================"
echo ""
echo "You can now run:"
echo "  npm run dev"
echo ""
