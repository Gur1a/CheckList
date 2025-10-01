# Sequelize 在项目中的应用

## 项目中的 Sequelize 配置

在我们的 TodoList 项目中，Sequelize 被用作主要的 ORM 工具来管理 MySQL 数据库。以下是项目中 Sequelize 的配置和使用方式：

## 1. 数据库连接配置

### 配置文件
```typescript
// config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
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
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);
```

## 2. 模型定义示例

### 用户模型
```typescript
// models/User.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  // ... 其他属性
}

const initUserModel = (sequelize: Sequelize) => {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
    // ... 其他字段定义
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true
  });

  return User;
};
```

## 3. 模型关联配置

```typescript
// models/index.ts
const initializeModels = async () => {
  // 初始化数据库连接
  sequelize = await initializeDatabase();

  // 初始化所有模型
  const User = initUserModel(sequelize);
  const Project = initProjectModel(sequelize);
  const Task = initTaskModel(sequelize);
  // ... 其他模型

  // 设置模型关联关系
  User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
  Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  
  Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Task.belongsTo(User, { foreignKey: 'assignee', as: 'assignedUser' });
  Task.belongsTo(Project, { foreignKey: 'project', as: 'projectInfo' });
  
  Project.hasMany(Task, { foreignKey: 'project', as: 'tasks' });
  
  // ... 其他关联关系

  return {
    User,
    Project,
    Task,
    // ... 其他模型
    sequelize
  };
};
```

## 4. Repository 层中的 Sequelize 使用

### 用户 Repository
```typescript
// repositories/UserRepository.ts
export class UserRepository {
  // 根据邮箱或用户名查找用户
  async findByEmailOrUsername(email: string, username: string) {
    const { User } = await initializeModels();
    
    return await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });
  }

  // 根据邮箱查找用户
  async findByEmail(email: string) {
    const { User } = await initializeModels();
    
    return await User.findOne({
      where: { email }
    });
  }

  // 创建用户
  async create(userData: { username: string; email: string; password: string }) {
    const { User } = await initializeModels();
    
    return await User.create(userData);
  }
}
```

## 5. 服务层中的 Sequelize 使用

```typescript
// services/AuthService.ts
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(username: string, email: string, password: string) {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findByEmailOrUsername(email, username);

    if (existingUser) {
      // 处理重复用户逻辑
    }

    // 创建新用户
    const user = await this.userRepository.create({ username, email, password });
    
    return user;
  }
}
```

## 6. Sequelize 的优势在项目中的体现

### 1. 避免手写 SQL
```typescript
// 使用 Sequelize（无需手写 SQL）
const user = await User.findOne({
  where: {
    [Op.or]: [
      { email: 'test@example.com' },
      { username: 'testuser' }
    ]
  }
});

// 等价的原始 SQL（Sequelize 自动生成）
// SELECT * FROM users WHERE (email = 'test@example.com' OR username = 'testuser') LIMIT 1;
```

### 2. 类型安全
```typescript
// TypeScript 类型检查
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
}

// 模型方法具有完整的类型支持
const user: User = await User.findByPk(1);
// user.username 是 string 类型，有完整的智能提示
```

### 3. 防止 SQL 注入
```typescript
// Sequelize 自动处理参数绑定，防止 SQL 注入
const user = await User.findOne({
  where: {
    email: userInputEmail  // 安全的参数绑定
  }
});
```

### 4. 数据库无关性
```typescript
// 只需修改配置即可切换数据库
const sequelize = new Sequelize({
  // dialect: 'mysql',     // MySQL
  // dialect: 'postgres',  // PostgreSQL
  // dialect: 'sqlite',    // SQLite
  // dialect: 'mssql',     // Microsoft SQL Server
});
```

## 7. 项目中的最佳实践

### 1. 模型分层
```
models/           # 数据模型定义
repositories/     # 数据访问层（封装 Sequelize 操作）
services/         # 业务逻辑层（调用 repositories）
controllers/      # 控制器层（处理 HTTP 请求）
```

### 2. 错误处理
```typescript
try {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('用户不存在', 404);
  }
  // 处理用户数据
} catch (error) {
  if (error instanceof sequelize.ValidationError) {
    // 处理 Sequelize 验证错误
  } else if (error instanceof sequelize.DatabaseError) {
    // 处理数据库错误
  }
  throw error;
}
```

### 3. 事务处理
```typescript
const transaction = await sequelize.transaction();
try {
  const user = await User.create(userData, { transaction });
  const profile = await Profile.create(profileData, { transaction });
  await transaction.commit();
  return { user, profile };
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## 8. 性能优化建议

### 1. 合理使用索引
```typescript
User.init({
  email: {
    type: DataTypes.STRING,
    unique: true  // 自动创建索引
  }
}, {
  indexes: [
    {
      fields: ['createdAt']  // 手动创建索引
    }
  ]
});
```

### 2. 避免 N+1 查询
```typescript
// 错误的做法（N+1 查询）
const users = await User.findAll();
for (const user of users) {
  const projects = await user.getProjects();  // 每次都查询数据库
}

// 正确的做法（预加载）
const users = await User.findAll({
  include: [Project]  // 一次性加载所有关联数据
});
```

### 3. 分页查询
```typescript
const { rows, count } = await User.findAndCountAll({
  limit: 10,
  offset: 0,
  order: [['createdAt', 'DESC']]
});
```

通过使用 Sequelize，我们能够以更安全、更高效、更易维护的方式操作数据库，同时享受 TypeScript 带来的类型安全和开发体验提升。