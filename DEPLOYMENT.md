# Scripts Manager 部署指南

## 快速部署到自己的服务器

### 方式一：自动部署脚本（推荐）

#### 1. 服务器首次设置

在服务器上运行：

```bash
# 下载部署脚本
curl -o deploy.sh https://raw.githubusercontent.com/xinhai-ai/scripts-manager/main/deploy.sh

# 添加执行权限
chmod +x deploy.sh

# 运行部署脚本
sudo ./deploy.sh
```

脚本会自动：
- 安装 Docker 和 Docker Compose
- 克隆代码仓库
- 创建 .env 配置
- 构建并启动容器

#### 2. 配置自动部署

在 GitHub 仓库设置中添加以下 Secrets：

- `SERVER_HOST`: 服务器 IP 或域名
- `SERVER_USER`: SSH 用户名 (例如: root)
- `SERVER_SSH_KEY`: SSH 私钥（完整内容）
- `SERVER_PORT`: SSH 端口（可选，默认 22）

设置完成后，每次推送到 `main` 分支会自动部署到服务器。

### 方式二：手动部署

#### 1. 服务器环境准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 2. 克隆代码

```bash
cd /opt
git clone https://github.com/xinhai-ai/scripts-manager.git
cd scripts-manager
```

#### 3. 配置环境变量

创建 `.env` 文件：

```bash
APP_URL=https://scripts.yourdomain.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=$(openssl rand -hex 32)
```

#### 4. 启动应用

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

#### 5. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name scripts.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

然后配置 SSL：

```bash
sudo certbot --nginx -d scripts.yourdomain.com
```

### 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码
git pull
docker-compose up -d --build

# 备份数据库
cp data/dev.db data/dev.db.backup

# 清理 Docker 资源
docker system prune -a
```

## 数据持久化

项目使用卷挂载来持久化数据：

- `./data` - SQLite 数据库
- `./uploads` - 用户上传的文件

## 故障排查

### 查看应用日志
```bash
docker-compose logs -f app
```

### 进入容器调试
```bash
docker-compose exec app sh
```

### 重置数据库
```bash
docker-compose down
rm -rf data/dev.db
docker-compose up -d
```

## 更新应用

自动部署已配置，推送到 `main` 分支即可自动更新。

手动更新：
```bash
cd /opt/scripts-manager
git pull
docker-compose up -d --build
```

## 监控和维护

### 设置定期备份

创建备份脚本 `/opt/scripts-manager/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/scripts-manager"
mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/scripts-manager/data/dev.db $BACKUP_DIR/dev.db.$DATE

# 备份上传文件
tar -czf $BACKUP_DIR/uploads.$DATE.tar.gz /opt/scripts-manager/uploads

# 保留最近 30 天的备份
find $BACKUP_DIR -name "*.db.*" -mtime +30 -delete
find $BACKUP_DIR -name "uploads.*.tar.gz" -mtime +30 -delete
```

添加到 crontab：
```bash
# 每天凌晨 2 点备份
0 2 * * * /opt/scripts-manager/backup.sh
```

## 安全建议

1. 修改默认管理员密码
2. 使用强 JWT_SECRET
3. 配置防火墙，只开放必要端口
4. 定期更新系统和 Docker
5. 使用 HTTPS（Let's Encrypt）
6. 定期备份数据

## 支持

如有问题，请查看：
- 日志: `docker-compose logs -f`
- GitHub Issues: https://github.com/xinhai-ai/scripts-manager/issues
