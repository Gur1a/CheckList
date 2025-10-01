# TodoList Backend Service

TodoList 系统的后端 API 服务，基于 Node.js + Express + TypeScript + MySQL 构建。

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- MySQL 8.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 并重命名为 `.env`，然后配置相应的环境变量：

```bash
cp .env.example .env
```

### 启动服务器

#### 开发模式
```bash
# 方式1: 直接启动 (推荐)
npm run dev

# 方式2: 使用TypeScript启动脚本
npm run dev:start
```

#### 生产模式
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

#### API 测试
```bash
npm run test:api
```

## 📋 可用脚本

| 脚本 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 (热重载) |
| `npm run dev:start` | 使用TypeScript启动脚本启动开发服务器 |
| `npm run build` | 构建生产版本到 `dist/` 目录 |
| `npm start` | 启动生产服务器 |
| `npm run test` | 运行单元测试 |
| `npm run test:api` | 运行API功能测试 |
| `npm run type-check` | TypeScript类型检查 |
| `npm run clean` | 清理构建文件 |

## 🏗️ 项目结构

```
backend/
├── config/              # 配置文件
│   ├── database.ts     # 数据库配置
│   └── socket.js       # Socket.io配置
├── middleware/          # 中间件
│   ├── auth.ts         # 认证中间件
│   ├── errorHandler.ts # 错误处理中间件
│   └── logger.ts       # 日志中间件
├── models/             # 数据模型
│   ├── User.ts         # 用户模型
│   ├── Task.ts         # 任务模型
│   ├── Project.ts      # 项目模型
│   ├── Board.ts        # 看板模型
│   ├── History.ts      # 历史记录模型
│   └── index.ts        # 模型导出
├── routes/             # 路由定义
│   └── auth.ts         # 认证路由
├── dist/               # 构建输出目录
├── index.ts            # 主入口文件
├── server.ts           # 服务器配置
├── start-dev.ts        # 开发启动脚本
├── run.ts              # 便捷运行脚本
├── test-api.js         # API测试脚本
└── package.json        # 项目配置
```

## 🔧 入口文件说明

### 主入口文件
- **`index.ts`** - 项目主入口，负责环境检查和应用启动
- **`server.ts`** - Express服务器配置和中间件设置

### 启动脚本
- **`start-dev.ts`** - TypeScript版本的开发启动脚本
- **`run.ts`** - 便捷的多模式启动脚本

## 🌐 API 端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录  
- `GET /api/auth/verify` - 验证token
- `POST /api/auth/logout` - 用户登出

### 系统相关
- `GET /api/health` - 健康检查
- `GET /api` - API文档

## 🔒 环境变量

```bash
# 服务器配置
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todolist_sys
DB_USER=your_username
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## 🚦 启动流程

1. **环境检查** - 验证必要的环境变量
2. **数据库连接** - 连接MySQL数据库
3. **模型同步** - 同步数据表结构 (开发环境)
4. **中间件加载** - 加载认证、日志等中间件
5. **路由注册** - 注册API路由
6. **服务器启动** - 启动HTTP服务器和Socket.io

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   ```
   确保MySQL服务已启动
   检查.env文件中的数据库配置
   确保数据库用户有足够权限
   ```

2. **端口被占用**
   ```
   修改.env文件中的PORT值
   或者关闭占用5000端口的其他程序
   ```

3. **TypeScript编译错误**
   ```
   npm run type-check  # 检查类型错误
   npm run clean       # 清理构建文件
   npm run build       # 重新构建
   ```

## 📝 日志

- 开发环境：彩色控制台输出
- 生产环境：写入 `logs/` 目录
- 日志级别：ERROR, WARN, INFO, DEBUG

## 🧪 测试

```bash
# 运行API测试
npm run test:api

# 测试特定接口
curl http://localhost:5000/api/health
```

## 📚 技术栈

- **Node.js** - JavaScript运行环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全的JavaScript
- **MySQL** - 关系型数据库
- **Sequelize** - ORM框架
- **JWT** - 身份认证
- **Socket.io** - 实时通信
- **bcryptjs** - 密码加密