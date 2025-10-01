import { ProjectFilters } from "@/services/projectService";
/**
 * API端点常量定义
 */
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // 用户管理
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
    LIST: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`
  },

  // 项目管理
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    SEARCH: '/projects/search',
    GET_BY_ID: (id: string) => `/projects/${id}`,
    GET_BY_USER_ID:(userId: string, filters?: ProjectFilters) => `/projects/user/${userId}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    MEMBERS: (id: string) => `/projects/${id}/members`,
    ADD_MEMBER: (id: string) => `/projects/${id}/members`,
    REMOVE_MEMBER: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
    UPDATE_MEMBER_ROLE: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}/role`
  },

  // 任务管理
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET_BY_ID: '/tasks/:id',
    GET_BY_USER_ID: '/tasks/user/:userId',
    UPDATE: '/tasks/:id',
    DELETE: '/tasks/:id',
    BULK_UPDATE: '/tasks/bulk-update',
    BULK_DELETE: '/tasks/bulk-delete',
    REORDER: '/tasks/reorder',
    MOVE_TO_BOARD: '/tasks/:id/move-to-board',
    BY_PROJECT: '/projects/:projectId/tasks',
    BY_BOARD: '/boards/:boardId/tasks',
    BY_ASSIGNEE: '/tasks/assignee/:assignee',
    SEARCH: '/tasks/search',
    DUPLICATE: '/tasks/:id/duplicate',
    COMPLETE: '/tasks/:id/complete',
    REACTIVATE: '/tasks/:id/reactivate',
    ARCHIVE: '/tasks/:id/archive',
    ADD_TAG: (taskId: string) => `/tasks/${taskId}/tags`,
    REMOVE_TAG: (taskId: string, tagId: string) => `/tasks/${taskId}/tags/${tagId}`
  },

  // 标签管理
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
    GET_BY_ID: (id: string) => `/tags/${id}`,
    UPDATE: (id: string) => `/tags/${id}`,
    DELETE: (id: string) => `/tags/${id}`,
    BY_USER: (userId: string) => `/tags/user/${userId}`,
    ADD_TAG_TO_TASK: (tagId: string, taskId: string) => `/tags/${tagId}/tasks/${taskId}`,
    REMOVE_TAG_FROM_TASK: (tagId: string, taskId: string) => `/tags/${tagId}/tasks/${taskId}`,
    GET_TAGS_FOR_TASK: (taskId: string) => `/tags/tasks/${taskId}`
  },

  // 看板管理
  BOARDS: {
    // 注意：项目ID通过查询参数encryptedProjectId传递
    LIST_BY_PROJECT: (encryptedProjectId: string) => `/boards?encryptedProjectId=${encryptedProjectId}`,
    CREATE: (encryptedProjectId: string) => `/boards?encryptedProjectId=${encryptedProjectId}`,
    GET_BY_ID: (id: string) => `/boards/${id}`,
    UPDATE: (id: string) => `/boards/${id}`,
    DELETE: (id: string) => `/boards/${id}`,
    REORDER: (encryptedProjectId: string) => `/boards/reorder?encryptedProjectId=${encryptedProjectId}`
  },

  // 历史记录
  HISTORY: {
    LIST: '/history',
    GET_BY_ENTITY: (entityType: string, entityId: string) => `/history/${entityType}/${entityId}`,
    LIST_BY_PROJECT: (projectId: string) => `/projects/${projectId}/history`,
    LIST_BY_USER: (userId: string) => `/users/${userId}/history`
  },

  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    AVATAR: '/upload/avatar'
  },

  // 统计和报告
  STATS: {
    DASHBOARD: '/stats/dashboard',
    PROJECT: (projectId: string) => `/stats/projects/${projectId}`,
    USER: (userId: string) => `/stats/users/${userId}`,
    TASK_SUMMARY: '/stats/tasks/summary'
  }
} as const;

/**
 * 构建查询参数
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * 构建带查询参数的URL
 */
export const buildURLWithParams = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryParams(params)}`;
};

// 导出默认配置
export default API_ENDPOINTS;