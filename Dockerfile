# 使用官方 Node.js 镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 清理可能的缓存并安装确切版本
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 创建用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 输出
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制 Prisma schema
COPY --from=builder /app/prisma ./prisma

# 复制生成的 Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# 复制 package.json 用于运行时安装 Prisma CLI
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 复制启动脚本
COPY docker-start.sh ./docker-start.sh
RUN chmod +x ./docker-start.sh

# 创建数据目录
RUN mkdir -p /app/data /app/public/uploads

# 切换到 root 安装 Prisma CLI（只安装 prisma，不安装所有依赖）
USER root
RUN npm install --omit=dev prisma@6.19.1

# 修改权限
RUN chown -R nextjs:nodejs /app

# 保持 root 用户运行以确保有权限访问挂载的 volume
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用启动脚本
CMD ["./docker-start.sh"]
