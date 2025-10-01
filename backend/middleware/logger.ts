import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// 日志级别枚举
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 日志接口
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  userId?: number;
  error?: string;
}

// 创建日志目录
const ensureLogDirectory = (): void => {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

// 写入日志文件
const writeLogToFile = (logEntry: LogEntry): void => {
  try {
    ensureLogDirectory();
    
    const logDir = path.join(process.cwd(), 'logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `app-${today}.log`);
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    console.error('写入日志文件失败:', error);
  }
};

// 格式化控制台输出
const formatConsoleLog = (logEntry: LogEntry): string => {
  const { timestamp, level, method, url, ip, statusCode, responseTime, userId } = logEntry;
  
  // 根据状态码设置颜色
  let statusColor = '';
  if (statusCode) {
    if (statusCode >= 200 && statusCode < 300) {
      statusColor = '\x1b[32m'; // 绿色
    } else if (statusCode >= 300 && statusCode < 400) {
      statusColor = '\x1b[33m'; // 黄色
    } else if (statusCode >= 400) {
      statusColor = '\x1b[31m'; // 红色
    }
  }

  const resetColor = '\x1b[0m';
  const timeColor = '\x1b[90m'; // 灰色
  const methodColor = '\x1b[36m'; // 青色

  let logMessage = `${timeColor}[${timestamp}]${resetColor} `;
  logMessage += `${methodColor}${method}${resetColor} `;
  logMessage += `${url} `;
  logMessage += `${timeColor}${ip}${resetColor}`;
  
  if (statusCode && responseTime !== undefined) {
    logMessage += ` ${statusColor}${statusCode}${resetColor}`;
    logMessage += ` ${timeColor}${responseTime}ms${resetColor}`;
  }
  
  if (userId) {
    logMessage += ` ${timeColor}User:${userId}${resetColor}`;
  }

  return logMessage;
};

// 请求日志中间件
const logger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 记录请求开始
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent')
  };

  // 监听响应结束事件
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // 更新日志条目
    logEntry.statusCode = res.statusCode;
    logEntry.responseTime = responseTime;
    
    // 如果请求包含用户信息，添加用户ID
    if (req.user && req.user.id) {
      logEntry.userId = req.user.id;
    }

    // 根据状态码设置日志级别
    if (res.statusCode >= 400) {
      logEntry.level = LogLevel.ERROR;
    } else if (res.statusCode >= 300) {
      logEntry.level = LogLevel.WARN;
    }

    // 输出到控制台
    if (process.env.NODE_ENV !== 'test') {
      console.log(formatConsoleLog(logEntry));
    }

    // 写入日志文件
    if (process.env.LOG_FILE !== 'false') {
      writeLogToFile(logEntry);
    }
  });

  // 监听错误事件
  res.on('error', (error) => {
    logEntry.level = LogLevel.ERROR;
    logEntry.error = error.message;
    
    console.error('响应错误:', formatConsoleLog(logEntry));
    
    if (process.env.LOG_FILE !== 'false') {
      writeLogToFile(logEntry);
    }
  });

  next();
};

// 自定义日志函数
export const log = {
  info: (message: string, meta?: any): void => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      method: '',
      url: '',
      ip: '',
      error: message
    };

    console.log(`\x1b[90m[${logEntry.timestamp}]\x1b[0m \x1b[36mINFO\x1b[0m ${message}`);
    
    if (meta) {
      console.log('Meta:', meta);
      logEntry.error = `${message} ${JSON.stringify(meta)}`;
    }

    if (process.env.LOG_FILE !== 'false') {
      writeLogToFile(logEntry);
    }
  },

  warn: (message: string, meta?: any): void => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      method: '',
      url: '',
      ip: '',
      error: message
    };

    console.warn(`\x1b[90m[${logEntry.timestamp}]\x1b[0m \x1b[33mWARN\x1b[0m ${message}`);
    
    if (meta) {
      console.warn('Meta:', meta);
      logEntry.error = `${message} ${JSON.stringify(meta)}`;
    }

    if (process.env.LOG_FILE !== 'false') {
      writeLogToFile(logEntry);
    }
  },

  error: (message: string, error?: Error | any): void => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      method: '',
      url: '',
      ip: '',
      error: message
    };

    console.error(`\x1b[90m[${logEntry.timestamp}]\x1b[0m \x1b[31mERROR\x1b[0m ${message}`);
    
    if (error) {
      console.error('Error:', error);
      logEntry.error = `${message} ${error.message || JSON.stringify(error)}`;
    }

    if (process.env.LOG_FILE !== 'false') {
      writeLogToFile(logEntry);
    }
  },

  debug: (message: string, meta?: any): void => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        method: '',
        url: '',
        ip: '',
        error: message
      };

      console.log(`\x1b[90m[${logEntry.timestamp}]\x1b[0m \x1b[35mDEBUG\x1b[0m ${message}`);
      
      if (meta) {
        console.log('Meta:', meta);
        logEntry.error = `${message} ${JSON.stringify(meta)}`;
      }

      if (process.env.LOG_FILE !== 'false') {
        writeLogToFile(logEntry);
      }
    }
  }
};

export { LogLevel, LogEntry };
export default logger;