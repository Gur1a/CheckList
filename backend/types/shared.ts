// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 登录状态类型
export interface AuthState{
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  // 方法
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  NONE = 'none'
}

// 标签接口
export interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// 任务状态枚举
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  ARCHIVED = 'archived'
}

// 任务类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  reminder?: Date;
  assignee?: string;
  projectId: string;
  boardId?: string;
  order: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags?: Tag[];
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  isPrivate: boolean;
  members: ProjectMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 项目成员类型
export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

// 看板列类型
export interface Board {
  id: string;
  name: string;
  projectId: string;
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 历史记录类型
export interface HistoryRecord {
  id: string;
  entityType: 'task' | 'project' | 'board';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'move';
  changes: Record<string, any>;
  performedBy: string;
  performedAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'task_updated' | 'task_created' | 'task_deleted' | 'project_updated' | 'user_joined' | 'user_left';
  payload: any;
  userId: string;
  timestamp: Date;
}