import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 用户注册
  register = catchAsync(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    
    // 基本验证
    if (!username || !email || !password) {
      throw new AppError('用户名、邮箱和密码不能为空', 400, 'MISSING_FIELDS');
    }

    const result = await this.authService.register(username, email, password, req);
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: result
    });
  });

  // 用户登录
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 基本验证
    if (!email || !password) {
      throw new AppError('邮箱和密码不能为空', 400, 'MISSING_CREDENTIALS');
    }

    const result = await this.authService.login(email, password, req);
    
    res.json({
      success: true,
      message: '登录成功',
      data: result
    });
  });

  // 验证token
  verifyToken = catchAsync(async (req: Request, res: Response) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('请提供有效的认证令牌', 401, 'NO_TOKEN');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError('认证令牌不能为空', 401, 'EMPTY_TOKEN');
    }

    const result = await this.authService.verifyToken(token);
    
    res.json({
      success: true,
      message: '认证令牌有效',
      data: result
    });
  });

  // 用户登出
  logout = catchAsync(async (req: Request, res: Response) => {
    const authHeader = req.header('Authorization');
    let userId = null;

    // 尝试从 token 中获取用户信息用于日志记录
    if (authHeader && authHeader.startsWith('Bearer ') && process.env.JWT_SECRET) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        // 忽略 token 解析错误，不影响登出操作
      }
    }

    // 记录登出日志
    log.info('用户登出', {
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: '登出成功'
    });
  });
}