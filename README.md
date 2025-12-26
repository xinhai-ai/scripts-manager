# PowerShell Scripts Manager

一个基于 Next.js 的 PowerShell 脚本管理系统，允许你通过网页管理脚本，并提供一键执行功能。

## 功能特性

- 通过网页界面管理 PowerShell 脚本（创建、编辑、删除）
- 生成可在 PowerShell 中一键运行的命令
- 统计脚本使用次数和历史记录
- 简单密码保护的管理界面
- SQLite 数据库存储

## 技术栈

- **前端/后端**: Next.js 15 (App Router)
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT (jose)
- **样式**: Tailwind CSS
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，设置管理员密码：

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="your-password-here"
JWT_SECRET="your-secret-key-here"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用方法

### 1. 登录管理界面

- 访问 http://localhost:3000
- 使用 `.env` 文件中设置的密码登录

### 2. 创建脚本

1. 点击 "New Script" 按钮
2. 填写脚本名称、描述（可选）
3. 输入 PowerShell 脚本内容
4. 点击 "Create Script" 保存

### 3. 执行脚本

**方式一：交互式菜单（推荐）**

在 PowerShell 中运行以下命令，会显示所有可用脚本的菜单供你选择：

```powershell
iex (irm http://localhost:3000/s)
```

这会显示一个交互式菜单，列出所有脚本，你只需输入编号即可执行。

**方式二：直接执行特定脚本**

如果你知道脚本 ID，可以直接运行：

```powershell
iex (irm http://localhost:3000/api/run/<script-id>)
```

你也可以在管理界面点击 "Copy Command" 按钮复制完整命令。

### 4. 查看统计

点击导航栏的 "Statistics" 查看：
- 总脚本数
- 总执行次数
- 每个脚本的使用统计
- 最近的执行记录

## API 端点

### 公开端点

- `GET /api/run/[id]` - 获取并执行脚本（返回脚本内容，记录使用情况）

### 受保护端点（需要认证）

- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/check` - 检查认证状态
- `GET /api/scripts` - 获取所有脚本
- `GET /api/scripts?id=<id>` - 获取单个脚本
- `POST /api/scripts` - 创建脚本
- `PATCH /api/scripts` - 更新脚本
- `DELETE /api/scripts?id=<id>` - 删除脚本
- `GET /api/stats` - 获取统计数据

## 数据库模型

### Script
- id: 唯一标识符
- name: 脚本名称
- description: 脚本描述（可选）
- content: PowerShell 脚本内容
- createdAt: 创建时间
- updatedAt: 更新时间

### ScriptUsage
- id: 唯一标识符
- scriptId: 关联的脚本 ID
- timestamp: 执行时间
- ip: 执行者 IP 地址

## 部署

### 生产环境构建

```bash
npm run build
npm start
```

### 环境变量配置

生产环境请务必修改：
- `ADMIN_PASSWORD`: 设置强密码
- `JWT_SECRET`: 设置随机密钥（至少 32 字符）

### 注意事项

1. 确保 `.env` 文件不被提交到版本控制系统
2. 生产环境建议使用 PostgreSQL 替代 SQLite
3. 建议在反向代理（如 Nginx）后运行，并启用 HTTPS
4. 定期备份 SQLite 数据库文件（`prisma/dev.db`）

## 安全建议

1. 使用强密码保护管理界面
2. 不要在公网直接暴露此应用，除非你了解风险
3. 定期审查脚本内容，避免恶意脚本
4. 考虑添加 IP 白名单限制
5. 生产环境使用 HTTPS

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

