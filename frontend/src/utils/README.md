# API 封装使用说明

## 概述

本项目已经为HTTP请求和响应进行了完整的封装，包括：

- **统一的API客户端** (`apiClient.ts`)
- **API端点常量** (`apiEndpoints.ts`) 
- **错误处理机制** (`errorHandler.ts`)
- **响应拦截器** (`responseInterceptor.ts`)
- **服务类封装** (`services/`)

## 基本使用

### 1. 使用服务类（推荐）

```typescript
import { AuthService } from '../services';

// 登录
try {
  const response = await AuthService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  if (response.success) {
    console.log('登录成功:', response.data.user);
  }
} catch (error) {
  // 错误已经被自动处理和显示
  console.error('登录失败:', error);
}
```

### 2. 直接使用API客户端

```typescript
import { ApiClient, API_ENDPOINTS } from '../utils';

// GET请求
const response = await ApiClient.get('/users/profile');

// POST请求
const response = await ApiClient.post('/tasks', {
  title: '新任务',
  description: '任务描述'
});

// 带查询参数的请求
const response = await ApiClient.get(
  buildURLWithParams(API_ENDPOINTS.TASKS.LIST, {
    page: 1,
    limit: 10,
    status: 'pending'
  })
);
```

### 3. 错误处理

```typescript
import { handleApiError, isAuthError } from '../utils/errorHandler';

try {
  const response = await ApiClient.get('/protected-resource');
} catch (error) {
  if (isAuthError(error)) {
    // 处理认证错误
    console.log('需要重新登录');
  } else {
    // 其他错误已经自动显示toast
    const message = handleApiError(error, false); // 不显示toast
    console.log('错误消息:', message);
  }
}
```

## 功能特性

### 自动功能
- ✅ **自动认证**: 自动添加Bearer token
- ✅ **错误处理**: 统一的错误提示和处理
- ✅ **请求重试**: 网络错误自动重试
- ✅ **超时控制**: 请求超时保护
- ✅ **类型安全**: 完整的TypeScript支持

### 手动配置
- 🔧 **跳过认证**: `skipAuth: true`
- 🔧 **跳过错误提示**: `skipErrorToast: true`
- 🔧 **自定义超时**: `timeout: 5000`
- 🔧 **禁用重试**: `retry: false`

## API端点使用

```typescript
import { API_ENDPOINTS } from '../utils/apiEndpoints';

// 静态端点
API_ENDPOINTS.AUTH.LOGIN // '/auth/login'
API_ENDPOINTS.USERS.PROFILE // '/users/profile'

// 动态端点
API_ENDPOINTS.TASKS.GET_BY_ID('123') // '/tasks/123'
API_ENDPOINTS.PROJECTS.MEMBERS('456') // '/projects/456/members'
```

## 在组件中使用

```tsx
import React, { useState } from 'react';
import { AuthService } from '../services';
import { handleApiError } from '../utils/errorHandler';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await AuthService.login({ email, password });
      // 登录成功，状态会通过Context自动更新
    } catch (error) {
      // 错误已经自动处理
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX...
  );
};
```

## 扩展API服务

参考 `authService.ts` 的实现方式：

```typescript
// services/projectService.ts
import { ApiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../utils/apiEndpoints';

export class ProjectService {
  static async getProjects() {
    return ApiClient.get(API_ENDPOINTS.PROJECTS.LIST);
  }
  
  static async createProject(data: any) {
    return ApiClient.post(API_ENDPOINTS.PROJECTS.CREATE, data);
  }
}
```