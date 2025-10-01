# Sequelize 常用 API 速查表

## 1. 模型定义

```javascript
// 定义模型
const User = sequelize.define('User', {
  // 属性定义
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // 模型选项
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    }
  ]
});
```

## 2. 数据查询

### 基本查询
```javascript
// 查找所有记录
const users = await User.findAll();

// 根据条件查找
const user = await User.findOne({
  where: {
    email: 'test@example.com'
  }
});

// 根据主键查找
const user = await User.findByPk(1);

// 查找并计数
const { count, rows } = await User.findAndCountAll({
  where: {
    isActive: true
  },
  limit: 10,
  offset: 0
});
```

### 条件查询
```javascript
// 复杂条件查询
const users = await User.findAll({
  where: {
    [Op.and]: [
      { isActive: true },
      {
        [Op.or]: [
          { username: { [Op.like]: '%john%' } },
          { email: { [Op.like]: '%example.com' } }
        ]
      }
    ]
  }
});
```

## 3. 数据创建和更新

### 创建数据
```javascript
// 创建单条记录
const user = await User.create({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'hashed_password'
});

// 批量创建
const users = await User.bulkCreate([
  { username: 'user1', email: 'user1@example.com', password: 'hashed_password' },
  { username: 'user2', email: 'user2@example.com', password: 'hashed_password' }
]);
```

### 更新数据
```javascript
// 更新单条记录
const [numberOfAffectedRows] = await User.update({
  email: 'newemail@example.com'
}, {
  where: {
    id: 1
  }
});

// 更新实例
const user = await User.findByPk(1);
if (user) {
  user.email = 'newemail@example.com';
  await user.save();
}
```

## 4. 数据删除

```javascript
// 软删除（需要在模型中配置 paranoid: true）
await User.destroy({
  where: {
    id: 1
  }
});

// 永久删除
await User.destroy({
  where: {
    id: 1
  },
  force: true
});
```

## 5. 关联关系

### 定义关联
```javascript
// 一对一
User.hasOne(Profile);
Profile.belongsTo(User);

// 一对多
User.hasMany(Task);
Task.belongsTo(User);

// 多对多
User.belongsToMany(Project, { through: 'UserProjects' });
Project.belongsToMany(User, { through: 'UserProjects' });
```

### 查询关联数据
```javascript
// 包含关联数据
const user = await User.findByPk(1, {
  include: [{
    model: Task,
    where: { status: 'completed' }
  }]
});

// 预加载关联
const users = await User.findAll({
  include: [Profile, Task]
});
```

## 6. 事务处理

```javascript
const transaction = await sequelize.transaction();

try {
  const user = await User.create({
    username: 'john_doe',
    email: 'john@example.com'
  }, { transaction });

  await Profile.create({
    userId: user.id,
    bio: 'Hello World'
  }, { transaction });

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## 7. 原始查询

```javascript
// 执行原始 SQL 查询
const [results, metadata] = await sequelize.query(
  'SELECT * FROM users WHERE active = ?',
  {
    replacements: [true],
    type: QueryTypes.SELECT
  }
);

// 执行原始 SQL 命令
await sequelize.query(
  'UPDATE users SET last_login = NOW() WHERE id = ?',
  {
    replacements: [1],
    type: QueryTypes.UPDATE
  }
);
```

## 8. 验证和钩子

```javascript
// 模型验证
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  }
}, {
  hooks: {
    // 钩子函数
    beforeCreate: (user) => {
      user.createdAt = new Date();
    },
    afterCreate: (user) => {
      console.log('User created:', user.id);
    }
  }
});
```

## 9. 分页和排序

```javascript
const users = await User.findAll({
  limit: 10,
  offset: 0,
  order: [
    ['createdAt', 'DESC'],
    ['username', 'ASC']
  ]
});
```

## 10. 聚合查询

```javascript
// 计数
const count = await User.count({
  where: { isActive: true }
});

// 求和
const total = await Order.sum('amount', {
  where: { userId: 1 }
});

// 平均值
const average = await Product.average('price', {
  where: { category: 'electronics' }
});

// 最大值/最小值
const max = await User.max('age');
const min = await User.min('age');
```