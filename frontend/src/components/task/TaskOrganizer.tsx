import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TaskStatus, TaskPriority, TaskFilter } from '../../../../shared/types';
import { useTask, useTaskFilters } from '@/hooks/useTask';
import { useAuth } from '@/hooks/useAuth';
import './taskOrganizer.scss';
import { CreateTaskData } from '@/services/taskService';

// 视图类型定义
export type ViewType = 'list' | 'board' | 'grid';

export type TaskFilterView = 'all' | 'today' | 'tomorrow' | 'last week' | 'finished' | 'trash';

const TaskOrganizer: React.FC = () => {
  const { user } = useAuth();

  const {
    filter,
    setFilter,
    setTasks,
    getTasks,
    createTask,
  } = useTask();

  const location = useLocation();
  const navigate = useNavigate();

  // 从路由中获取当前视图类型
  const currentView = React.useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const viewSegment = pathSegments[pathSegments.length - 1];
    const validViews: ViewType[] = ['list', 'board', 'grid'];
    
    return validViews.includes(viewSegment as ViewType) ? 
      (viewSegment as ViewType) : 'list';
  }, [location.pathname]);

  // 组件状态
  const [searchQuery, setSearchQuery] = useState('');
  const [tempTaskTitle, setTempTaskTitle] = useState(''); // 临时任务标题

  // 处理快速添加任务（通过Enter键）
  const handleQuickAddTask = useCallback(async () => {
    if (tempTaskTitle.trim()) {
      // 定义默认颜色数组
      const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', '#8338EC', '#3A86FF'];
      // 随机选择一个颜色
      const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
      
      const newTask: CreateTaskData = {
        title: tempTaskTitle.trim(),
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.NONE,
        color: randomColor, // 添加随机颜色
        project: user?.defaultProjectId || '',
        tags: [],
        createdBy: user?.id || '',
      }
      await createTask(newTask);
      setTempTaskTitle(''); // 清空输入框
      // 不需要手动更新tasks状态，因为createTask函数会通过context自动更新
    }
  }, [tempTaskTitle, createTask, user]);

  // 处理搜索
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilter({ ...filter, search: query || undefined });
  }, [filter, setFilter]);

  // 处理日期过滤
  const handleDateFilter = useCallback((date: string)=>{
    setFilter({...filter, date: date})
  },[filter, setFilter])

  // 处理状态过滤
  const handleStatusFilter = useCallback((status: TaskStatus | undefined) => {
    setFilter({ ...filter, status });
  }, [filter, setFilter]);

  // 处理优先级过滤
  const handlePriorityFilter = useCallback((priority: TaskPriority | undefined) => {
    setFilter({ ...filter, priority });
  }, [filter, setFilter]);

  // 处理视图切换 - 使用路由导航
  const handleViewChange = useCallback((view: ViewType) => {
    // 导航到对应的子路由
    navigate(`/tasks/${view}`);
  }, [navigate]);

  // 确保路由变化时重新加载任务
  // 使用一个ref来记录上一次的视图，避免不必要的重复加载
  const prevViewRef = useRef(currentView);
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      prevViewRef.current = currentView;
      getTasks();
    }
  }, [currentView]);

  return (
    <div className={`task-organizer ${currentView}`}>
      {/* 头部工具栏 */}
      <div className="task-organizer-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className='create-section'>
          <div className="create-task-input-wrapper">
            <span className="create-task-icon">+</span>
            <input
              type="text"
              placeholder="创建新任务..."
              className="create-input"
              value={tempTaskTitle}
              onChange={(e) => setTempTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tempTaskTitle.trim()) {
                  handleQuickAddTask();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOrganizer;