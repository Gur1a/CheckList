import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFormValidation from '../../hooks/useFormValidation';
import '../../styles/auth.css';

const Register: React.FC = () => {
  // 从 AuthContext 获取认证信息
  const { register, loading, error } = useAuth();
  
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
    fields: ['username', 'email', 'password', 'passwordConfirm'],
    initialValues: { 
      username: '', 
      email: '', 
      password: '', 
      passwordConfirm: '' 
    },
    validateOnBlur: true,
    validateOnChange: false
  });

  // 处理注册提交
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await register(values.username, values.email, values.password);
      // 注册成功会自动通过路由守卫跳转到 dashboard
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
        <div className="register-form"> 
        <h2>Register</h2>
        
        {/* 显示全局错误信息 */}
        {error && (
          <div className="error-message global-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister}> 
          <div className="form-group"> 
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              className={errors.username ? 'error' : ''}
              required
            />
            {errors.username && touched.username && (
              <span className="field-error">{errors.username}</span>
            )}
            
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
            
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={values.passwordConfirm}
              name="passwordConfirm"
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              className={errors.passwordConfirm ? 'error' : ''}
              required
            />
            {errors.passwordConfirm && touched.passwordConfirm && (
              <span className="field-error">{errors.passwordConfirm}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || isSubmitting || !isValid}
            className="login-button"
          >
            {loading || isSubmitting ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/login">已有账户？登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;