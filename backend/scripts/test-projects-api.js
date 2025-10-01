import { config } from "dotenv";
import axios from "axios";

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

// 测试创建项目
async function testCreateProject(token) {
    try {
        console.log('🧪 创建项目...');
        
        const response = await api.post('/projects', {
            name: '测试项目',
            description: '这是一个测试项目',
            color: '#3498db',
            icon: '📋',
            isPrivate: false,
            settings: {
                allowInvites: true,
                allowGuestAccess: false,
                defaultTaskStatus: 'todo',
                autoArchiveCompleted: false,
                enableTimeTracking: false
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 项目创建成功');
            console.log('📝 项目信息:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 创建项目失败:', error.response.data.message);
            console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return null;
}

// 测试获取项目列表
async function testGetProjects(token) {
    try {
        console.log('🧪 获取项目列表...');

        const response = await api.get('/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                page: 1,
                limit: 10,
            }
        });

        if (response.data.success) {
            console.log('✅ 获取项目列表成功');
            console.log(`📊 共 ${response.data.data.totalItems} 个项目，当前第 ${response.data.data.currentPage} 页`);
            return response.data.data.items;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 获取项目列表失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return [];
}

// 测试获取用户项目列表
async function testGetUserProjects(token) {
    try {
        console.log('🧪 获取用户项目列表...');

        const response = await api.get('/projects/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                page: 1,
                limit: 10
            }
        });

        if (response.data.success) {
            console.log('✅ 获取用户项目列表成功');
            console.log(`📊 用户共有 ${response.data.data.totalItems} 个项目，当前第 ${response.data.data.currentPage} 页`);
            return response.data.data.items;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 获取用户项目列表失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return [];
}

// 测试获取单个项目
async function testGetProjectById(token, projectId) {
    try {
        console.log(`🧪 获取项目 #${projectId} 详情...`);

        const response = await api.get(`/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 获取项目详情成功');
            console.log('📝 项目详情:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 获取项目详情失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return null;
}

// 测试更新项目
async function testUpdateProject(token, projectId) {
    try {
        console.log(`🧪 更新项目 #${projectId}...`);

        const response = await api.put(`/projects/${projectId}`, {
            name: '测试项目（已更新）',
            description: '这是一个已更新的测试项目',
            color: '#e74c3c',
            icon: '📈'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 更新项目成功');
            console.log('📝 更新后的项目信息:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 更新项目失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return null;
}

// 测试归档项目
async function testArchiveProject(token, projectId) {
    try {
        console.log(`🧪 归档项目 #${projectId}...`);

        const response = await api.put(`/projects/${projectId}/archive`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 归档项目成功');
            console.log('📝 归档后的项目信息:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 归档项目失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return null;
}

// 测试取消归档项目
async function testUnarchiveProject(token, projectId) {
    try {
        console.log(`🧪 取消归档项目 #${projectId}...`);

        const response = await api.put(`/projects/${projectId}/unarchive`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 取消归档项目成功');
            console.log('📝 取消归档后的项目信息:', JSON.stringify(response.data.data, null, 2));
            return response.data.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 取消归档项目失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return null;
}

// 测试删除项目
async function testDeleteProject(token, projectId) {
    try {
        console.log(`🧪 删除项目 #${projectId}...`);

        const response = await api.delete(`/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            console.log('✅ 删除项目成功');
            return true;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ 删除项目失败:', error.response.data.message);
        } else {
            console.error('❌ 请求失败:', error.message);
        }
    }
    return false;
}

// 主测试函数
async function runTests() {
    console.log('🚀 开始测试项目API...\n');

    // 测试登录获取token
    const token = await testLogin();

    if (!token) {
        console.error('❌ 无法获取认证token，测试终止');
        return;
    }

    console.log('\n✨ 登录成功，开始测试项目API...\n');

    // 测试获取项目列表
    await testGetProjects(token);

    // 测试获取用户项目列表
    await testGetUserProjects(token);

    // 测试创建项目
    const createdProject = await testCreateProject(token);

    if (createdProject) {
        const projectId = createdProject.id;
        
        // 测试获取单个项目
        await testGetProjectById(token, projectId);
        
        // 测试更新项目
        await testUpdateProject(token, projectId);
        
        // 测试归档项目
        await testArchiveProject(token, projectId);
        
        // // 测试取消归档项目
        // await testUnarchiveProject(token, projectId);
        
        // // 测试删除项目
        // await testDeleteProject(token, projectId);
    }

    console.log('\n✅ 所有项目API测试已完成！');
}

// 运行测试
runTests().catch(error => {
    console.error('❌ 测试过程中发生错误:', error);
});