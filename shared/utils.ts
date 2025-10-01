// 通用工具函数
export const Utils = {
  // 生成唯一ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 格式化日期
  formatDate: (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // 格式化时间
  formatDateTime: (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
  },

  // 计算时间差
  timeAgo: (date: Date | string): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  // 防抖函数
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: any;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 深拷贝
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj) as unknown as T;
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const cloned: any = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = Utils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  }
};

// 验证工具
export const Validators = {
  // 邮箱验证
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 密码强度验证
  isStrongPassword: (password: string): boolean => {
    // 至少8位，包含大小写字母和数字
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },

  // 非空验证
  isNotEmpty: (value: any): boolean => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }
};

// 颜色配置接口
interface IColorConfig {
  [key: string]: string;
}

// API 端点配置接口
interface IApiEndpoints {
  AUTH: string;
  USERS: string;
  PROJECTS: string;
  TASKS: string;
  BOARDS: string;
  HISTORY: string;
}

// 存储键配置接口
interface IStorageKeys {
  TOKEN: string;
  USER: string;
  THEME: string;
  OFFLINE_DATA: string;
}

// 常量定义
export const Constants = {
  // 任务优先级颜色
  PRIORITY_COLORS: {
    low: '#28a745',
    medium: '#ffc107', 
    high: '#fd7e14',
    urgent: '#dc3545'
  } as IColorConfig,

  // 任务状态颜色
  STATUS_COLORS: {
    todo: '#6c757d',
    in_progress: '#007bff',
    done: '#28a745',
    archived: '#868e96'
  } as IColorConfig,

  // 项目默认颜色
  PROJECT_COLORS: [
    '#007bff', '#28a745', '#dc3545', '#ffc107',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
  ] as string[],

  // API端点
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    PROJECTS: '/api/projects',
    TASKS: '/api/tasks',
    BOARDS: '/api/boards',
    HISTORY: '/api/history'
  } as IApiEndpoints,

  // 本地存储键
  STORAGE_KEYS: {
    TOKEN: 'todolist_token',
    USER: 'todolist_user',
    THEME: 'todolist_theme',
    OFFLINE_DATA: 'todolist_offline'
  } as IStorageKeys
};

// 导出类型
export type { IColorConfig, IApiEndpoints, IStorageKeys };