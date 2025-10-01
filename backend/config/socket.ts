import jwt from 'jsonwebtoken';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { log } from '../middleware/logger';

// 扩展Socket接口以包含自定义属性
interface AuthenticatedSocket extends Socket {
  userId?: number;
}

// Socket事件数据接口
interface TaskUpdateData {
  projectId: string;
  taskId: string;
  updates: any;
}

interface TaskEditingData {
  projectId: string;
  taskId: string;
  username?: string;
}

interface UserStatusData {
  status: 'online' | 'away' | 'busy' | 'offline';
}

/**
 * 配置Socket.io服务器
 */
const configureSocket = (io: SocketIOServer): SocketIOServer => {
  // Socket.io认证中间件
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
          socket.userId = decoded.userId;
          socket.join(`user_${decoded.userId}`);
          log.debug(`Socket认证成功: 用户 ${decoded.userId}`);
        } catch (jwtError: any) {
          log.warn('Socket JWT验证失败:', jwtError.message);
        }
      }
      
      next();
    } catch (error: any) {
      log.error('Socket认证中间件错误:', error);
      next();
    }
  });

  // 连接事件处理
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId || 'anonymous';
    log.info(`🔌 用户连接: ${userId}`, {
      socketId: socket.id,
      userId: socket.userId
    });

    // 加入项目房间
    socket.on('join_project', (projectId: string) => {
      try {
        socket.join(`project_${projectId}`);
        log.info(`用户 ${userId} 加入项目 ${projectId}`);
        
        // 通知其他用户有新用户加入
        socket.to(`project_${projectId}`).emit('user_joined_project', {
          userId: socket.userId,
          projectId,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        log.error('加入项目房间失败:', error);
      }
    });

    // 离开项目房间
    socket.on('leave_project', (projectId: string) => {
      try {
        socket.leave(`project_${projectId}`);
        log.info(`用户 ${userId} 离开项目 ${projectId}`);
        
        // 通知其他用户有用户离开
        socket.to(`project_${projectId}`).emit('user_left_project', {
          userId: socket.userId,
          projectId,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        log.error('离开项目房间失败:', error);
      }
    });

    // 任务更新广播
    socket.on('task_update', (data: TaskUpdateData) => {
      try {
        if (!data.projectId || !data.taskId) {
          log.warn('任务更新数据不完整:', data);
          return;
        }

        const updateData = {
          ...data,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        };

        socket.to(`project_${data.projectId}`).emit('task_updated', updateData);
        log.debug(`任务更新广播: 项目 ${data.projectId}, 任务 ${data.taskId}`);
      } catch (error: any) {
        log.error('任务更新广播失败:', error);
      }
    });

    // 实时协作 - 正在编辑任务
    socket.on('task_editing', (data: TaskEditingData) => {
      try {
        if (!data.projectId || !data.taskId) {
          log.warn('任务编辑数据不完整:', data);
          return;
        }

        socket.to(`project_${data.projectId}`).emit('user_editing_task', {
          taskId: data.taskId,
          userId: socket.userId,
          username: data.username || `用户${socket.userId}`,
          timestamp: new Date().toISOString()
        });

        log.debug(`用户开始编辑任务: 用户 ${userId}, 任务 ${data.taskId}`);
      } catch (error: any) {
        log.error('任务编辑广播失败:', error);
      }
    });

    // 停止编辑任务
    socket.on('task_editing_stop', (data: TaskEditingData) => {
      try {
        if (!data.projectId || !data.taskId) {
          log.warn('停止编辑数据不完整:', data);
          return;
        }

        socket.to(`project_${data.projectId}`).emit('user_stopped_editing_task', {
          taskId: data.taskId,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });

        log.debug(`用户停止编辑任务: 用户 ${userId}, 任务 ${data.taskId}`);
      } catch (error: any) {
        log.error('停止编辑广播失败:', error);
      }
    });

    // 在线状态更新
    socket.on('user_status', (data: UserStatusData) => {
      try {
        if (!socket.userId) {
          log.warn('未认证用户尝试更新状态');
          return;
        }

        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          status: data.status,
          timestamp: new Date().toISOString()
        });

        log.debug(`用户状态更新: 用户 ${userId}, 状态 ${data.status}`);
      } catch (error: any) {
        log.error('状态更新广播失败:', error);
      }
    });

    // 错误处理
    socket.on('error', (error: Error) => {
      log.error('Socket错误:', {
        error: error.message,
        stack: error.stack,
        socketId: socket.id,
        userId: socket.userId
      });
    });

    // 断开连接
    socket.on('disconnect', (reason: string) => {
      log.info(`🔌 用户断开连接: ${userId}`, {
        reason,
        socketId: socket.id,
        userId: socket.userId
      });
      
      // 通知其他用户该用户已离线
      if (socket.userId) {
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          status: 'offline' as const,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Socket.io错误处理
  io.on('error', (error: Error) => {
    log.error('Socket.io服务器错误:', error);
  });

  log.info('Socket.io配置完成');
  return io;
};

export default configureSocket;
export { AuthenticatedSocket, TaskUpdateData, TaskEditingData, UserStatusData };