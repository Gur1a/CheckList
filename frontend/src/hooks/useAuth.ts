import { useContext } from 'react';
import { AuthContextType } from '../../../shared/types';
import AuthContext from '../contexts/AuthContext';

/**
 * useAuth Hook - 用于在组件中使用认证状态和方法
 * 
 * @returns {AuthContextType} 认证上下文，包含状态和方法
 * @throws {Error} 当在 AuthProvider 外部使用时抛出错误
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;