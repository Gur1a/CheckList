import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '../../../shared/types';
import AuthService from '../services/authService';
import { ApiError, NetworkError } from '../utils/apiClient';

// Action 类型定义
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_AUTH'; payload: { user: User; token: string } };

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true, // 启动时需要检查本地存储
  error: null
};

// Reducer 函数
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
    case 'INIT_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 组件
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 验证token
  const verifyToken = async (token: string): Promise<{ user: User } | null> => {
    try {
      const response = await AuthService.verifyToken();
      return response.data || null;
    } catch (error) {
      console.error('Token验证失败:', error);
      return null;
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('todolist_token');
      const userStr = localStorage.getItem('todolist_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // 验证 token 是否仍然有效
          const verifyResult = await verifyToken(token);
          
          if (verifyResult) {
            dispatch({ 
              type: 'INIT_AUTH', 
              payload: { user: verifyResult.user, token } 
            });
          } else {
            // Token 无效，清理本地存储
            localStorage.removeItem('todolist_token');
            localStorage.removeItem('todolist_user');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('初始化认证状态失败:', error);
          localStorage.removeItem('todolist_token');
          localStorage.removeItem('todolist_user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // 没有存储的认证信息
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // 登录方法
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.data) {
        // 存储到本地
        localStorage.setItem('todolist_token', response.data.token);
        localStorage.setItem('todolist_user', JSON.stringify(response.data.user));
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { 
            user: response.data.user, 
            token: response.data.token 
          } 
        });
      } else {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: response.message || '登录失败' 
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      
      let errorMessage = '登录失败';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof NetworkError) {
        errorMessage = '网络连接失败，请检查网络状态';
      }
      
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: errorMessage
      });
    }
  };

  // 注册方法
  const register = async (username: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await AuthService.register({ username, email, password });
      
      if (response.success && response.data) {
        // 注册成功后自动登录
        localStorage.setItem('todolist_token', response.data.token);
        localStorage.setItem('todolist_user', JSON.stringify(response.data.user));
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { 
            user: response.data.user, 
            token: response.data.token 
          } 
        });
      } else {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: response.message || '注册失败' 
        });
      }
    } catch (error) {
      console.error('注册错误:', error);
      
      let errorMessage = '注册失败';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof NetworkError) {
        errorMessage = '网络连接失败，请检查网络状态';
      }
      
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: errorMessage
      });
    }
  };

  // 登出方法
  const logout = (): void => {
    // 可选：通知服务器用户登出
    try {
      AuthService.logout().catch(error => {
        console.warn('服务器登出通知失败:', error);
      });
    } catch (error) {
      // 忽略服务器通知错误，继续本地登出
    }
    
    // 清理本地存储
    localStorage.removeItem('todolist_token');
    localStorage.removeItem('todolist_user');
    
    // 更新状态
    dispatch({ type: 'LOGOUT' });
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    
    // 同步更新本地存储
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('todolist_user', JSON.stringify(updatedUser));
    }
  };

  // 清除错误
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context 值
  const contextValue: AuthContextType = {
    // 状态
    ...state,
    // 方法
    login,
    logout,
    register,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
export default AuthContext;