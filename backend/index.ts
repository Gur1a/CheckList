#!/usr/bin/env node

/**
 * TodoList Backend Service
 * 主入口文件 - 负责启动和管理后端服务
 */

import dotenv from 'dotenv';
import { log } from './middleware/logger';

// 优先加载环境变量
dotenv.config();

// 验证必要的环境变量
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ 缺少必要的环境变量:', missingEnvVars.join(', '));
  console.error('💡 请检查 .env 文件是否正确配置');
  process.exit(1);
}

// 设置未捕获异常处理
process.on('uncaughtException', (error: Error) => {
  log.error('💥 未捕获的异常:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  log.error('💥 未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// 启动应用服务器
async function startApplication(): Promise<void> {
  try {
    log.info('🚀 正在启动 TodoList Backend Service...');
    
    // 动态导入服务器模块
    const serverModule = await import('./server');
    
    log.info('✅ TodoList Backend Service 启动成功');
    
  } catch (error: any) {
    log.error('❌ 启动应用失败:', error);
    console.error('详细错误:', error.stack);
    process.exit(1);
  }
}

// 启动应用
startApplication();

export default startApplication;