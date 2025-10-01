/**
 * 前端加密工具，用于加密项目ID等敏感信息
 */

/**
 * 简单的ID加密函数
 * 注意：前端加密主要是为了隐藏URL中的明文ID，不能替代后端的安全验证
 * @param id 要加密的数字ID
 * @returns 加密后的字符串
 */
export const encryptProjectId = (id: number | string): string => {
  try {
    // 将ID转换为字符串
    const idStr = typeof id === 'number' ? id.toString() : id;
    
    // 简单的字符串混淆算法
    // 在实际项目中，你可能需要使用更复杂的加密算法或使用专门的库
    let encrypted = '';
    
    // 第一步：对每个字符进行简单变换
    for (let i = 0; i < idStr.length; i++) {
      const charCode = idStr.charCodeAt(i);
      // 字符编码偏移，确保在可打印字符范围内
      const shiftedCode = ((charCode - 48 + 5) % 10) + 48;
      encrypted += String.fromCharCode(shiftedCode);
    }
    
    // 第二步：添加一些随机字符作为混淆
    const randomStr = generateRandomString(4);
    encrypted = `${randomStr}${encrypted}${randomStr.split('').reverse().join('')}`;
    
    // 第三步：Base64编码
    const encoded = btoa(encrypted);
    
    return encoded;
  } catch (error) {
    console.error('加密项目ID失败:', error);
    throw new Error('加密项目ID失败');
  }
};

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 解密项目ID（前端解密主要用于调试，实际API调用中不需要）
 * @param encryptedId 加密后的ID
 * @returns 解密后的数字ID
 */
export const decryptProjectId = (encryptedId: string): number => {
  try {
    // Base64解码
    const decoded = atob(encryptedId);
    
    // 移除前后的随机字符串
    const core = decoded.slice(4, -4);
    
    // 恢复原始字符
    let decrypted = '';
    for (let i = 0; i < core.length; i++) {
      const charCode = core.charCodeAt(i);
      // 反向偏移
      const originalCode = ((charCode - 48 - 5 + 10) % 10) + 48;
      decrypted += String.fromCharCode(originalCode);
    }
    
    // 转换为数字
    const id = parseInt(decrypted, 10);
    if (isNaN(id)) {
      throw new Error('解密后的ID不是有效数字');
    }
    
    return id;
  } catch (error) {
    console.error('解密项目ID失败:', error);
    throw new Error('无效的加密ID');
  }
};