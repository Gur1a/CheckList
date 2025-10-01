import { toast } from 'react-toastify';
import { ApiError, NetworkError, TimeoutError } from './apiClient';

/**
 * 统一的错误处理器
 */
export const handleApiError = (error: unknown, showToast: boolean = true): string => {
  let message = '未知错误';

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        message = error.message || '请求参数错误';
        break;
      case 401:
        message = '身份验证失败，请重新登录';
        // 可以在这里触发自动登出
        break;
      case 403:
        message = '没有权限执行此操作';
        break;
      case 404:
        message = '请求的资源不存在';
        break;
      case 409:
        message = error.message || '资源冲突';
        break;
      case 422:
        message = error.message || '数据验证失败';
        break;
      case 429:
        message = '请求过于频繁，请稍后重试';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      case 502:
        message = '服务器网关错误';
        break;
      case 503:
        message = '服务暂时不可用';
        break;
      default:
        message = error.message || `服务器错误 (${error.status})`;
    }
  } else if (error instanceof NetworkError) {
    message = '网络连接失败，请检查网络状态';
  } else if (error instanceof TimeoutError) {
    message = '请求超时，请稍后重试';
  } else if (error instanceof Error) {
    message = error.message;
  }

  // 显示错误提示
  if (showToast) {
    toast.error(message);
  }

  // 记录错误日志
  console.error('API错误:', error);

  return message;
};

/**
 * 获取友好的错误消息
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  return handleApiError(error, false);
};

/**
 * 检查是否为认证错误
 */
export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 401;
};

/**
 * 检查是否为权限错误
 */
export const isPermissionError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 403;
};

/**
 * 检查是否为网络错误
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof NetworkError || error instanceof TimeoutError;
};

/**
 * 错误重试判断
 */
export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    // 5xx 服务器错误和 429 限流错误可以重试
    return error.status >= 500 || error.status === 429;
  }
  
  // 网络错误和超时错误可以重试
  return isNetworkError(error);
};

export default {
  handleApiError,
  getFriendlyErrorMessage,
  isAuthError,
  isPermissionError,
  isNetworkError,
  shouldRetry
};