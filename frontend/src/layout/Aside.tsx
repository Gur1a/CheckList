import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/aside.css';

const Aside: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // 检查当前路由是否激活
    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // 导航菜单项
    const menuItems = [
        {
            id: 'dashboard',
            path: '/dashboard',
            icon: '🏠',
            label: '仪表板',
            description: '查看总览信息'
        },
        {
            id: 'tasks',
            path: '/tasks',
            icon: '📋',
            label: '任务管理',
            description: '管理和组织任务'
        },
        {
            id: 'calendar',
            path: '/calendar',
            icon: '📅',
            label: '日历视图',
            description: '查看任务日程安排'
        },
        {
            id: 'projects',
            path: '/projects',
            icon: '📁',
            label: '项目管理',
            description: '管理项目和团队'
        },
        {
            id: 'profile',
            path: '/profile',
            icon: '👤',
            label: '个人设置',
            description: '管理个人信息'
        }
    ];

    // 处理导航点击
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    // 处理登出
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="aside">
            {/* 用户信息区域 */}
            <div className="aside-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="用户头像" />
                        ) : (
                            <div className="avatar-placeholder">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="user-details">
                        <h3 className="username">{user?.username || '用户'}</h3>
                        <p className="user-email">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* 导航菜单 */}
            <nav className="aside-nav">
                <ul className="nav-menu">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-button ${
                                    isActive(item.path) ? 'active' : ''
                                }`}
                                onClick={() => handleNavigation(item.path)}
                                title={item.description}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 底部操作区域 */}
            <div className="aside-footer">
                <button 
                    className="logout-button"
                    onClick={handleLogout}
                    title="退出登录"
                >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-label">退出登录</span>
                </button>
            </div>
        </aside>
    );
};

export default Aside;