import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import initializeModels from '../models/index';

// 扩展Request接口以包含user属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT Payload 接口
interface JWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

// 认证中间件
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 从header中获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '访问被拒绝，请提供有效的认证令牌',
        code: 'NO_TOKEN'
      });
      return;
    }

    // 提取token（移除 'Bearer ' 前缀）
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: '认证令牌不能为空',
        code: 'EMPTY_TOKEN'
      });
      return;
    }

    try {
      // 验证JWT secret
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET 环境变量未设置');
      }

      // 验证并解码token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      console.log('decoded', decoded);

      
      if (!decoded.userId) {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌格式',
          code: 'INVALID_TOKEN_FORMAT'
        });
        return;
      }

      // 获取用户模型
      const { User } = await initializeModels();
      
      // 查找用户
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: '用户不存在，请重新登录',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // 检查用户是否被禁用
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: '账户已被禁用，请联系管理员',
          code: 'ACCOUNT_DISABLED'
        });
        return;
      }

      // 将用户信息添加到请求对象（不包含密码等敏感信息）
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        language: user.language,
        preferences: user.preferences,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };

      // 继续处理下一个中间件
      next();

    } catch (jwtError: any) {
      // 处理不同类型的JWT错误
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: '认证令牌已过期，请重新登录',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌',
          code: 'INVALID_TOKEN'
        });
        return;
      }
      
      if (jwtError.name === 'NotBeforeError') {
        res.status(401).json({
          success: false,
          message: '认证令牌尚未生效',
          code: 'TOKEN_NOT_ACTIVE'
        });
        return;
      }

      // 其他JWT相关错误
      console.error('JWT验证错误:', jwtError);
      res.status(401).json({
        success: false,
        message: '认证令牌验证失败',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
      return;
    }

  } catch (error: any) {
    // 记录详细错误信息
    console.error('认证中间件错误:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      success: false,
      message: '服务器内部错误，请稍后重试',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
};

// 可选认证中间件（用于可选的认证端点）
const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 没有token，继续处理但不设置user
      next();
      return;
    }

    // 有token，尝试验证
    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const { User } = await initializeModels();
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user.getPublicProfile();
      }
    } catch (error) {
      // 忽略token错误，继续处理
    }

    next();
  } catch (error) {
    // 忽略所有错误，继续处理
    next();
  }
};

export { authMiddleware, optionalAuthMiddleware };
export default authMiddleware;