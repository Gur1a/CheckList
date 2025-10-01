// 测试解密函数，分析为什么MnF5TzBPeXEy解密失败

// 模拟前端加密逻辑
function encryptProjectId(id) {
    try {
        // 将ID转换为字符串
        const idStr = typeof id === 'number' ? id.toString() : id;
        
        // 简单的字符串混淆算法
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
        const encoded = Buffer.from(encrypted).toString('base64');
        
        return encoded;
    } catch (error) {
        console.error('加密项目ID失败:', error);
        throw new Error('加密项目ID失败');
    }
}

// 生成随机字符串
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 模拟后端解密逻辑
function decryptId(encryptedId) {
    try {
        console.log('原始加密ID:', encryptedId);
        
        // Base64解码
        let decoded;
        try {
            decoded = Buffer.from(encryptedId, 'base64').toString('utf8');
            console.log('Base64解码结果:', decoded);
            console.log('解码后长度:', decoded.length);
        } catch (base64Error) {
            console.error('Base64解码失败:', base64Error);
            throw new Error('无效的加密ID格式');
        }
        
        // 移除前后的随机字符串（前端添加了4个随机字符在前，反转的4个在后）
        if (decoded.length < 8) {
            throw new Error('无效的加密ID长度');
        }
        
        const core = decoded.slice(4, -4);
        console.log('核心内容:', core);
        
        // 恢复原始字符
        let decrypted = '';
        for (let i = 0; i < core.length; i++) {
            const charCode = core.charCodeAt(i);
            console.log(`字符 ${i}: ${core[i]}, ASCII: ${charCode}`);
            // 反向偏移（与前端加密时的+5对应，这里需要-5）
            const originalCode = ((charCode - 48 - 5 + 10) % 10) + 48;
            decrypted += String.fromCharCode(originalCode);
        }
        
        console.log('解密后字符串:', decrypted);
        
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
}

// 测试解密问题ID
function testDecrypt() {
    // 测试ID为5的加密和解密过程
    const originalId = 5;
    console.log('原始项目ID:', originalId);
    
    // 模拟前端加密
    const encryptedId = encryptProjectId(originalId);
    console.log('模拟前端加密结果:', encryptedId);
    
    // 解密模拟加密的结果
    try {
        const decryptedId = decryptId(encryptedId);
        console.log('解密成功，结果:', decryptedId);
    } catch (error) {
        console.error('解密模拟加密结果失败:', error);
    }
    
    // 测试问题加密ID：MnF5TzBPeXEy
    console.log('\n\n测试问题加密ID: MnF5TzBPeXEy');
    try {
        const decryptedId = decryptId('MnF5TzBPeXEy');
        console.log('解密问题ID成功，结果:', decryptedId);
    } catch (error) {
        console.error('解密问题ID失败:', error);
    }
}

testDecrypt();