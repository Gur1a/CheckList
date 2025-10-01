import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import initializeModels from '../models/index';
import { AppError } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { ProjectService } from './ProjectService';

export class AuthService {
  private userRepository: UserRepository;
  private historyRepository: HistoryRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.historyRepository = new HistoryRepository();
  }

  // 基本验证函数
  private validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  private validatePassword = (password: string): boolean => {
    return password.length >= 6 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  private validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username);
  };

  // 用户注册
  async register(username: string, email: string, password: string, req: any) {
    // 格式验证
    if (!this.validateUsername(username)) {
      throw new AppError('用户名长度必须在3-20个字符之间，且只能包含字母、数字、下划线和中文', 400, 'INVALID_USERNAME');
    }

    if (!this.validateEmail(email)) {
      throw new AppError('请输入有效的邮箱地址', 400, 'INVALID_EMAIL');
    }

    if (!this.validatePassword(password)) {
      throw new AppError('密码至少6个字符，且必须包含大小写字母和数字', 400, 'INVALID_PASSWORD');
    }

    // 检查用户是否已存在
    const existingUser = await this.userRepository.findByEmailOrUsername(email, username);

    if (existingUser) {
      const message = existingUser.email === email ? '邮箱已被注册' : '用户名已被占用';
      const code = existingUser.email === email ? 'EMAIL_EXISTS' : 'USERNAME_EXISTS';
      throw new AppError(message, 400, code);
    }

    // 创建新用户
    const user = await this.userRepository.create({ username, email, password });

    // 记录历史
    try {
      await this.historyRepository.create({
        entityType: 'user',
        entityId: user.id,
        entityModel: 'User',
        action: 'create',
        performedBy: user.id,
        description: '用户注册',
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'web'
        }
      });
    } catch (historyError) {
      log.warn('记录用户注册历史失败', historyError);
    }

    // 创建默认"收集箱"项目
    try {
      const projectService = new ProjectService();
      const defaultProject = await projectService.createProject({
        name: '收集箱',
        description: '默认的任务收集箱',
        color: '#6c757d',
        icon: '📋',
        isPrivate: false,
        isArchived: false,
        members: [{
          userId: user.id,
          role: 'owner',
          permissions: {
            canEditProject: true,
            canDeleteProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageBoards: true
          },
          joinedAt: new Date()
        }],
        settings: {
          allowInvites: true,
          allowGuestAccess: false,
          defaultTaskStatus: 'todo',
          autoArchiveCompleted: false,
          enableTimeTracking: false
        },
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          totalMembers: 1
        },
        lastActivity: new Date()
      }, user.id);

      // 设置用户的默认项目ID
      const { User } = await initializeModels();
      await User.update(
        { defaultProjectId: defaultProject.id },
        { where: { id: user.id } }
      );

      log.info(`为用户 ${user.id} 创建了默认收集箱项目 ${defaultProject.id}`);
    } catch (projectError) {
      log.error('创建默认收集箱项目失败', projectError);
      // 不抛出错误，因为注册流程应该继续
    }

    // 验证JWT密钥
    if (!process.env.JWT_SECRET) {
      throw new AppError('服务器配置错误', 500, 'JWT_SECRET_MISSING');
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // 记录成功注册日志
    log.info('用户注册成功', {
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip
    });

    return {
      token,
      user: user.getPublicProfile()
    };
  }

  // 用户登录
  async login(email: string, password: string, req: any) {
    if (!this.validateEmail(email)) {
      throw new AppError('请输入有效的邮箱地址', 400, 'INVALID_EMAIL');
    }

    // 查找用户
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    // 检查账户状态
    if (!user.isActive) {
      throw new AppError('账户已被禁用，请联系管理员', 401, 'ACCOUNT_DISABLED');
    }

    // 更新最后登录时间
    await user.updateLastLogin();

    // 记录历史
    try {
      await this.historyRepository.create({
        entityType: 'user',
        entityId: user.id,
        entityModel: 'User',
        action: 'update',
        performedBy: user.id,
        description: '用户登录',
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'web'
        }
      });
    } catch (historyError) {
      log.warn('记录用户登录历史失败', historyError);
    }

    // 验证JWT密钥
    if (!process.env.JWT_SECRET) {
      throw new AppError('服务器配置错误', 500, 'JWT_SECRET_MISSING');
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // 记录成功登录日志
    log.info('用户登录成功', {
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip,
      lastLogin: user.lastLoginAt
    });

    return {
      token,
      user: user.getPublicProfile()
    };
  }

  // 验证Token
  async verifyToken(token: string) {
    // 验证JWT密钥
    if (!process.env.JWT_SECRET) {
      throw new AppError('服务器配置错误', 500, 'JWT_SECRET_MISSING');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      if (!decoded.userId) {
        throw new AppError('无效的认证令牌格式', 401, 'INVALID_TOKEN_FORMAT');
      }
      
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new AppError('用户不存在，请重新登录', 401, 'USER_NOT_FOUND');
      }

      if (!user.isActive) {
        throw new AppError('账户已被禁用，请联系管理员', 401, 'ACCOUNT_DISABLED');
      }

      return {
        user: user.getPublicProfile()
      };

    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('认证令牌已过期，请重新登录', 401, 'TOKEN_EXPIRED');
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        throw new AppError('无效的认证令牌', 401, 'INVALID_TOKEN');
      }
      
      if (jwtError.name === 'NotBeforeError') {
        throw new AppError('认证令牌尚未生效', 401, 'TOKEN_NOT_ACTIVE');
      }

      // 如果是AppError，直接抛出
      if (jwtError instanceof AppError) {
        throw jwtError;
      }

      // 其他未知错误
      log.error('JWT验证未知错误', jwtError);
      throw new AppError('认证令牌验证失败', 401, 'TOKEN_VERIFICATION_FAILED');
    }
  }
}