# 数据库SQL脚本说明

## 目录结构

```
sql/
├── create_tables.sql      # 数据库表结构创建脚本
├── user_operations.sql    # 用户相关操作SQL
├── project_operations.sql # 项目相关操作SQL
├── task_operations.sql    # 任务相关操作SQL
├── board_operations.sql   # 看板相关操作SQL
├── history_operations.sql # 历史记录相关操作SQL
└── README.md             # 本说明文件
```

## 文件说明

### [create_tables.sql](create_tables.sql)
创建数据库和所有表结构的SQL脚本，包含以下表：
- users (用户表)
- projects (项目表)
- boards (看板表)
- tasks (任务表)
- histories (历史记录表)

### [user_operations.sql](user_operations.sql)
用户认证和管理相关的数据库操作SQL，包括：
- 用户注册
- 用户登录
- 用户信息更新
- 密码修改
- 用户状态管理

### [project_operations.sql](project_operations.sql)
项目管理相关的数据库操作SQL，包括：
- 项目创建
- 项目查询
- 项目更新
- 项目归档
- 项目成员管理

### [task_operations.sql](task_operations.sql)
任务管理相关的数据库操作SQL，包括：
- 任务创建
- 任务查询
- 任务更新
- 任务状态变更
- 任务分配
- 任务评论和子任务管理

### [board_operations.sql](board_operations.sql)
看板管理相关的数据库操作SQL，包括：
- 看板创建
- 看板查询
- 看板更新
- 看板顺序调整
- 默认看板设置

### [history_operations.sql](history_operations.sql)
历史记录相关的数据库操作SQL，包括：
- 历史记录创建
- 历史记录查询
- 活动报告生成
- 用户活动统计

## 使用方法

### 1. 初始化数据库
```sql
-- 执行表结构创建脚本
source sql/create_tables.sql
```

### 2. 在应用中使用操作SQL
这些SQL语句使用了参数化查询（?占位符），可以在应用代码中通过数据库驱动程序进行参数绑定。

例如在Node.js中使用mysql2库：
```javascript
const [rows] = await connection.execute(
  'SELECT id, username, email FROM users WHERE email = ?',
  [email]
);
```

## 注意事项

1. 所有SQL语句都使用参数化查询防止SQL注入
2. 表结构设计考虑了索引优化查询性能
3. 外键约束确保数据一致性
4. 时间字段自动更新时间戳
5. JSON字段用于存储复杂结构数据