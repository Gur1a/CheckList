# 任务管理 API 文档

## 基础路径
```
/api/tasks
```

## 任务接口

### 1. 获取任务列表
```
GET /api/tasks
```

**查询参数:**
- `page` (number): 页码，默认为1
- `limit` (number): 每页数量，默认为20
- `status` (string): 任务状态 (todo, in_progress, done, archived)
- `priority` (string): 任务优先级 (low, medium, high, urgent)
- `project` (number): 项目ID
- `assignee` (number): 分配人ID
- `createdBy` (number): 创建人ID
- `tags` (string[]): 标签数组
- `search` (string): 搜索关键词
- `dueDateFrom` (string): 截止日期起始 (ISO 8601格式)
- `dueDateTo` (string): 截止日期结束 (ISO 8601格式)
- `isOverdue` (boolean): 是否过期任务

**响应:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "任务标题",
        "description": "任务描述",
        "status": "todo",
        "priority": "medium",
        "dueDate": "2023-12-31T23:59:59.000Z",
        "startDate": "2023-12-01T00:00:00.000Z",
        "estimatedHours": 8,
        "actualHours": 0,
        "tags": ["重要", "紧急"],
        "assignee": 2,
        "project": 1,
        "order": 0,
        "subtasks": [],
        "attachments": [],
        "comments": [],
        "watchers": [1, 2],
        "dependencies": [],
        "customFields": [],
        "isRecurring": false,
        "createdBy": 1,
        "completedAt": null,
        "archivedAt": null,
        "createdAt": "2023-12-01T10:00:00.000Z",
        "updatedAt": "2023-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. 创建任务
```
POST /api/tasks
```

**请求体:**
```json
{
  "title": "新任务标题",
  "description": "任务描述",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "startDate": "2023-12-01T00:00:00.000Z",
  "estimatedHours": 8,
  "tags": ["重要", "紧急"],
  "assignee": 2,
  "project": 1,
  "order": 0,
  "dependencies": [],
  "customFields": [],
  "isRecurring": false,
  "createdBy": 1
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 2,
      "title": "新任务标题",
      "description": "任务描述",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "startDate": "2023-12-01T00:00:00.000Z",
      "estimatedHours": 8,
      "actualHours": 0,
      "tags": ["重要", "紧急"],
      "assignee": 2,
      "project": 1,
      "order": 0,
      "subtasks": [],
      "attachments": [],
      "comments": [],
      "watchers": [1],
      "dependencies": [],
      "customFields": [],
      "isRecurring": false,
      "createdBy": 1,
      "completedAt": null,
      "archivedAt": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  }
}
```

### 3. 获取单个任务
```
GET /api/tasks/:id
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "title": "任务标题",
      "description": "任务描述",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "startDate": "2023-12-01T00:00:00.000Z",
      "estimatedHours": 8,
      "actualHours": 0,
      "tags": ["重要", "紧急"],
      "assignee": 2,
      "project": 1,
      "order": 0,
      "subtasks": [],
      "attachments": [],
      "comments": [],
      "watchers": [1, 2],
      "dependencies": [],
      "customFields": [],
      "isRecurring": false,
      "createdBy": 1,
      "completedAt": null,
      "archivedAt": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  }
}
```

### 4. 更新任务
```
PUT /api/tasks/:id
```

**请求体:**
```json
{
  "title": "更新后的任务标题",
  "description": "更新后的任务描述",
  "status": "in_progress",
  "priority": "high"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "title": "更新后的任务标题",
      "description": "更新后的任务描述",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "startDate": "2023-12-01T00:00:00.000Z",
      "estimatedHours": 8,
      "actualHours": 0,
      "tags": ["重要", "紧急"],
      "assignee": 2,
      "project": 1,
      "order": 0,
      "subtasks": [],
      "attachments": [],
      "comments": [],
      "watchers": [1, 2],
      "dependencies": [],
      "customFields": [],
      "isRecurring": false,
      "createdBy": 1,
      "completedAt": null,
      "archivedAt": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T11:00:00.000Z"
    }
  }
}
```

### 5. 删除任务
```
DELETE /api/tasks/:id
```

**响应:**
```json
{
  "success": true,
  "message": "任务删除成功"
}
```

## 批量操作接口

### 6. 批量更新任务状态
```
PUT /api/tasks/bulk/status
```

**请求体:**
```json
{
  "taskIds": [1, 2, 3],
  "status": "done"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "updatedCount": 3
  }
}
```

### 7. 批量删除任务
```
DELETE /api/tasks/bulk
```

**请求体:**
```json
{
  "taskIds": [1, 2, 3]
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3
  }
}
```

## 任务操作接口

### 8. 移动任务到其他项目
```
PUT /api/tasks/:id/move
```

**请求体:**
```json
{
  "projectId": 2
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "title": "任务标题",
      "project": 2,
      // ... 其他字段
    }
  }
}
```

### 9. 添加子任务
```
POST /api/tasks/:id/subtasks
```

**请求体:**
```json
{
  "title": "子任务标题"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "subtasks": [
        {
          "id": 1,
          "title": "子任务标题",
          "completed": false,
          "createdAt": "2023-12-01T10:00:00.000Z"
        }
      ]
      // ... 其他字段
    }
  }
}
```

### 10. 切换子任务状态
```
PUT /api/tasks/:id/subtasks/:subtaskId/toggle
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "subtasks": [
        {
          "id": 1,
          "title": "子任务标题",
          "completed": true,
          "createdAt": "2023-12-01T10:00:00.000Z"
        }
      ]
      // ... 其他字段
    }
  }
}
```

### 11. 添加评论
```
POST /api/tasks/:id/comments
```

**请求体:**
```json
{
  "content": "这是一条评论"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "comments": [
        {
          "id": 1,
          "content": "这是一条评论",
          "author": 1,
          "createdAt": "2023-12-01T10:00:00.000Z",
          "updatedAt": "2023-12-01T10:00:00.000Z"
        }
      ]
      // ... 其他字段
    }
  }
}
```

### 12. 添加观察者
```
POST /api/tasks/:id/watchers
```

**请求体:**
```json
{
  "userId": 2
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "watchers": [1, 2]
      // ... 其他字段
    }
  }
}
```

### 13. 移除观察者
```
DELETE /api/tasks/:id/watchers/:userId
```

**响应:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "watchers": [1]
      // ... 其他字段
    }
  }
}
```