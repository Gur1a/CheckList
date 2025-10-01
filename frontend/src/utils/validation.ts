/**
 * 表单验证工具函数
 * 提供统一的验证规则和错误消息，确保前后端验证一致性
 */

// 验证规则接口
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// 字段验证错误类型
export interface FieldErrors {
  [key: string]: string;
}

/**
 * 基础验证函数
 */
export class FormValidator {
  // 邮箱验证正则 (与后端保持一致)
  private static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // 密码验证正则 (与后端保持一致)
  private static PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  
  // 用户名验证正则 (与后端保持一致)
  private static USERNAME_REGEX = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

  /**
   * 验证邮箱
   */
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, message: '邮箱不能为空' };
    }
    
    if (!this.EMAIL_REGEX.test(email)) {
      return { isValid: false, message: '请输入有效的邮箱地址' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * 验证密码
   */
  static validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, message: '密码不能为空' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: '密码至少需要6个字符' };
    }
    
    if (!this.PASSWORD_REGEX.test(password)) {
      return { isValid: false, message: '密码必须包含大小写字母和数字' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * 验证用户名
   */
  static validateUsername(username: string): ValidationResult {
    if (!username.trim()) {
      return { isValid: false, message: '用户名不能为空' };
    }
    
    if (username.length < 3 || username.length > 20) {
      return { isValid: false, message: '用户名长度必须在3-20个字符之间' };
    }
    
    if (!this.USERNAME_REGEX.test(username)) {
      return { isValid: false, message: '用户名只能包含字母、数字、下划线和中文' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * 验证确认密码
   */
  static validatePasswordConfirm(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword) {
      return { isValid: false, message: '请确认密码' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, message: '两次输入的密码不一致' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * 通用字段验证
   */
  static validateField(fieldName: string, value: string, additionalValue?: string): ValidationResult {
    switch (fieldName) {
      case 'email':
        return this.validateEmail(value);
      
      case 'password':
        return this.validatePassword(value);
      
      case 'username':
        return this.validateUsername(value);
      
      case 'passwordConfirm':
        return this.validatePasswordConfirm(additionalValue || '', value);
      
      default:
        return { isValid: true, message: '' };
    }
  }

  /**
   * 验证整个表单
   */
  static validateForm(formData: Record<string, any>, fields: string[]): FieldErrors {
    const errors: FieldErrors = {};
    
    fields.forEach(field => {
      const result = this.validateField(field, formData[field], formData.password);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    });
    
    return errors;
  }

  /**
   * 检查表单是否有错误
   */
  static hasErrors(errors: FieldErrors): boolean {
    return Object.keys(errors).some(key => errors[key]);
  }

  /**
   * 清除指定字段的错误
   */
  static clearFieldError(errors: FieldErrors, fieldName: string): FieldErrors {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
  }

  /**
   * 清除所有错误
   */
  static clearAllErrors(): FieldErrors {
    return {};
  }
}

/**
 * 表单验证 Hook 工具函数
 */
export const createFormValidator = (fields: string[]) => {
  return {
    validateField: (fieldName: string, value: string, additionalValue?: string) => 
      FormValidator.validateField(fieldName, value, additionalValue),
    
    validateForm: (formData: Record<string, any>) => 
      FormValidator.validateForm(formData, fields),
    
    hasErrors: (errors: FieldErrors) => 
      FormValidator.hasErrors(errors),
    
    clearFieldError: (errors: FieldErrors, fieldName: string) => 
      FormValidator.clearFieldError(errors, fieldName),
    
    clearAllErrors: () => 
      FormValidator.clearAllErrors()
  };
};

// 预定义的验证器
export const loginValidator = createFormValidator(['email', 'password']);
export const registerValidator = createFormValidator(['username', 'email', 'password', 'passwordConfirm']);

export default FormValidator;