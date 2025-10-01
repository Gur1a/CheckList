import { ApiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../utils/apiEndpoints';
import { User, ApiResponse } from '../../../shared/types';

// 认证相关的请求/响应类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
      skipAuth: true // 登录时不需要认证
    });
  }

  /**
   * 用户注册
   */
  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData, {
      skipAuth: true // 注册时不需要认证
    });
  }

  /**
   * 验证token有效性
   */
  static async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return ApiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.VERIFY);
  }

  /**
   * 刷新token
   */
  static async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<ApiResponse<void>> {
    return ApiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * 忘记密码
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data, {
      skipAuth: true
    });
  }

  /**
   * 重置密码
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data, {
      skipAuth: true
    });
  }

  /**
   * 修改密码
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post<{ message: string }>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  }
}

export default AuthService;