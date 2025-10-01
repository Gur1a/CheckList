# RESTful API 设计规范

## 1. 资源路径与 HTTP 方法

### 任务资源 (Tasks)
```
GET    /api/tasks        # 获取任务列表
POST   /api/tasks        # 创建新任务
GET    /api/tasks/:id    # 获取特定任务
PUT    /api/tasks/:id    # 更新特定任务
DELETE /api/tasks/:id    # 删除特定任务
```

### 项目资源 (Projects)
```
GET    /api/projects        # 获取项目列表
POST   /api/projects        # 创建新项目
GET    /api/projects/:id    # 获取特定项目
PUT    /api/projects/:id    # 更新特定项目
DELETE /api/projects/:id    # 删除特定项目
```

### 用户资源 (Users)
```
GET    /api/users        # 获取用户列表
POST   /api/users        # 创建新用户
GET    /api/users/:id    # 获取特定用户
PUT    /api/users/:id    # 更新特定用户
DELETE /api/users/:id    # 删除特定用户
```

## 2. Express.js 路由实现示例

```javascript
// routes/tasks.ts
import express from 'express';
const router = express.Router();

// GET /api/tasks - 获取任务列表
router.get('/', async (req, res) => {
  try {
    // 获取任务列表逻辑
    const tasks = await Task.findAll();
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取任务列表失败'
    });
  }
});

// POST /api/tasks - 创建新任务
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // 创建任务逻辑
    const task = await Task.create({
      title,
      description
    });
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '创建任务失败'
    });
  }
});

// GET /api/tasks/:id - 获取特定任务
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取任务失败'
    });
  }
});

// PUT /api/tasks/:id - 更新特定任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    // 更新任务逻辑
    await task.update({
      title,
      description
    });
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新任务失败'
    });
  }
});

// DELETE /api/tasks/:id - 删除特定任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    // 删除任务逻辑
    await task.destroy();
    
    res.json({
      success: true,
      message: '任务删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除任务失败'
    });
  }
});

export default router;
```

## 3. 前端 API 客户端使用示例

```typescript
// utils/apiClient.ts
class ApiClient {
  // 获取任务列表
  async getTasks() {
    const response = await this.request('/tasks', {
      method: 'GET'
    });
    return response.data;
  }

  // 创建新任务
  async createTask(taskData: { title: string; description?: string }) {
    const response = await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    return response.data;
  }

  // 获取特定任务
  async getTask(id: number) {
    const response = await this.request(`/tasks/${id}`, {
      method: 'GET'
    });
    return response.data;
  }

  // 更新任务
  async updateTask(id: number, taskData: Partial<{ title: string; description?: string }>) {
    const response = await this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
    return response.data;
  }

  // 删除任务
  async deleteTask(id: number) {
    const response = await this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }
}
```

## 4. 为什么不会冲突？

### HTTP 方法区分
1. **GET** `/tasks` - 浏览器和客户端发送 GET 请求时，路由匹配到获取列表的处理函数
2. **POST** `/tasks` - 客户端发送 POST 请求时，路由匹配到创建资源的处理函数

### Express.js 路由匹配机制
```javascript
// Express.js 会根据 HTTP 方法匹配对应的处理函数
app.get('/tasks', getTasksHandler);     // 处理 GET 请求
app.post('/tasks', createTaskHandler);  // 处理 POST 请求
app.put('/tasks/:id', updateTaskHandler);  // 处理 PUT 请求
app.delete('/tasks/:id', deleteTaskHandler);  // 处理 DELETE 请求
```

### 实际请求示例
```
# 获取任务列表
GET /api/tasks HTTP/1.1
Host: localhost:3000

# 创建新任务
POST /api/tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "新任务",
  "description": "任务描述"
}
```

## 5. 最佳实践

### 1. 统一的响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE"
}
```

### 2. 合理的 HTTP 状态码
- 200 - 成功获取资源
- 201 - 成功创建资源
- 400 - 客户端请求错误
- 401 - 未认证
- 403 - 无权限
- 404 - 资源不存在
- 500 - 服务器内部错误

### 3. 路径设计一致性
```
✅ 推荐：
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/123

❌ 不推荐：
GET    /api/tasks/list
POST   /api/tasks/create
GET    /api/tasks/get/123
```

通过这种方式，RESTful API 能够清晰地区分不同的操作，同时保持 URL 路径的简洁和一致性。