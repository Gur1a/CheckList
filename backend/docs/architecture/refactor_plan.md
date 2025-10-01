# 后端架构重构计划

## 当前架构问题分析

### 现有结构
```
backend/
├── config/
├── middleware/
├── models/
├── routes/
├── server.ts
└── index.ts
```

### 存在问题
1. 路由文件承担过多职责（控制器+部分业务逻辑）
2. 缺乏独立的数据访问层（Repository）
3. 业务逻辑与HTTP处理耦合
4. 代码复用性和可测试性差

## 目标架构

```
backend/
├── config/           # 配置文件
├── middleware/       # 中间件
├── controllers/      # 控制器层
├── repositories/     # 数据访问层
├── models/           # 数据模型定义
├── routes/           # 路由定义
├── services/         # 业务逻辑层
├── utils/            # 工具函数
├── server.ts         # 服务器启动
└── index.ts          # 入口文件
```

## 重构步骤

### 第一步：创建控制器层
1. 创建 [controllers/](file:///e:/AAA-CODE/ToDoListSys/backend/controllers) 目录
2. 将路由中的业务逻辑迁移到控制器
3. 控制器只处理HTTP请求/响应和调用服务层

### 第二步：创建Repository层
1. 创建 [repositories/](file:///e:/AAA-CODE/ToDoListSys/backend/repositories) 目录
2. 将数据访问逻辑从控制器迁移到Repository
3. Repository只负责与数据库交互

### 第三步：创建服务层
1. 创建 [services/](file:///e:/AAA-CODE/ToDoListSys/backend/services) 目录
2. 将核心业务逻辑迁移到服务层
3. 服务层调用Repository并处理业务规则

### 第四步：更新路由层
1. 路由只负责URL映射到控制器
2. 路由中不包含业务逻辑

## 具体实现示例

### 重构前（routes/auth.ts）：
```typescript
router.post('/login', catchAsync(async (req: Request, res: Response) => {
  // 验证逻辑
  // 查询用户
  // 密码验证
  // 生成token
  // 返回响应
}));
```

### 重构后：

**routes/auth.ts**:
```typescript
import { AuthController } from '../controllers/AuthController';

const authController = new AuthController();

router.post('/login', authController.login);
```

**controllers/AuthController.ts**:
```typescript
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.json(result);
  });
}
```

**services/AuthService.ts**:
```typescript
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(email: string, password: string) {
    // 业务逻辑
    const user = await this.userRepository.findByEmail(email);
    // 密码验证
    // token生成
    return { token, user };
  }
}
```

**repositories/UserRepository.ts**:
```typescript
import { User } from '../models/User';

export class UserRepository {
  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }
}
```

## 重构优势

1. **关注点分离**：各层职责明确
2. **可测试性**：每层都可以独立测试
3. **可维护性**：修改某层不影响其他层
4. **可复用性**：服务和Repository可以在不同控制器中复用
5. **团队协作**：不同开发者可以并行开发不同层