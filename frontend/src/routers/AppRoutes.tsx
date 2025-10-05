import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// import MainLayout from '../layout/MainLayout';
import TaskPageLayout from '@/layout/Layout';

// 懒加载组件
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const TasksPage = React.lazy(() => import('../pages/tasks/TasksPage'));
const ListTaskView = React.lazy(() => import('../pages/tasks/views/ListTaskView'));
const BoardTaskView = React.lazy(() => import('../pages/tasks/views/BoardTaskView'));
const GridTaskView = React.lazy(() => import('../pages/tasks/views/GridTaskView'));
const CalendarPage = React.lazy(() => import('../pages/calendar/CalendarPage'));
const ProjectList = React.lazy(() => import('../pages/projects/ProjectList'));
const ProjectDetail = React.lazy(() => import('../pages/projects/ProjectDetail'));
const Profile = React.lazy(() => import('../pages/profile/Profile'));
const NotFound = React.lazy(() => import('../pages/common/NotFound'));

// 加载中组件
const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner">加载中...</div>
  </div>
);

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // 如果还在加载认证状态，显示加载指示器
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? (
    <TaskPageLayout>{children}</TaskPageLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// 公共路由守卫组件（已登录用户访问登录页自动跳转）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // 如果还在加载认证状态，显示加载指示器
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// 主路由配置
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* 根路径重定向到仪表盘 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 公共路由（不需要认证，但已登录用户会自动跳转） */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* 受保护的路由（需要认证） */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <TasksPage />
              </Suspense>
            </ProtectedRoute>
          } 
        >
          {/* tasks 子路由 */}
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <ListTaskView />
            </React.Suspense>
          } />
          <Route path="board" element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <BoardTaskView />
            </React.Suspense>
          } />
          <Route path="grid" element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <GridTaskView />
            </React.Suspense>
          } />
        </Route>
        
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects/:id" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;