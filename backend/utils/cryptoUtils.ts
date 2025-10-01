import crypto from 'crypto';

// 检查加密密钥是否存在
export const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY || 'default_encryption_key';
  if (key === 'default_encryption_key') {
    console.warn('警告: 使用默认加密密钥，生产环境请设置ENCRYPTION_KEY环境变量');
  }
  // 确保密钥长度为32字节（256位）
  return crypto.scryptSync(key, 'salt', 32).toString('hex').slice(0, 32);
};

// 生成初始化向量
export const generateIV = (): Buffer => {
  return crypto.randomBytes(16);
};

/**
 * 加密ID
 * @param id 要加密的数字ID
 * @returns 加密后的字符串
 */
export const encryptId = (id: number | string): string => {
  try {
    const key = getEncryptionKey();
    const iv = generateIV();
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    
    // 确保ID是字符串
    const idStr = typeof id === 'number' ? id.toString() : id;
    let encrypted = cipher.update(idStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 组合IV和加密数据，用冒号分隔
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('加密ID失败:', error);
    throw new Error('加密ID失败');
  }
};

/**
 * 解密ID - 与前端encryptProjectId对应
 * @param encryptedId 加密后的ID字符串
 * @returns 解密后的数字ID
 */
export const decryptId = (encryptedId: string): number => {
  try {
    // Base64解码
    let decoded;
    try {
      decoded = Buffer.from(encryptedId, 'base64').toString('utf8');
    } catch (base64Error) {
      console.error('Base64解码失败:', base64Error);
      throw new Error('无效的加密ID格式');
    }
    
    // 移除前后的随机字符串（前端添加了4个随机字符在前，反转的4个在后）
    if (decoded.length < 8) {
      throw new Error('无效的加密ID长度');
    }
    
    const core = decoded.slice(4, -4);
    
    // 恢复原始字符
    let decrypted = '';
    for (let i = 0; i < core.length; i++) {
      const charCode = core.charCodeAt(i);
      // 反向偏移（与前端加密时的+5对应，这里需要-5）
      const originalCode = ((charCode - 48 - 5 + 10) % 10) + 48;
      decrypted += String.fromCharCode(originalCode);
    }
    
    // 转换为数字
    const id = parseInt(decrypted, 10);
    if (isNaN(id) || id <= 0) {
      throw new Error('解密后的ID不是有效数字');
    }
    
    return id;
  } catch (error) {
    console.error('解密ID失败:', error);
    throw new Error('无效的加密ID');
  }
};

/**
 * 创建一个中间件，用于处理加密的ID参数
 */
export const decryptIdMiddleware = () => {
  return (req: any, res: any, next: any) => {
    try {
      // 检查请求参数中是否有加密的项目ID
      if (req.query.encryptedProjectId) {
        try {
          const projectId = decryptId(req.query.encryptedProjectId as string);
          req.projectId = projectId;
        } catch (error) {
          console.error('解密项目ID失败:', error);
          // 不中断请求，继续传递，让后续处理程序决定如何处理错误
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};