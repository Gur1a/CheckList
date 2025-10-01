const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

// 测试用户数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456'
};

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 测试注册功能
async function testRegister() {
  try {
    console.log('🧪 开始测试用户注册...');
    
    const response = await api.post('/auth/register', testUser);
    
    if (response.data.success) {
      console.log('✅ 用户注册成功');
      console.log('📝 用户信息:', JSON.stringify(response.data.data.user, null, 2));
      return response.data.data.token;
    } else {
      console.error('❌ 用户注册失败:', response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ 用户注册失败:', error.response.data.message);
      console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 请求失败:', error.message);
    }
    return null;
  }
}

// 测试登录功能
async function testLogin() {
  try {
    console.log('🧪 开始测试用户登录...');
    
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success) {
      console.log('✅ 用户登录成功');
      console.log('📝 用户信息:', JSON.stringify(response.data.data.user, null, 2));
      return response.data.data.token;
    } else {
      console.error('❌ 用户登录失败:', response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ 用户登录失败:', error.response.data.message);
      console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 请求失败:', error.message);
    }
    return null;
  }
}

// 测试Token验证
async function testVerifyToken(token) {
  try {
    console.log('🧪 开始测试Token验证...');
    
    const response = await api.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Token验证成功');
      console.log('📝 用户信息:', JSON.stringify(response.data.data.user, null, 2));
      return true;
    } else {
      console.error('❌ Token验证失败:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Token验证失败:', error.response.data.message);
      console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 请求失败:', error.message);
    }
    return false;
  }
}

// 测试登出功能
async function testLogout(token) {
  try {
    console.log('🧪 开始测试用户登出...');
    
    const response = await api.post('/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ 用户登出成功');
      return true;
    } else {
      console.error('❌ 用户登出失败:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ 用户登出失败:', error.response.data.message);
      console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 请求失败:', error.message);
    }
    return false;
  }
}

// 主测试函数
async function main() {
  console.log('🚀 开始认证API测试\n');
  
  // 测试注册
  const registerToken = await testRegister();
  console.log('');
  
  // 如果注册失败，测试登录
  let token = registerToken;
  if (!token) {
    token = await testLogin();
    console.log('');
  }
  
  // 如果获取到token，测试验证和登出
  if (token) {
    console.log('');
    await testVerifyToken(token);
    console.log('');
    await testLogout(token);
  }
  
  console.log('\n🏁 认证API测试完成');
}

// 执行测试
main().catch(error => {
  console.error('🚨 测试过程中发生错误:', error);
});