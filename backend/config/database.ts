import { Sequelize } from 'sequelize';
import { log } from '../middleware/logger';

let sequelize: Sequelize;

const initializeDatabase = async (): Promise<Sequelize> => {
  if (!sequelize) {
    // 验证环境变量
    if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
      throw new Error('数据库配置缺失：请检查 DB_NAME, DB_USER, DB_PASSWORD 环境变量');
    }

    // MySQL 连接配置
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        timezone: '+08:00',
        define: {
          timestamps: true,
          underscored: false,
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci'
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? 
          (sql: string) => log.debug(`SQL: ${sql}`) : false,
        dialectOptions: {
          charset: 'utf8mb4',
          dateStrings: true,
          typeCast: true
        },
        retry: {
          match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /ER_LOCK_WAIT_TIMEOUT/,
            /ER_LOCK_DEADLOCK/,
            /ER_QUERY_INTERRUPTED/
          ],
          max: 3
        }
      }
    );

    try {
      // 测试数据库连接
      await sequelize.authenticate();
      log.info('📦 MySQL数据库连接成功', {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      });

      // 在开发环境下同步数据库结构
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        log.info('📦 数据库表结构同步完成');
      }
      
    } catch (error: any) {
      log.error('❌ 数据库连接失败', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💡 请确保MySQL服务已启动，并创建了相应的数据库');
        console.log(`💡 可以使用以下SQL命令创建数据库:`);
        console.log(`   CREATE DATABASE \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log('💡 确保数据库用户有足够的权限访问数据库');
      }
      
      throw error;
    }
  }

  return sequelize;
};

const connectDatabase = async (): Promise<void> => {
  try {
    await initializeDatabase();
    log.info('数据库初始化完成');
  } catch (error) {
    log.error('数据库初始化失败', error);
    throw error;
  }
};

const getDatabase = (): Sequelize => {
  if (!sequelize) {
    throw new Error('数据库未初始化，请先调用 initializeDatabase()');
  }
  return sequelize;
};

const closeDatabase = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    log.info('数据库连接已关闭');
  }
};

export { initializeDatabase, connectDatabase, getDatabase, closeDatabase };
export default sequelize;