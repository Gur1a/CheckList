import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import useFormValidation from '../../hooks/useFormValidation';
import '../../styles/auth.css';

const Login: React.FC = () => {
  // 从 AuthContext 获取认证信息
  const { login, loading, error } = useAuth();
  
  // 从 Redux 获取其他状态（如果需要的话）
  // const reduxState = useSelector((state: any) => state.someSlice);
  // const dispatch = useDispatch();
  
  // 使用表单验证 Hook
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    setSubmitting
  } = useFormValidation({
    fields: ['email', 'password'],
    initialValues: { email: '', password: '' },
    validateOnBlur: true,
    validateOnChange: false
  });

  // 处理登录提交
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await login(values.email, values.password);
      // 登录成功会自动通过路由守卫跳转到 dashboard
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form"> 
        <h2>Login</h2>
        
        {/* 显示全局错误信息 */}
        {error && (
          <div className="error-message global-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}> 
          <div className="form-group"> 
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && touched.email && (
              <span className="field-error">{errors.email}</span>
            )}
            
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && touched.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || isSubmitting || !isValid}
            className="login-button"
          >
            {loading || isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register">还没有账户？注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;