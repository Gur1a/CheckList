# 后端架构说明

## 目录结构

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

## 架构层次说明

### 1. 路由层 (Routes)
- 职责：URL映射到控制器方法
- 位置：[routes/](file:///e:/AAA-CODE/ToDoListSys/backend/routes)
- 特点：只负责请求路由，不包含业务逻辑

### 2. 控制器层 (Controllers)
- 职责：处理HTTP请求和响应
- 位置：[controllers/](file:///e:/AAA-CODE/ToDoListSys/backend/controllers)
- 特点：
  - 接收HTTP请求参数
  - 调用服务层处理业务逻辑
  - 返回HTTP响应

### 3. 服务层 (Services)
- 职责：核心业务逻辑处理
- 位置：[services/](file:///e:/AAA-CODE/ToDoListSys/backend/services)
- 特点：
  - 实现业务规则
  - 调用Repository进行数据访问
  - 处理复杂业务逻辑

### 4. 数据访问层 (Repositories)
- 职责：与数据库交互
- 位置：[repositories/](file:///e:/AAA-CODE/ToDoListSys/backend/repositories)
- 特点：
  - 封装数据库操作
  - 提供统一的数据访问接口
  - 与具体ORM解耦

### 5. 模型层 (Models)
- 职责：数据模型定义
- 位置：[models/](file:///e:/AAA-CODE/ToDoListSys/backend/models)
- 特点：
  - 定义数据结构
  - 定义数据关系
  - 定义数据验证规则

## 数据流向

```
Client → Routes → Controllers → Services → Repositories → Models → Database
                                            ↑
                                            ↓
Client ← Routes ← Controllers ← Services ← Repositories ← Models ← Database
```

## 优势

1. **关注点分离**：各层职责明确，降低耦合度
2. **可测试性**：每层都可以独立测试
3. **可维护性**：修改某层不影响其他层
4. **可复用性**：服务和Repository可以在不同控制器中复用
5. **团队协作**：不同开发者可以并行开发不同层

## 示例调用链

### 用户登录示例：
1. **路由层**：`POST /api/auth/login` 映射到 `AuthController.login`
2. **控制器层**：`AuthController.login` 接收请求参数，调用 `AuthService.login`
3. **服务层**：`AuthService.login` 处理登录逻辑，调用 `UserRepository.findByEmail`
4. **数据访问层**：`UserRepository.findByEmail` 查询数据库
5. **模型层**：`User` 模型定义用户数据结构
6. **响应返回**：逐层返回响应结果