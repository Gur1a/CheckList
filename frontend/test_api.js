// 测试API请求的简单脚本
const API_URL = 'http://localhost:5000/api';
const TOKEN = localStorage.getItem('todolist_token');

// 手动加密函数 - 模拟前端加密逻辑
function encryptProjectId(id) {
  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('无效的项目ID');
  }
  
  // 模拟加密过程
  const idStr = String(numId);
  let encryptedDigits = '';
  
  for (let i = 0; i < idStr.length; i++) {
    const digit = parseInt(idStr[i]);
    encryptedDigits += String((digit + 5) % 10);
  }
  
  // 生成4位随机字符串
  const randomStr = generateRandomString(4);
  
  // 组合：随机字符串 + 加密数字 + 随机字符串反转
  const combined = randomStr + encryptedDigits + reverseString(randomStr);
  
  // Base64编码
  return btoa(combined);
}

function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

// 测试函数
async function testApiCalls() {
  console.log('开始测试API请求...');
  
  try {
    // 1. 加密项目ID
    const projectId = '5';
    const encryptedProjectId = encryptProjectId(projectId);
    console.log('项目ID:', projectId);
    console.log('加密后:', encryptedProjectId);
    
    // 2. 使用fetch API直接发送GET请求
    console.log('\n测试1: 使用fetch API直接发送GET请求');
    const url = `${API_URL}/boards?encryptedProjectId=${encryptedProjectId}`;
    console.log('请求URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应数据:', data);
    
    // 3. 测试POST请求（用于对比）
    console.log('\n测试2: 发送POST请求到相同URL');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ name: '测试看板', color: '#1890ff' })
    });
    
    const postData = await postResponse.json();
    console.log('POST响应状态:', postResponse.status);
    console.log('POST响应数据:', postData);
    
  } catch (error) {
    console.error('测试出错:', error);
  }
}

// 执行测试
testApiCalls();