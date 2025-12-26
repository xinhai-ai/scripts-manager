#!/bin/bash

# 脚本管理器部署脚本
# 用于首次在服务器上设置项目

set -e

echo "=========================================="
echo "  Scripts Manager 部署脚本"
echo "=========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 或 sudo 运行此脚本"
    exit 1
fi

# 安装 Docker（如果未安装）
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装"
fi

# 安装 Docker Compose（如果未安装）
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose 安装完成"
else
    echo "Docker Compose 已安装"
fi

# 创建项目目录
PROJECT_DIR="/opt/scripts-manager"
echo "创建项目目录: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 克隆仓库（如果还没有）
if [ ! -d ".git" ]; then
    echo "请输入 Git 仓库地址:"
    read GIT_REPO
    git clone $GIT_REPO .
else
    echo "Git 仓库已存在，跳过克隆"
fi

# 创建 .env 文件
if [ ! -f ".env" ]; then
    echo ""
    echo "创建 .env 配置文件..."
    echo "请输入配置信息:"

    echo -n "应用域名 (例如: https://scripts.yourdomain.com): "
    read APP_URL

    echo -n "管理员密码 (留空使用默认 admin123): "
    read ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

    # 生成随机 JWT Secret
    JWT_SECRET=$(openssl rand -hex 32)

    cat > .env <<EOF
# Application URL
APP_URL=$APP_URL

# Admin password
ADMIN_PASSWORD=$ADMIN_PASSWORD

# JWT secret (auto-generated)
JWT_SECRET=$JWT_SECRET
EOF

    echo ".env 文件创建完成"
else
    echo ".env 文件已存在，跳过创建"
fi

# 创建数据目录
mkdir -p data uploads
chmod -R 755 data uploads

# 构建并启动容器
echo ""
echo "构建并启动容器..."
docker-compose up -d --build

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "应用地址: $APP_URL"
echo "管理员密码: $ADMIN_PASSWORD"
echo ""
echo "有用的命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  更新代码: git pull && docker-compose up -d --build"
echo ""
