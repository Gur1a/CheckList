#!/usr/bin/env node

/**
 * 开发环境启动脚本 (TypeScript版本)
 * 用于开发环境下的服务器启动和管理
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

interface ProcessManager {
  serverProcess: ChildProcess | null;
  isShuttingDown: boolean;
}

class DevServerManager {
  private processManager: ProcessManager = {
    serverProcess: null,
    isShuttingDown: false
  };

  constructor() {
    this.setupSignalHandlers();
  }

  /**
   * 检查环境配置
   */
  private checkEnvironment(): boolean {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env 文件不存在');
      console.log('💡 请复制 .env.example 并重命名为 .env，然后配置相应的环境变量');
      return false;
    }

    return true;
  }

  /**
   * 启动开发服务器
   */
  public async startDevServer(): Promise<void> {
    if (!this.checkEnvironment()) {
      process.exit(1);
    }

    console.log('🚀 启动 TodoList 后端开发服务器...\n');
    console.log('📋 环境信息:');
    console.log(`   • Node.js: ${process.version}`);
    console.log(`   • 工作目录: ${__dirname}`);
    console.log(`   • 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log('');

    try {
      // 启动开发服务器
      this.processManager.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'development',
          FORCE_COLOR: '1' // 启用彩色输出
        }
      });

      // 处理服务器进程事件
      this.processManager.serverProcess.on('close', (code) => {
        if (!this.processManager.isShuttingDown) {
          if (code === 0) {
            console.log('\n✅ 服务器正常退出');
          } else {
            console.log(`\n❌ 服务器异常退出，退出码: ${code}`);
            console.log('💡 请检查上面的错误信息并修复后重试');
          }
        }
      });

      this.processManager.serverProcess.on('error', (error) => {
        console.error('❌ 启动服务器时出错:', error.message);
        console.log('💡 请确保已安装所有依赖: npm install');
      });

      // 启动成功提示
      console.log('🎯 开发服务器启动中...');
      console.log('💡 按 Ctrl+C 可停止服务器');
      console.log('📚 API文档: http://localhost:5000/api');
      console.log('🔍 健康检查: http://localhost:5000/api/health');
      console.log('');

    } catch (error: any) {
      console.error('❌ 启动失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 优雅关闭服务器
   */
  private async shutdownServer(signal: string): Promise<void> {
    if (this.processManager.isShuttingDown) {
      return;
    }

    this.processManager.isShuttingDown = true;
    console.log(`\n🛑 收到 ${signal} 信号，正在优雅关闭服务器...`);

    if (this.processManager.serverProcess) {
      // 尝试优雅关闭
      this.processManager.serverProcess.kill('SIGTERM');

      // 设置强制关闭超时
      const forceShutdownTimeout = setTimeout(() => {
        console.log('⚠️  强制关闭服务器进程...');
        if (this.processManager.serverProcess) {
          this.processManager.serverProcess.kill('SIGKILL');
        }
        process.exit(1);
      }, 10000);

      // 等待进程正常关闭
      this.processManager.serverProcess.on('close', () => {
        clearTimeout(forceShutdownTimeout);
        console.log('✅ 服务器已关闭');
        process.exit(0);
      });
    } else {
      console.log('✅ 没有运行中的服务器进程');
      process.exit(0);
    }
  }

  /**
   * 设置信号处理器
   */
  private setupSignalHandlers(): void {
    // 处理 Ctrl+C
    process.on('SIGINT', () => this.shutdownServer('SIGINT'));
    
    // 处理终止信号
    process.on('SIGTERM', () => this.shutdownServer('SIGTERM'));

    // 处理 Windows 下的关闭事件
    if (process.platform === 'win32') {
      process.on('SIGBREAK', () => this.shutdownServer('SIGBREAK'));
    }
  }

  /**
   * 显示帮助信息
   */
  public static showHelp(): void {
    console.log('TodoList 后端开发服务器');
    console.log('');
    console.log('用法:');
    console.log('  npm run dev     # 启动开发服务器');
    console.log('  npm run build   # 构建生产版本');
    console.log('  npm start       # 启动生产服务器');
    console.log('');
    console.log('环境变量:');
    console.log('  NODE_ENV=development  # 开发环境');
    console.log('  PORT=5000            # 服务器端口');
    console.log('  DB_HOST=localhost    # 数据库主机');
    console.log('  DB_PORT=3306         # 数据库端口');
    console.log('  DB_NAME=todolist_sys # 数据库名称');
    console.log('');
  }
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    DevServerManager.showHelp();
    return;
  }

  const devServer = new DevServerManager();
  await devServer.startDevServer();
}

// 只有在直接运行此脚本时才执行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

export { DevServerManager };
export default main;