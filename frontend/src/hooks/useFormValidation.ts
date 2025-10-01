import { useState, useCallback } from 'react';
import { FieldErrors, FormValidator } from '../utils/validation';

/**
 * 表单状态管理 Hook
 * 提供统一的表单状态管理、验证和错误处理
 */

interface UseFormValidationOptions {
  fields: string[];
  initialValues?: Record<string, string>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

interface UseFormValidationReturn {
  values: Record<string, string>;
  errors: FieldErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: string, value: string) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  validateField: (field: string, value?: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useFormValidation = ({
  fields,
  initialValues = {},
  validateOnBlur = true,
  validateOnChange = false
}: UseFormValidationOptions): UseFormValidationReturn => {
  
  // 初始化表单值
  const getInitialValues = () => {
    const values: Record<string, string> = {};
    fields.forEach(field => {
      values[field] = initialValues[field] || '';
    });
    return values;
  };

  // 初始化触摸状态
  const getInitialTouched = () => {
    const touched: Record<string, boolean> = {};
    fields.forEach(field => {
      touched[field] = false;
    });
    return touched;
  };

  const [values, setValues] = useState<Record<string, string>>(getInitialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>(getInitialTouched);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 计算表单是否有效
  const isValid = !FormValidator.hasErrors(errors);

  // 设置单个字段值
  const setValue = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // 设置单个字段错误
  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  // 清除单个字段错误
  const clearError = useCallback((field: string) => {
    setErrors(prev => FormValidator.clearFieldError(prev, field));
  }, []);

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // 验证单个字段
  const validateField = useCallback((field: string, value?: string) => {
    const fieldValue = value !== undefined ? value : values[field];
    const result = FormValidator.validateField(field, fieldValue, values.password);
    
    if (!result.isValid) {
      setError(field, result.message);
    } else {
      clearError(field);
    }
  }, [values, setError, clearError]);

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    const formErrors = FormValidator.validateForm(values, fields);
    setErrors(formErrors);
    return !FormValidator.hasErrors(formErrors);
  }, [values, fields]);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValue(name, value);

    // 可选的实时验证
    if (validateOnChange && touched[name]) {
      validateField(name, value);
    }
  }, [setValue, validateField, validateOnChange, touched]);

  // 处理字段失焦
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    // 标记字段为已触摸
    setTouched(prev => ({ ...prev, [name]: true }));

    // 可选的失焦验证
    if (validateOnBlur) {
      validateField(name);
    }
  }, [validateField, validateOnBlur]);

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(getInitialValues());
    setErrors({});
    setTouched(getInitialTouched());
    setIsSubmitting(false);
  }, [initialValues]);

  // 设置提交状态
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    clearAllErrors,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setSubmitting
  };
};

export default useFormValidation;