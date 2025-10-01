import { useContext } from 'react';
import { TaskContext, TaskContextType } from '../contexts/TaskContext';

/**
 * useTask Hook - 用于访问任务状态和操作
 * 
 * 使用示例:
 * ```tsx
 * const { 
 *   tasks, 
 *   loading, 
 *   error, 
 *   createTask, 
 *   updateTask, 
 *   deleteTask 
 * } = useTask();
 * ```
 */
export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  
  if (context === undefined) {
    throw new Error('useTask 必须在 TaskProvider 内部使用');
  }
  
  return context;
};

/**
 * 任务操作相关的 Hook
 * 提供常用的任务操作方法和状态
 */
export const useTaskOperations = () => {
  const {
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    reorderTasks,
    moveTaskToBoard,
    loading,
    error,
    clearError
  } = useTask();

  return {
    // 操作方法
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    reorderTasks,
    moveTaskToBoard,
    
    // 状态
    loading,
    error,
    clearError,
    
    // 便捷方法
    isLoading: loading,
    hasError: !!error
  };
};

/**
 * 任务过滤和排序相关的 Hook
 */
export const useTaskFilters = () => {
  const {
    tasks,
    filter,
    sortBy,
    sortOrder,
    setFilter,
    setSorting,
    getTasks
  } = useTask();

  // 应用过滤器和排序的任务列表
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // 状态过滤
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      
      // 优先级过滤
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }
      
      // 项目过滤
      if (filter.projectId && task.project !== filter.projectId) {
        return false;
      }
      
      // 分配者过滤
      if (filter.assignee && task.assignee !== filter.assignee) {
        return false;
      }
      
      // 搜索过滤
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'priority':
          // 优先级排序: urgent > high > medium > low
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return {
    // 数据
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    filter,
    sortBy,
    sortOrder,
    
    // 操作方法
    setFilter,
    setSorting,
    getTasks,
    
    // 便捷方法
    clearFilters: () => setFilter({}),
    setStatusFilter: (status: string | undefined) => setFilter({ status: status as any }),
    setPriorityFilter: (priority: string | undefined) => setFilter({ priority: priority as any }),
    setProjectFilter: (projectId: string | undefined) => setFilter({ projectId }),
    setAssigneeFilter: (assignee: string | undefined) => setFilter({ assignee }),
    setSearchFilter: (search: string | undefined) => setFilter({ search }),
    
    // 统计信息
    totalTasks: tasks.length,
    filteredTasks: filteredAndSortedTasks.length,
    todoCount: tasks.filter(task => task.status === 'todo').length,
    inProgressCount: tasks.filter(task => task.status === 'in_progress').length,
    doneCount: tasks.filter(task => task.status === 'done').length
  };
};

/**
 * 当前任务相关的 Hook
 */
export const useCurrentTask = () => {
  const {
    currentTask,
    setCurrentTask,
    getTask,
    updateTask,
    loading,
    error
  } = useTask();

  return {
    // 数据
    currentTask,
    
    // 操作方法
    setCurrentTask,
    loadTask: getTask,
    updateCurrentTask: currentTask ? 
      (updates: Partial<any>) => updateTask(currentTask.id, updates) : 
      undefined,
    
    // 状态
    loading,
    error,
    
    // 便捷属性
    hasCurrentTask: !!currentTask,
    currentTaskId: currentTask?.id
  };
};

export default useTask;