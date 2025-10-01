import { Op } from 'sequelize';
import initializeModels from '../models/index';
import { AppError } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { TaskRepository } from '../repositories/TaskRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { TaskStatus } from '../types/shared';

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private historyRepository: HistoryRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.historyRepository = new HistoryRepository();
  }

  // 获取任务列表
  async getTasks(filters: any = {}, options: { page: number; limit: number } = { page: 1, limit: 20 }) {
    try {
      const result = await this.taskRepository.findAndCountAll(filters, options);
      
      return {
        items: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / options.limit),
        currentPage: options.page,
        hasNextPage: options.page < Math.ceil(result.count / options.limit),
        hasPrevPage: options.page > 1
      };
    } catch (error) {
      log.error('获取任务列表失败', error);
      throw new AppError('获取任务列表失败', 500, 'TASK_LIST_FAILED');
    }
  }

  // 创建任务
  async createTask(taskData: any, userId: number) {
    try {
      // 验证用户是否有权限创建任务
      if (taskData.project) {
        const project = await this.projectRepository.findById(taskData.project);
        if (!project) {
          throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查用户是否有权限访问该项目
        // 这里可以添加更详细的权限检查逻辑
      }

      // 设置创建者
      taskData.createdBy = userId;
      console.log('创建任务', taskData);
      // 创建任务
      const task = await this.taskRepository.create(taskData);
      
      // // 记录历史
      // await this.historyRepository.recordHistory({
      //   entityType: 'task',
      //   entityId: task.id,
      //   entityModel: 'Task',
      //   action: 'create',
      //   performedBy: userId,
      //   project: taskData.project,
      //   description: `创建了任务 "${task.title}"`
      // });
      
      return task;
    } catch (error) {
      log.error('创建任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('创建任务失败', 500, 'TASK_CREATE_FAILED');
    }
  }

  // 获取单个任务
  async getTaskById(taskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限访问该任务
      // 这里可以添加权限检查逻辑
      
      return task;
    } catch (error) {
      log.error('获取任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('获取任务失败', 500, 'TASK_GET_FAILED');
    }
  }
  
  // 获取用户任务列表
  async getTasksByUserId(userId: number) {
    try {
      const tasks = await this.taskRepository.findByUserId(userId);
      return tasks;
    } catch (error) {
      log.error('获取用户任务列表失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('获取用户任务列表失败', 500, 'TASK_GET_FAILED');
    }
  }

  // 更新任务
  async updateTask(taskId: number, taskData: any, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      // 保存更新前的状态用于历史记录
      const oldTask = { ...task.get() };
      
      // 更新任务
      const updatedTask = await this.taskRepository.update(taskId, taskData);
      
      // 记录历史
      const changes: Record<string, any> = {};
      Object.keys(taskData).forEach(key => {
        if (oldTask[key] !== taskData[key]) {
          changes[key] = {
            old: oldTask[key],
            new: taskData[key]
          };
        }
      });
      
      if (Object.keys(changes).length > 0) {
        await this.historyRepository.recordHistory({
          entityType: 'task',
          entityId: taskId,
          entityModel: 'Task',
          action: 'update',
          changes,
          performedBy: userId,
          project: updatedTask.project,
          description: `更新了任务 "${updatedTask.title}"`
        });
      }
      
      return updatedTask;
    } catch (error) {
      log.error('更新任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('更新任务失败', 500, 'TASK_UPDATE_FAILED');
    }
  }

  // 删除任务
  async deleteTask(taskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限删除该任务
      // 这里可以添加权限检查逻辑
      
      // 删除任务
      await this.taskRepository.delete(taskId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'delete',
        performedBy: userId,
        project: task.project,
        description: `删除了任务 "${task.title}"`
      });
      
    } catch (error) {
      log.error('删除任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('删除任务失败', 500, 'TASK_DELETE_FAILED');
    }
  }

  // 批量更新任务
  async bulkUpdateTasks(taskIds: number[], updates: any, userId: number) {
    try {
      const updatedTasks = await this.taskRepository.bulkUpdate(taskIds, updates);
      
      // 记录历史
      for (const taskId of taskIds) {
        const task = await this.taskRepository.findById(taskId);
        if (task) {
          await this.historyRepository.recordHistory({
            entityType: 'task',
            entityId: taskId,
            entityModel: 'Task',
            action: 'update',
            changes: updates,
            performedBy: userId,
            project: task.project,
            description: `批量更新了任务 "${task.title}"`
          });
        }
      }
      
      return updatedTasks;
    } catch (error) {
      log.error('批量更新任务失败', error);
      throw new AppError('批量更新任务失败', 500, 'TASK_BULK_UPDATE_FAILED');
    }
  }

  // 批量删除任务
  async bulkDeleteTasks(taskIds: number[], userId: number) {
    try {
      // 获取任务信息用于历史记录
      const tasks = await this.taskRepository.findByIds(taskIds);
      
      // 删除任务
      await this.taskRepository.bulkDelete(taskIds, userId);
      
      // 记录历史
      for (const task of tasks) {
        await this.historyRepository.recordHistory({
          entityType: 'task',
          entityId: task.id,
          entityModel: 'Task',
          action: 'delete',
          performedBy: userId,
          project: task.project,
          description: `批量删除了任务 "${task.title}"`
        });
      }
      
    } catch (error) {
      log.error('批量删除任务失败', error);
      throw new AppError('批量删除任务失败', 500, 'TASK_BULK_DELETE_FAILED');
    }
  }

  // 重新排序任务
  async reorderTasks(updates: Array<{ id: number; order: number; board?: number }>, userId: number) {
    try {
      const updatedTasks = await this.taskRepository.reorder(updates);
      
      // 记录历史
      for (const update of updates) {
        const task = await this.taskRepository.findById(update.id);
        if (task) {
          await this.historyRepository.recordHistory({
            entityType: 'task',
            entityId: update.id,
            entityModel: 'Task',
            action: 'move',
            performedBy: userId,
            project: task.project,
            description: `重新排序了任务 "${task.title}"`
          });
        }
      }
      
      return updatedTasks;
    } catch (error) {
      log.error('任务排序更新失败', error);
      throw new AppError('任务排序更新失败', 500, 'TASK_REORDER_FAILED');
    }
  }

  // 移动任务到看板
  async moveToBoard(taskId: number, boardId: number, order: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      const updatedTask = await this.taskRepository.update(taskId, { board: boardId, order });
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'move',
        performedBy: userId,
        project: updatedTask.project,
        description: `将任务 "${updatedTask.title}" 移动到看板`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('移动任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('移动任务失败', 500, 'TASK_MOVE_FAILED');
    }
  }

  // 搜索任务
  async searchTasks(query: string, userId: number, options: { page: number; limit: number }) {
    try {
      const result = await this.taskRepository.search(query, options);
      
      return {
        items: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / options.limit),
        currentPage: options.page,
        hasNextPage: options.page < Math.ceil(result.count / options.limit),
        hasPrevPage: options.page > 1
      };
    } catch (error) {
      log.error('搜索任务失败', error);
      throw new AppError('搜索任务失败', 500, 'TASK_SEARCH_FAILED');
    }
  }

  // 复制任务
  async duplicateTask(taskId: number, userId: number) {
    try {
      const originalTask = await this.taskRepository.findById(taskId);
      
      if (!originalTask) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 创建新任务数据
      const newTaskData = {
        ...originalTask.get(),
        title: `${originalTask.title} (副本)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        completedAt: undefined,
        archivedAt: undefined
      };
      
      const duplicatedTask = await this.taskRepository.create(newTaskData);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: duplicatedTask.id,
        entityModel: 'Task',
        action: 'create',
        performedBy: userId,
        project: duplicatedTask.project,
        description: `复制了任务 "${originalTask.title}"`
      });
      
      return duplicatedTask;
    } catch (error) {
      log.error('复制任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('复制任务失败', 500, 'TASK_DUPLICATE_FAILED');
    }
  }

  // 完成任务
  async completeTask(taskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      const updatedTask = await this.taskRepository.update(taskId, { 
        status: TaskStatus.DONE,
        completedAt: new Date()
      });
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'complete',
        performedBy: userId,
        project: updatedTask.project,
        description: `完成了任务 "${updatedTask.title}"`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('完成任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('完成任务失败', 500, 'TASK_COMPLETE_FAILED');
    }
  }

  // 重新激活任务
  async reactivateTask(taskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      const updatedTask = await this.taskRepository.update(taskId, { 
        status: TaskStatus.TODO,
        completedAt: null
      });
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `重新激活了任务 "${updatedTask.title}"`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('重新激活任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('重新激活任务失败', 500, 'TASK_REACTIVATE_FAILED');
    }
  }

  // 归档任务
  async archiveTask(taskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      const updatedTask = await this.taskRepository.update(taskId, { 
        status: TaskStatus.ARCHIVED,
        archivedAt: new Date()
      });
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'archive',
        performedBy: userId,
        project: updatedTask.project,
        description: `归档了任务 "${updatedTask.title}"`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('归档任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('归档任务失败', 500, 'TASK_ARCHIVE_FAILED');
    }
  }

  // 添加子任务
  async addSubtask(taskId: number, title: string, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.addSubtask(taskId, title);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `为任务 "${updatedTask.title}" 添加了子任务 "${title}"`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('添加子任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('添加子任务失败', 500, 'TASK_ADD_SUBTASK_FAILED');
    }
  }

  // 切换子任务状态
  async toggleSubtask(taskId: number, subtaskId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.toggleSubtask(taskId, subtaskId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `切换了任务 "${updatedTask.title}" 的子任务状态`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('切换子任务状态失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('切换子任务状态失败', 500, 'TASK_TOGGLE_SUBTASK_FAILED');
    }
  }

  // 添加评论
  async addComment(taskId: number, content: string, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.addComment(taskId, content, userId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `为任务 "${updatedTask.title}" 添加了评论`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('添加评论失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('添加评论失败', 500, 'TASK_ADD_COMMENT_FAILED');
    }
  }

  // 添加观察者
  async addWatcher(taskId: number, watcherId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.addWatcher(taskId, watcherId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `为任务 "${updatedTask.title}" 添加了观察者`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('添加观察者失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('添加观察者失败', 500, 'TASK_ADD_WATCHER_FAILED');
    }
  }

  // 移除观察者
  async removeWatcher(taskId: number, watcherId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.removeWatcher(taskId, watcherId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'update',
        performedBy: userId,
        project: updatedTask.project,
        description: `为任务 "${updatedTask.title}" 移除了观察者`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('移除观察者失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('移除观察者失败', 500, 'TASK_REMOVE_WATCHER_FAILED');
    }
  }

  // 移动任务到其他项目
  async moveTask(taskId: number, projectId: number, userId: number) {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new AppError('任务不存在', 404, 'TASK_NOT_FOUND');
      }
      
      // 检查用户是否有权限更新该任务
      // 这里可以添加权限检查逻辑
      
      const updatedTask = await this.taskRepository.moveTask(taskId, projectId, userId);
      
      // 记录历史
      await this.historyRepository.recordHistory({
        entityType: 'task',
        entityId: taskId,
        entityModel: 'Task',
        action: 'move',
        performedBy: userId,
        project: updatedTask.project,
        description: `将任务 "${task.title}" 移动到项目 ${projectId}`
      });
      
      return updatedTask;
    } catch (error) {
      log.error('移动任务失败', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('移动任务失败', 500, 'TASK_MOVE_FAILED');
    }
  }
}