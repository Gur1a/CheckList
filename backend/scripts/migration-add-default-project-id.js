const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const mysql = require('mysql2/promise');
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'thunder',
  password: process.env.DB_PASSWORD || 'gdlsd030312',
  database: 'todolist',
  multipleStatements: true // 允许执行多条SQL语句
};


async function runMigration() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查users表是否已经有defaultProjectId字段
    const [rows] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'todolist' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'defaultProjectId'
    `);
    
    if (rows.length === 0) {
      // 如果字段不存在，添加它
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN defaultProjectId INT NULL,
        ADD CONSTRAINT fk_users_default_project 
        FOREIGN KEY (defaultProjectId) 
        REFERENCES projects(id) 
        ON DELETE SET NULL;
      `);
      console.log('✅ 成功添加defaultProjectId字段到users表');
    } else {
      console.log('✅ defaultProjectId字段已存在，无需重复添加');
    }
    
    // 为现有用户创建并分配默认的收集箱项目
    // 这里仅为演示，实际生产环境可能需要更复杂的逻辑
    console.log('ℹ️ 注意：此脚本不会为现有用户自动创建收集箱项目，这需要额外的业务逻辑');
    
    // 关闭连接
    await connection.end();
    console.log('✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    
    // 关闭连接
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

// 执行迁移
runMigration();