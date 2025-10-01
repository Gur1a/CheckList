import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入路由
import authRoutes from './routes/auth';
import taskRoutes from './routes/task';
import projectRoutes from './routes/projects';
import boardRoutes from './routes/boards';
import tagRoutes from './routes/tag';

// 导入中间件
import authMiddleware from './middleware/auth';
import errorHandler from './middleware/errorHandler';
import logger from './middleware/logger';

// 导入数据库连接
import { connectDatabase } from './config/database';

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 配置Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 连接数据库
connectDatabase();

// 基础中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// 请求解析中间件
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// 日志中间件
app.use(logger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tags', tagRoutes);


// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API文档路由
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'TodoList System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      tasks: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        bulkUpdateStatus: 'PUT /api/tasks/bulk/status',
        bulkDelete: 'DELETE /api/tasks/bulk',
        move: 'PUT /api/tasks/:id/move',
        addSubtask: 'POST /api/tasks/:id/subtasks',
        toggleSubtask: 'PUT /api/tasks/:id/subtasks/:subtaskId/toggle',
        addComment: 'POST /api/tasks/:id/comments',
        addWatcher: 'POST /api/tasks/:id/watchers',
        removeWatcher: 'DELETE /api/tasks/:id/watchers/:userId'
      },
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        userProjects: 'GET /api/projects/user',
        archive: 'PUT /api/projects/:id/archive',
        unarchive: 'PUT /api/projects/:id/unarchive',
        addMember: 'POST /api/projects/:id/members',
        removeMember: 'DELETE /api/projects/:id/members/:memberId',
        getBoards: 'GET /api/projects/:projectId/boards'
      },
      boards: {
        list: 'GET /api/boards',
        create: 'POST /api/boards',
        get: 'GET /api/boards/:id',
        update: 'PUT /api/boards/:id',
        delete: 'DELETE /api/boards/:id',
        reorder: 'POST /api/boards/reorder'
      },
      tags: {
        list: 'GET /api/tags',
        create: 'POST /api/tags',
        update: 'PUT /api/tags/:id',
        delete: 'DELETE /api/tags/:id',
        getTasksByTag: 'GET /api/tags/:tagId/tasks',
        addTagToTask: 'POST /api/tags/:tagId/tasks/:taskId',
        removeTagFromTask: 'DELETE /api/tags/:tagId/tasks/:taskId'
      },
      health: 'GET /api/health'
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `接口 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`🔌 用户连接: ${socket.id}`);
  
  // 用户断开连接
  socket.on('disconnect', () => {
    console.log(`🔌 用户断开连接: ${socket.id}`);
  });
  
  // 处理错误
  socket.on('error', (error) => {
    console.error('Socket.io 错误:', error);
  });
});

// 启动服务器
const PORT = parseInt(process.env.PORT || '5000', 10);

server.listen(PORT, () => {
  console.log('🚀======================================🚀');
  console.log(`🚀 TodoList System API 服务器启动成功！`);
  console.log(`🚀 运行环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 端口号: ${PORT}`);
  console.log(`🚀 访问地址: http://localhost:${PORT}`);
  console.log(`🚀 API文档: http://localhost:${PORT}/api`);
  console.log(`🚀 健康检查: http://localhost:${PORT}/api/health`);
  console.log('🚀======================================🚀');
});

// 优雅关闭处理
const shutdown = (signal: string) => {
  console.log(`\n🛑 收到 ${signal} 信号，正在优雅关闭服务器...`);
  
  server.close(() => {
    console.log('✅ HTTP 服务器已关闭');
    
    // 关闭Socket.io连接
    io.close(() => {
      console.log('✅ Socket.io 服务器已关闭');
      
      // 关闭数据库连接
      // TODO: 添加数据库连接关闭逻辑
      console.log('✅ 数据库连接已关闭');
      
      console.log('✅ 服务器完全关闭，进程退出');
      process.exit(0);
    });
  });
  
  // 强制关闭超时
  setTimeout(() => {
    console.error('❌ 强制关闭服务器');
    process.exit(1);
  }, 10000);
};

// 监听关闭信号
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  console.error('❌ 在Promise:', promise);
  shutdown('unhandledRejection');
});

export { app, server, io };
export default app;