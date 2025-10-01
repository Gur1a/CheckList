import { Task, TaskStatus, TaskPriority, ApiResponse, PaginationParams, PaginatedResponse, Tag, Project} from '../../../shared/types';

import apiClient from '../utils/apiClient';
import { API_ENDPOINTS, buildURLWithParams } from '../utils/apiEndpoints';

// 任务创建数据类型
export interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  reminder?: Date;
  tags: string[];
  assignee?: string;
  project: string;
  boardId?: string;
  createdBy: string;
}

// 任务更新数据类型
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  reminder?: Date;
  tags?: Tag[];
  assignee?: string;
  boardId?: string;
  project?: string;
  projectInfo?: Project;
}

// 任务查询过滤器
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  boardId?: string;
  assignee?: string;
  search?: string;
  tags?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdBy?: string;
}

// 任务排序选项
export interface TaskSortOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title' | 'order';
  sortOrder?: 'asc' | 'desc';
}

// 批量操作数据类型
export interface BulkUpdateData {
  taskIds: string[];
  updates: UpdateTaskData;
}

export interface BulkDeleteData {
  taskIds: string[];
}

// 任务重排序数据类型
export interface ReorderTasksData {
  taskUpdates: Array<{
    id: string;
    order: number;
    boardId?: string;
  }>;
}

export class TaskService {
  /**
   * 创建新任务
   */
  static async create(taskData: CreateTaskData): Promise<ApiResponse<Task>> {
    try {
      // 映射字段：将前端的projectId和boardId映射到后端期望的project和board字段
      const backendTaskData = {
        ...taskData,
        project: taskData.project,
        board: taskData.boardId,
        // 移除前端特有的字段名
        projectId: undefined,
        boardId: undefined
      };

      const response = await apiClient.post<Task>(
        API_ENDPOINTS.TASKS.CREATE,
        backendTaskData
      );
      return response;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务列表
   */
  static async getList(
    filters?: TaskFilters,
    pagination?: PaginationParams,
    sorting?: TaskSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sorting,
        // 日期格式化
        dueDateFrom: filters?.dueDateFrom?.toISOString(),
        dueDateTo: filters?.dueDateTo?.toISOString()
      };

      const response = await apiClient.get<PaginatedResponse<Task>>(
        buildURLWithParams(API_ENDPOINTS.TASKS.LIST, params)
      );
      return response;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取任务详情
   */
  static async getById(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.get<Task>(
        API_ENDPOINTS.TASKS.GET_BY_ID.replace(':id', taskId)
      );
      return response;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw error;
    }
  }


  /*
   * 根据用户ID获取任务列表
   */
  static async getByUserId(userId: string): Promise<ApiResponse<Task[]>> {
    try {
      const response = await apiClient.get<Task[]>(
        API_ENDPOINTS.TASKS.GET_BY_USER_ID.replace(':userId', userId.toString())
      );
      return response;
    } catch (error) {
      console.error('获取用户任务列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新任务
   */
  static async update(taskId: string, updateData: UpdateTaskData): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.put<Task>(
        API_ENDPOINTS.TASKS.UPDATE.replace(':id', taskId),
        {
          ...updateData,
          // 日期格式化
          dueDate: updateData.dueDate?.toISOString(),
          reminder: updateData.reminder?.toISOString()
        }
      );
      return response;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  /**
   * 删除任务
   */
  static async delete(taskId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.TASKS.DELETE.replace(':id', taskId)
      );
      return response;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新任务
   */
  static async bulkUpdate(bulkData: BulkUpdateData): Promise<ApiResponse<Task[]>> {
    try {
      const response = await apiClient.patch<Task[]>(
        API_ENDPOINTS.TASKS.BULK_UPDATE,
        {
          ...bulkData,
          updates: {
            ...bulkData.updates,
            // 日期格式化
            dueDate: bulkData.updates.dueDate?.toISOString(),
            reminder: bulkData.updates.reminder?.toISOString()
          }
        }
      );
      return response;
    } catch (error) {
      console.error('批量更新任务失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除任务
   */
  static async bulkDelete(bulkData: BulkDeleteData): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.TASKS.BULK_DELETE,
        { body: JSON.stringify(bulkData), headers: { 'Content-Type': 'application/json' } }
      );
      return response;
    } catch (error) {
      console.error('批量删除任务失败:', error);
      throw error;
    }
  }

  /**
   * 重新排序任务
   */
  static async reorder(reorderData: ReorderTasksData): Promise<ApiResponse<Task[]>> {
    try {
      const response = await apiClient.patch<Task[]>(
        API_ENDPOINTS.TASKS.REORDER,
        reorderData
      );
      return response;
    } catch (error) {
      console.error('任务重排序失败:', error);
      throw error;
    }
  }

  /**
   * 移动任务到不同看板
   */
  static async moveToBoard(
    taskId: string, 
    boardId: string, 
    newOrder: number
  ): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<Task>(
        API_ENDPOINTS.TASKS.MOVE_TO_BOARD.replace(':id', taskId),
        {
          boardId,
          order: newOrder
        }
      );
      return response;
    } catch (error) {
      console.error('移动任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取项目下的任务
   */
  static async getByProject(
    projectId: string,
    filters?: Omit<TaskFilters, 'projectId'>,
    pagination?: PaginationParams,
    sorting?: TaskSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sorting,
        // 日期格式化
        dueDateFrom: filters?.dueDateFrom?.toISOString(),
        dueDateTo: filters?.dueDateTo?.toISOString()
      };

      const response = await apiClient.get<PaginatedResponse<Task>>(
        buildURLWithParams(API_ENDPOINTS.TASKS.BY_PROJECT.replace(':projectId', projectId), params)
      );
      return response;
    } catch (error) {
      console.error('获取项目任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取看板下的任务
   */
  static async getByBoard(
    boardId: string,
    pagination?: PaginationParams,
    sorting?: TaskSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      const params = {
        ...pagination,
        ...sorting
      };

      const response = await apiClient.get<PaginatedResponse<Task>>(
        buildURLWithParams(API_ENDPOINTS.TASKS.BY_BOARD.replace(':boardId', boardId), params)
      );
      return response;
    } catch (error) {
      console.error('获取看板任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户分配的任务
   */
  static async getByAssignee(
    assignee: string,
    filters?: Omit<TaskFilters, 'assignee'>,
    pagination?: PaginationParams,
    sorting?: TaskSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sorting,
        // 日期格式化
        dueDateFrom: filters?.dueDateFrom?.toISOString(),
        dueDateTo: filters?.dueDateTo?.toISOString()
      };

      const response = await apiClient.get<PaginatedResponse<Task>>(
        buildURLWithParams(API_ENDPOINTS.TASKS.BY_ASSIGNEE.replace(':assignee', assignee), params)
      );
      return response;
    } catch (error) {
      console.error('获取用户任务失败:', error);
      throw error;
    }
  }

  /**
   * 搜索任务
   */
  static async search(
    searchQuery: string,
    filters?: TaskFilters,
    pagination?: PaginationParams,
    sorting?: TaskSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      const params = {
        q: searchQuery,
        ...filters,
        ...pagination,
        ...sorting,
        // 日期格式化
        dueDateFrom: filters?.dueDateFrom?.toISOString(),
        dueDateTo: filters?.dueDateTo?.toISOString()
      };

      const response = await apiClient.get<PaginatedResponse<Task>>(
        buildURLWithParams(API_ENDPOINTS.TASKS.SEARCH, params)
      );
      return response;
    } catch (error) {
      console.error('搜索任务失败:', error);
      throw error;
    }
  }

  /**
   * 复制任务
   */
  static async duplicate(taskId: string, newTitle?: string): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.post<Task>(
        API_ENDPOINTS.TASKS.DUPLICATE.replace(':id', taskId),
        { title: newTitle }
      );
      return response;
    } catch (error) {
      console.error('复制任务失败:', error);
      throw error;
    }
  }

  /**
   * 完成任务
   */
  static async complete(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<Task>(
        API_ENDPOINTS.TASKS.COMPLETE.replace(':id', taskId)
      );
      return response;
    } catch (error) {
      console.error('完成任务失败:', error);
      throw error;
    }
  }

  /**
   * 重新激活任务
   */
  static async reactivate(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<Task>(
        API_ENDPOINTS.TASKS.REACTIVATE.replace(':id', taskId)
      );
      return response;
    } catch (error) {
      console.error('重新激活任务失败:', error);
      throw error;
    }
  }

  /**
   * 归档任务
   */
  static async archive(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<Task>(
        API_ENDPOINTS.TASKS.ARCHIVE.replace(':id', taskId)
      );
      return response;
    } catch (error) {
      console.error('归档任务失败:', error);
      throw error;
    }
  }
}

export default TaskService;