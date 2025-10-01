# API测试指南

## 目录
- [环境准备](#环境准备)
- [数据库初始化](#数据库初始化)
- [启动服务器](#启动服务器)
- [测试认证API](#测试认证API)
- [API文档](#api文档)

## 环境准备

1. 确保已安装Node.js (版本 >= 18)
2. 在项目根目录下安装依赖：
   ```bash
   cd backend
   npm install
   ```

3. 配置环境变量：
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑.env文件，填写正确的数据库配置
   ```

## 数据库初始化

1. 确保MySQL服务正在运行
2. 运行数据库初始化脚本：
   ```bash
   npm run db:init
   ```

## 启动服务器

开发模式启动：
```bash
npm run dev
```

生产模式启动：
```bash
npm run build
npm start
```

## 测试认证API

### 使用测试脚本

运行认证API测试：
```bash
npm run test:auth
```

### 手动测试

1. **用户注册**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "Test123456"
     }'
   ```

2. **用户登录**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123456"
     }'
   ```

3. **验证Token**
   ```bash
   curl -X GET http://localhost:5000/api/auth/verify \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

4. **用户登出**
   ```bash
   curl -X POST http://localhost:5000/api/auth/logout \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## API文档

详细API文档请查看：
- [认证API文档](AuthAPI.md)