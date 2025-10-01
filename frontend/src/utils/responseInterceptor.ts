import { ApiError } from './apiClient';
import { handleApiError, isAuthError } from './errorHandler';

/**
 * 响应拦截器类型
 */
export interface ResponseInterceptor {
  onSuccess?: <T>(response: T) => T | Promise<T>;
  onError?: (error: unknown) => void | Promise<void>;
}

/**
 * 全局响应拦截器配置
 */
class ResponseInterceptorManager {
  private interceptors: ResponseInterceptor[] = [];

  /**
   * 添加拦截器
   */
  add(interceptor: ResponseInterceptor): number {
    this.interceptors.push(interceptor);
    return this.interceptors.length - 1;
  }

  /**
   * 移除拦截器
   */
  remove(index: number): void {
    if (this.interceptors[index]) {
      this.interceptors.splice(index, 1);
    }
  }

  /**
   * 处理成功响应
   */
  async handleSuccess<T>(response: T): Promise<T> {
    let result = response;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.onSuccess) {
        result = await interceptor.onSuccess(result);
      }
    }
    
    return result;
  }

  /**
   * 处理错误响应
   */
  async handleError(error: unknown): Promise<void> {
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        await interceptor.onError(error);
      }
    }
  }
}

// 创建全局实例
export const responseInterceptor = new ResponseInterceptorManager();

// 默认拦截器：处理认证错误
responseInterceptor.add({
  onError: (error) => {
    if (isAuthError(error)) {
      // 认证失败，清理本地存储并跳转到登录页
      localStorage.removeItem('todolist_token');
      localStorage.removeItem('todolist_user');
      
      // 可以在这里触发全局状态更新或路由跳转
      // 例如：dispatch({ type: 'FORCE_LOGOUT' });
      console.warn('认证失败，请重新登录');
    }
  }
});

// 默认拦截器：全局错误处理
responseInterceptor.add({
  onError: (error) => {
    // 统一错误处理，显示错误提示
    handleApiError(error);
  }
});

// 默认拦截器：请求日志
if (process.env.NODE_ENV === 'development') {
  responseInterceptor.add({
    onSuccess: (response) => {
      console.log('API响应成功:', response);
      return response;
    },
    onError: (error) => {
      console.error('API响应错误:', error);
    }
  });
}

export default responseInterceptor;