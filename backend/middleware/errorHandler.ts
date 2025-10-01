import { Request, Response, NextFunction } from 'express';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 处理Sequelize验证错误
const handleSequelizeValidationError = (err: any): AppError => {
  const errors = err.errors?.map((error: any) => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));

  const message = errors?.length > 0 ? errors[0].message : '数据验证失败';
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

// 处理Sequelize唯一性约束错误
const handleSequelizeUniqueError = (err: any): AppError => {
  const field = err.errors?.[0]?.path || 'unknown';
  const value = err.errors?.[0]?.value || 'unknown';
  
  let message = '数据已存在';
  if (field === 'email') {
    message = '邮箱已被注册';
  } else if (field === 'username') {
    message = '用户名已被占用';
  }

  return new AppError(message, 400, 'DUPLICATE_ERROR');
};

// 处理Sequelize外键约束错误
const handleSequelizeForeignKeyError = (err: any): AppError => {
  return new AppError('关联数据不存在', 400, 'FOREIGN_KEY_ERROR');
};

// 处理JWT错误
const handleJWTError = (): AppError => {
  return new AppError('无效的认证令牌', 401, 'INVALID_TOKEN');
};

// 处理JWT过期错误
const handleJWTExpiredError = (): AppError => {
  return new AppError('认证令牌已过期，请重新登录', 401, 'TOKEN_EXPIRED');
};

// 发送开发环境错误响应
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

// 发送生产环境错误响应
const sendErrorProd = (err: AppError, res: Response): void => {
  // 操作性错误：发送给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  } else {
    // 编程错误：不泄露详细信息
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// 错误处理中间件
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    error = handleSequelizeValidationError(err);
  }

  // Sequelize 唯一性约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    error = handleSequelizeUniqueError(err);
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = handleSequelizeForeignKeyError(err);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // 如果不是AppError实例，创建一个
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || '服务器内部错误';
    error = new AppError(message, statusCode, error.code);
  }

  // 根据环境发送错误响应
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 异步错误捕获包装器
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// 404错误处理器
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = new AppError(`接口 ${req.originalUrl} 不存在`, 404, 'NOT_FOUND');
  next(err);
};

export { errorHandler };
export default errorHandler;