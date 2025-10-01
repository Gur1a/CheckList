import { ApiResponse } from '../../../shared/types';

// API 配置
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 10000, // 10秒超时
  retryAttempts: 3,
  retryDelay: 1000 // 1秒重试延迟
};

// 请求选项接口
export interface RequestOptions extends RequestInit {
  timeout?: number;
  retry?: boolean;
  skipAuth?: boolean;
  skipErrorToast?: boolean;
}

// 错误类型
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 网络错误类型
export class NetworkError extends Error {
  constructor(message: string = '网络连接失败') {
    super(message);
    this.name = 'NetworkError';
  }
}

// 超时错误类型
export class TimeoutError extends Error {
  constructor(message: string = '请求超时') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * 获取认证token
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('todolist_token');
};

/**
 * 创建超时Promise
 */
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeout);
  });
};

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 处理响应
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // 检查响应状态
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: '服务器响应格式错误' };
    }

    throw new ApiError(
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || `HTTP ${response.status} 错误`,
      errorData
    );
  }

  // 解析JSON响应
  try {
    const data: ApiResponse<T> = await response.json();
    
    // 检查业务逻辑成功状态
    if (!data.success) {
      throw new ApiError(
        response.status,
        'BUSINESS_ERROR',
        data.message || data.error || '操作失败',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'PARSE_ERROR', '响应数据解析失败');
  }
};

/**
 * 构建请求URL
 */
const buildURL = (endpoint: string): string => {
  // 如果是完整URL，直接返回
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // 确保endpoint以/开头
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${API_CONFIG.baseURL}${cleanEndpoint}`;
};

/**
 * 构建请求headers
 */
const buildHeaders = (options: RequestOptions = {}): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // 添加认证header
  if (!options.skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // 合并用户提供的headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  return headers;
};

/**
 * 执行HTTP请求（带重试机制）
 */
const executeRequest = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    timeout = API_CONFIG.timeout,
    retry = true,
    ...fetchOptions
  } = options;

  let lastError: Error = new Error('Unknown error');
  const maxAttempts = retry ? API_CONFIG.retryAttempts : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 创建fetch请求
      const fetchPromise = fetch(url, {
        ...fetchOptions,
        headers: buildHeaders(options)
      });

      // 添加超时控制
      const response = await Promise.race([
        fetchPromise,
        createTimeoutPromise(timeout)
      ]);

      // 处理响应
      return await handleResponse<T>(response);

    } catch (error) {
      lastError = error as Error;

      // 如果是网络错误且允许重试
      if (retry && attempt < maxAttempts && 
          (error instanceof NetworkError || error instanceof TimeoutError)) {
        console.warn(`请求失败，第${attempt}次重试 (${maxAttempts - attempt}次剩余)`);
        await delay(API_CONFIG.retryDelay * attempt); // 递增延迟
        continue;
      }

      // 不重试的错误或达到最大重试次数
      break;
    }
  }

  // 转换错误类型
  if (lastError instanceof TypeError) {
    throw new NetworkError('网络连接失败，请检查网络状态');
  }

  throw lastError;
};

/**
 * API请求工具类
 */
export class ApiClient {
  /**
   * GET请求
   */
  static async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    return executeRequest<T>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST请求
   */
  static async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    return executeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * PUT请求
   */
  static async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    return executeRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * PATCH请求
   */
  static async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    return executeRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * DELETE请求
   */
  static async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    return executeRequest<T>(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * 上传文件
   */
  static async upload<T = any>(
    endpoint: string,
    file: File,
    data?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildURL(endpoint);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return executeRequest<T>(url, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
        'Authorization': options.skipAuth ? '' : `Bearer ${getAuthToken() || ''}`
      },
      ...options
    });
  }

  /**
   * 设置基础URL
   */
  static setBaseURL(baseURL: string): void {
    API_CONFIG.baseURL = baseURL;
  }

  /**
   * 获取当前配置
   */
  static getConfig(): typeof API_CONFIG {
    return { ...API_CONFIG };
  }
}

// 导出默认实例
export default ApiClient;