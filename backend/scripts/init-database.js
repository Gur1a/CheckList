const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'thunder',
  password: process.env.DB_PASSWORD || 'gdlsd030312',
  database: 'todolist',
  multipleStatements: true // 允许执行多条SQL语句
};

// 读取SQL文件
const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_tables.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

async function initDatabase() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 执行SQL语句
    await connection.query(sql);
    console.log('✅ 数据库表创建成功');
    
    // 关闭连接
    await connection.end();
    console.log('✅ 数据库连接已关闭');
    
  } catch (error) {
    console.log(process.env.DB_USER)
    console.error('❌ 数据库初始化失败:', error.message);
    
    // 关闭连接
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

// 执行数据库初始化
initDatabase();