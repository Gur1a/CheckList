import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { Task, TaskStatus, TaskPriority, ApiResponse, Tag, Project,AuthContextType} from '../../../shared/types';
import { ApiError, NetworkError } from '../utils/apiClient';
import TaskService, { CreateTaskData, UpdateTaskData, TaskFilters} from '../services/taskService';
import { TagService } from '../services/tagService';
import {ProjectService} from '@/services/projectService'
import useAuth from '@/hooks/useAuth';

// Task Context 状态类型
export interface TaskState {
  userTags: Tag[];
  userProjects: Project[];
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filter: {
    date?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    tagId?: string;
    assignee?: string;
    search?: string;
  };
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  // 存储任务ID与标签列表的映射
  taskTagsMap: Record<string, Tag[]>;
}

// Task Context 类型
export interface TaskContextType extends TaskState {
  // CRUD 操作
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (taskId: string, updates: UpdateTaskData) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTask: (taskId: string) => Promise<void>;
  getTasks: (filters?: TaskFilters) => Promise<void>;
  getTaskTags: (taskId: string) => Promise<void>;
  
  // 状态管理
  setCurrentTask: (task: Task | null) => void;
  setUserProjects: (projects: Project[]) => void
  setFilter: (filter: Partial<TaskState['filter']>) => void;
  setTasks: (tasks: Task[]) => void;
  setSorting: (sortBy: TaskState['sortBy'], sortOrder: TaskState['sortOrder']) => void;
  clearError: () => void;
  clearTasks: () => void;
  
  // 批量操作
  bulkUpdateTasks: (taskIds: string[], updates: UpdateTaskData) => Promise<void>;
  bulkDeleteTasks: (taskIds: string[]) => Promise<void>;
  
  // 拖拽排序
  reorderTasks: (taskIds: string[], newOrders: number[]) => Promise<void>;
  moveTaskToBoard: (taskId: string, boardId: string, newOrder: number) => Promise<void>;
  
  // 标签管理
  addTagToTask: (taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;
  updateTaskTags: (taskId: string, tags: Tag[]) => void;
  setUserTags: (tags: Tag[]) => void;

}

// Action 类型定义
type TaskAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_USER_TAGS'; payload: Tag[] }
  | { type: "SET_USER_PROJECTS"; payload: Project[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CURRENT_TASK'; payload: Task | null }
  | { type: 'SET_FILTER'; payload: Partial<TaskState['filter']> }
  | { type: 'SET_SORTING'; payload: { sortBy: TaskState['sortBy']; sortOrder: TaskState['sortOrder'] } }
  | { type: 'CLEAR_TASKS' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_TASK_TAGS'; payload: { taskId: string; tags: Tag[] } }
  | { type: 'ADD_TASK_TAG'; payload: { taskId: string; tag: Tag } }
  | { type: 'REMOVE_TASK_TAG'; payload: { taskId: string; tagId: string } };
  

// 初始状态
const initialState: TaskState = {
  userTags: [],
  userProjects: [],
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filter: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  taskTagsMap: {}
};

// Reducer 函数
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_USER_PROJECTS':
      return {
        ...state,
        userProjects: action.payload,
      }
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false,
        error: null
      };
    
    case 'UPDATE_TASK':
      console.log('Reducer - UPDATE_TASK:', action.payload);
      const updatedTasks = state.tasks.map(task => 
        task.id === action.payload.id 
          ? { ...task, ...action.payload.updates }
          : task
      );
      console.log('Reducer - updated tasks:', updatedTasks);
      
      const updatedCurrentTask = state.currentTask?.id === action.payload.id 
        ? { ...state.currentTask, ...action.payload.updates }
        : state.currentTask;
      console.log('Reducer - updated currentTask:', updatedCurrentTask);
      
      return {
        ...state,
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
        loading: false,
        error: null
      };
    
    case 'DELETE_TASK':
      // 创建一个新对象，排除要删除的任务ID对应的标签映射
      const newTaskTagsMap = { ...state.taskTagsMap };
      delete newTaskTagsMap[action.payload];
      
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        currentTask: state.currentTask?.id === action.payload ? null : state.currentTask,
        loading: false,
        error: null,
        taskTagsMap: newTaskTagsMap 
      };
    
    case 'SET_CURRENT_TASK':
      return {
        ...state,
        currentTask: action.payload
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload }
      };
    
    case 'SET_SORTING':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };
    
    case 'CLEAR_TASKS':
      return {
        ...state,
        tasks: [],
        currentTask: null,
        taskTagsMap: {}
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'UPDATE_TASK_TAGS':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.taskId 
            ? { ...task, tags: action.payload.tags }
            : task
        ),
        currentTask: state.currentTask?.id === action.payload.taskId
          ? { ...state.currentTask, tags: action.payload.tags }
          : state.currentTask,
        taskTagsMap: {
          ...state.taskTagsMap,
          [action.payload.taskId]: action.payload.tags
        }
      };
    
    case 'ADD_TASK_TAG':
      return {
        ...state,
        taskTagsMap: {
          ...state.taskTagsMap,
          [action.payload.taskId]: [
            ...(state.taskTagsMap[action.payload.taskId] || []),
            action.payload.tag
          ]
        }
      };
    
    case 'REMOVE_TASK_TAG':
      return {
        ...state,
        taskTagsMap: {
          ...state.taskTagsMap,
          [action.payload.taskId]: state.taskTagsMap[action.payload.taskId]?.filter(
            tag => tag.id !== action.payload.tagId
          ) || []
        }
      };

    case 'SET_USER_TAGS':
      return {
        ...state,
        userTags: action.payload
      };
      
    default:
      return state;
  }
};


// 创建 Context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// TaskProvider 组件
interface TaskProviderProps {
  children: ReactNode;
}

const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // 数据初始化
    useEffect(() => {
      if(!user) return;
      const load = async () => {
        try {
          
          if (user) {
            // 使用 Promise.all 并行加载数据
            const [tasksData, projectsData, tagsData] = await Promise.all([
              TaskService.getByUserId(user.id),
              ProjectService.getByUserId(user.id),
              TagService.getTags()
            ]);
  
            if (tasksData.data) {
              console.log("加载任务成功:", tasksData.data);
              setTasks(tasksData.data);
            }
  
            if (projectsData.data) {
              console.log("加载项目成功:", projectsData.data);
              setUserProjects(projectsData.data?.items || []);
            }
  
            if (tagsData.data) {
              console.log("加载标签成功:", tagsData.data);
              setUserTags(tagsData.data);
            }
          }
        } catch (error) {
          console.error("加载失败:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      load();
  
    }, [user]);


  // 错误处理辅助函数
  const handleError = (error: unknown): string => {
    console.error('任务操作错误:', error);
    
    if (error instanceof ApiError) {
      return error.message;
    } else if (error instanceof NetworkError) {
      return '网络连接失败，请检查网络状态';
    } else if (error instanceof Error) {
      return error.message;
    }
    
    return '操作失败，请稍后重试';
  };
  
  // 创建任务
  const createTask = async (taskData: CreateTaskData): Promise<void> => {
    console.log('context-createTask', taskData);
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // 后端创建任务
      const response = await TaskService.create(taskData);
      
      // 前端添加任务到状态
      if (response.success && response.data) {
        dispatch({ type: 'ADD_TASK', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '创建任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 更新任务
  const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('context-updateTask', taskId, updates);
      
      // 先调用API更新任务
      const response = await TaskService.update(taskId, updates);
      
      // 如果API调用成功，再更新本地状态
      if (response.success && response.data) {
        console.log('context-updateTask success, updating local state with:', response.data);
        dispatch({ 
          type: 'UPDATE_TASK', 
          payload: { 
            id: taskId, 
            updates: response.data  // 使用API返回的数据而不是传入的updates
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '更新任务失败' });
      }
    } catch (error) {
      console.error('context-updateTask error:', error);
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 删除任务
  const deleteTask = async (taskId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.delete(taskId);
      
      if (response.success) {
        dispatch({ type: 'DELETE_TASK', payload: taskId });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '删除任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 获取单个任务
  const getTask = async (taskId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.getById(taskId);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CURRENT_TASK', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '获取任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 获取任务列表
  const getTasks = async (filters?: TaskFilters): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.getList(filters);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_TASKS', payload: response.data.items });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '获取任务列表失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 
  const setTasks = (tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }

  // 批量更新任务
  const bulkUpdateTasks = async (taskIds: string[], updates: UpdateTaskData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.bulkUpdate({ taskIds, updates });
      
      if (response.success && response.data) {
        response.data.forEach(updatedTask => {
          dispatch({ 
            type: 'UPDATE_TASK', 
            payload: { 
              id: updatedTask.id, 
              updates: updatedTask
            }
          });
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '批量更新失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 批量删除任务
  const bulkDeleteTasks = async (taskIds: string[]): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.bulkDelete({ taskIds });
      
      if (response.success) {
        taskIds.forEach(taskId => {
          dispatch({ type: 'DELETE_TASK', payload: taskId });
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '批量删除失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 重新排序任务
  const reorderTasks = async (taskIds: string[], newOrders: number[]): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const taskUpdates = taskIds.map((taskId, index) => ({
        id: taskId,
        order: newOrders[index]
      }));
      
      const response = await TaskService.reorder({ taskUpdates });
      
      if (response.success && response.data) {
        response.data.forEach(updatedTask => {
          dispatch({ 
            type: 'UPDATE_TASK', 
            payload: { 
              id: updatedTask.id, 
              updates: updatedTask
            }
          });
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '重新排序失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 移动任务到不同看板
  const moveTaskToBoard = async (taskId: string, boardId: string, newOrder: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TaskService.moveToBoard(taskId, boardId, newOrder);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'UPDATE_TASK', 
          payload: { 
            id: taskId, 
            updates: response.data
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '移动任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 设置项目列表
  const setUserProjects = (projects: Project[]): void => {
    dispatch({ type: 'SET_USER_PROJECTS', payload: projects });
  };

  // 设置当前任务
  const setCurrentTask = (task: Task | null): void => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: task });
  };

  // 设置过滤器
  const setFilter = (filter: Partial<TaskState['filter']>): void => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // 设置排序
  const setSorting = (sortBy: TaskState['sortBy'], sortOrder: TaskState['sortOrder']): void => {
    dispatch({ type: 'SET_SORTING', payload: { sortBy, sortOrder } });
  };

  // 清除错误
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 清除任务
  const clearTasks = (): void => {
    dispatch({ type: 'CLEAR_TASKS' });
  };

  // 获取任务标签
  const getTaskTags = async (taskId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // 使用正确的API端点路径，后端TagController实现了此功能
      const response = await TagService.getTagsForTask(taskId);
      console.log(`成功获取任务 ${taskId} 的标签:`, response.data);
      if (response.success && response.data) {
        
        dispatch({ 
          type: 'UPDATE_TASK_TAGS', 
          payload: { taskId, tags: response.data}
        });
    
      } else {
        // 如果获取失败，至少设置一个空数组
        dispatch({ 
          type: 'UPDATE_TASK_TAGS', 
          payload: { taskId, tags: [] }
        });

      }
    } catch (error) {
      console.error('获取任务标签失败:', error);
      // 出错时也设置空数组，避免后续操作出错
      dispatch({ 
        type: 'UPDATE_TASK_TAGS', 
        payload: { taskId, tags: [] }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 为任务添加标签
  const addTagToTask = async (taskId: string, tagId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TagService.addTagToTask(taskId, tagId);
      
      if (response.success) {
        // 添加成功后，尝试获取标签信息并更新状态
        const tagResponse = await TagService.getTags();
        const tag = tagResponse.data?.find(t => t.id === tagId);
        
        if (tag) {
          dispatch({ 
            type: 'ADD_TASK_TAG', 
            payload: { taskId, tag }
          });
        } else {
          // 如果无法获取标签信息，重新获取整个任务的标签列表
          await getTaskTags(taskId);
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '添加标签失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 从任务中移除标签
  const removeTagFromTask = async (taskId: string, tagId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await TagService.removeTagFromTask(taskId, tagId);
      
      if (response.success) {
        dispatch({ 
          type: 'REMOVE_TASK_TAG', 
          payload: { taskId, tagId }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '移除标签失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleError(error) });
    }
  };

  // 更新任务标签（用于批量设置标签）
  const updateTaskTags = (taskId: string, tags: Tag[]): void => {
    dispatch({ 
      type: 'UPDATE_TASK_TAGS', 
      payload: { taskId, tags }
    });
  };

  const setUserTags = (tags: Tag[]): void => {
    dispatch({ type: 'SET_USER_TAGS', payload: tags });
  };

  // Context 值
  const contextValue: TaskContextType = {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getTasks,
    setCurrentTask,
    setFilter,
    setSorting,
    setUserProjects,
    setTasks,
    clearError,
    clearTasks,
    bulkUpdateTasks,
    bulkDeleteTasks,
    reorderTasks,
    moveTaskToBoard,
    getTaskTags,
    addTagToTask,
    removeTagFromTask,
    updateTaskTags,
    setUserTags,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
    
  );
};

export { TaskContext, TaskProvider };
export default TaskContext;