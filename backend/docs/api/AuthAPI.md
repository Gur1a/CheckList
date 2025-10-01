# 认证API文档

## 目录
- [用户注册](#用户注册)
- [用户登录](#用户登录)
- [验证Token](#验证token)
- [用户登出](#用户登出)

## 用户注册

### 请求地址
```
POST /api/auth/register
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名，3-20个字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，至少6个字符 |

### 请求示例
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456"
}
```

### 响应示例
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "",
      "theme": "auto",
      "language": "zh-CN",
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "desktop": true
        },
        "defaultView": "list",
        "workingHours": {
          "start": "09:00",
          "end": "18:00"
        }
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLoginAt": null
    }
  }
}
```

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | MISSING_FIELDS | 缺少必要字段 |
| 400 | INVALID_USERNAME | 用户名格式不正确 |
| 400 | INVALID_EMAIL | 邮箱格式不正确 |
| 400 | INVALID_PASSWORD | 密码格式不正确 |
| 400 | EMAIL_EXISTS | 邮箱已被注册 |
| 400 | USERNAME_EXISTS | 用户名已被占用 |

## 用户登录

### 请求地址
```
POST /api/auth/login
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

### 请求示例
```json
{
  "email": "test@example.com",
  "password": "Test123456"
}
```

### 响应示例
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "",
      "theme": "auto",
      "language": "zh-CN",
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "desktop": true
        },
        "defaultView": "list",
        "workingHours": {
          "start": "09:00",
          "end": "18:00"
        }
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLoginAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | MISSING_CREDENTIALS | 缺少邮箱或密码 |
| 400 | INVALID_EMAIL | 邮箱格式不正确 |
| 401 | INVALID_CREDENTIALS | 邮箱或密码错误 |
| 401 | ACCOUNT_DISABLED | 账户已被禁用 |

## 验证Token

### 请求地址
```
GET /api/auth/verify
```

### 请求头
```
Authorization: Bearer <token>
```

### 响应示例
```json
{
  "success": true,
  "message": "认证令牌有效",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "",
      "theme": "auto",
      "language": "zh-CN",
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "desktop": true
        },
        "defaultView": "list",
        "workingHours": {
          "start": "09:00",
          "end": "18:00"
        }
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLoginAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | NO_TOKEN | 缺少认证令牌 |
| 401 | EMPTY_TOKEN | 认证令牌为空 |
| 401 | INVALID_TOKEN_FORMAT | 令牌格式无效 |
| 401 | USER_NOT_FOUND | 用户不存在 |
| 401 | ACCOUNT_DISABLED | 账户已被禁用 |
| 401 | TOKEN_EXPIRED | 令牌已过期 |
| 401 | INVALID_TOKEN | 无效的令牌 |
| 401 | TOKEN_NOT_ACTIVE | 令牌尚未生效 |
| 401 | TOKEN_VERIFICATION_FAILED | 令牌验证失败 |

## 用户登出

### 请求地址
```
POST /api/auth/logout
```

### 请求头
```
Authorization: Bearer <token>
```

### 响应示例
```json
{
  "success": true,
  "message": "登出成功"
}
```