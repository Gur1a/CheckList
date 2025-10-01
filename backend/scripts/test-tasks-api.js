import axios from "axios";
import { config } from "dotenv";

// 加载环境变量
config();

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

// 测试用户登录
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

// 测试获取任务列表
async function testGetTasks(token) {
try {
    console.log('🧪 获取任务列表...');

    const response = await api.get('/tasks', {
    headers: {
        'Authorization': `Bearer ${token}`
    },
    params: {
        page: 1,
        limit: 10
    }
    });

    if (response.data.success) {
    console.log('✅ 获取任务列表成功');
    console.log(`📊 共 ${response.data.data.totalItems} 个任务，当前第 ${response.data.data.currentPage} 页`);
    return response.data.data.items;
    }
} catch (error) {
    if (error.response) {
    console.error('❌ 获取任务列表失败:', error.response.data.message);
    } else {
    console.error('❌ 请求失败:', error.message);
    }
}
return [];
}

// 测试创建任务
async function testCreateTask(token) {
try {
    console.log('🧪 创建任务...');
    // 从request中获取用户ID（已通过auth中间件验证并设置）

    // 注意：project字段是必需的，这里使用示例项目ID 1
    // 在实际测试中，应该使用有效的项目ID
    const response = await api.post('/tasks', {
        title: '测试任务',
        description: '这是一个测试任务',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 一周后
        priority: 'medium',
        status: 'todo',
        project: 2, // 必需字段
        actualHours: 0,
        }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.data.success) {
    console.log('✅ 任务创建成功');
    console.log('📝 任务信息:', JSON.stringify(response.data.data, null, 2));
    return response.data.data;
    }
} catch (error) {
    if (error.response) {
    console.error('❌ 创建任务失败:', error.response.data.message);
    console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
    } else {
    console.error('❌ 请求失败:', error.message);
    }
}
return null;
}

// 测试获取单个任务
async function testGetTaskById(token, taskId) {
try {
    console.log(`🧪 获取任务 #${taskId} 详情...`);

    const response = await api.get(`/tasks/${taskId}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
    });

    if (response.data.success) {
    console.log('✅ 获取任务详情成功');
    console.log('📝 任务详情:', JSON.stringify(response.data.data, null, 2));
    return response.data.data;
    }
} catch (error) {
    if (error.response) {
    console.error('❌ 获取任务详情失败:', error.response.data.message);
    } else {
    console.error('❌ 请求失败:', error.message);
    }
}
return null;
}

// 测试更新任务
async function testUpdateTask(token, taskId) {
try {
    console.log(`🧪 更新任务 #${taskId}...`);

    const response = await api.put(`/tasks/${taskId}`, {
    title: '测试任务（已更新）',
    description: '这是一个已更新的测试任务',
    priority: 'high'
    }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
    });

    if (response.data.success) {
    console.log('✅ 更新任务成功');
    console.log('📝 更新后的任务信息:', JSON.stringify(response.data.data, null, 2));
    return response.data.data;
    }
} catch (error) {
    if (error.response) {
    console.error('❌ 更新任务失败:', error.response.data.message);
    } else {
    console.error('❌ 请求失败:', error.message);
    }
}
return null;
}

// 测试删除任务
async function testDeleteTask(token, taskId) {
try {
    console.log(`🧪 删除任务 #${taskId}...`);

    const response = await api.delete(`/tasks/${taskId}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
    });

    if (response.data.success) {
    console.log('✅ 删除任务成功');
    return true;
    }
} catch (error) {
    if (error.response) {
    console.error('❌ 删除任务失败:', error.response.data.message);
    } else {
    console.error('❌ 请求失败:', error.message);
    }
}
return false;
}

// 主测试函数
async function runTests() {
console.log('🚀 开始测试任务API...\n');

// 测试登录获取token
const token = await testLogin();

if (!token) {
    console.error('❌ 无法获取认证token，测试终止');
    return;
}

console.log('\n✨ 登录成功，开始测试任务API...\n');

// 测试获取任务列表
await testGetTasks(token);

// 测试创建任务
const createdTask = await testCreateTask(token);

if (createdTask) {
    const taskId = createdTask.id;
    
    // 测试获取单个任务
    await testGetTaskById(token, taskId);
    
    // 测试更新任务
    await testUpdateTask(token, taskId);
    
    // 测试删除任务（可选，根据需要取消注释）
    // await testDeleteTask(token, taskId);
}

console.log('\n✅ 所有测试已完成！');
}

// 运行测试
runTests().catch(error => {
    console.error('❌ 测试过程中发生错误:', error);
});